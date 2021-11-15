(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process,global){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process,global){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("/reverso/reqFrame.js",function(require,module,exports,__dirname,__filename,process,global){/**
 * requestAnimationFrame and cancel polyfill
 */
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
				       timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

});

require.define("/node_modules/uxer-show/package.json",function(require,module,exports,__dirname,__filename,process,global){module.exports = {"main":"uxer-show.js"}
});

require.define("/node_modules/uxer-show/index.js",function(require,module,exports,__dirname,__filename,process,global){'use strict'

var setStage = require('./setStage');
var prefixer = require('./prefix');

module.exports = show

var offset = 0;
var prefix = prefixer().css;
var currentIndex = 0;

function show(title, direction){	
	var theatre = setStage(title, direction);
	var stage = theatre.stage;
	var players = theatre.players;
  var property = direction.toLowerCase() == 'left' ? 'width' : 'height';
  var t = direction.toLowerCase() == 'left' ? 'x' : 'y';
  var locked = false;
	
	return {goTo: centerPiece, next: next, prev: prev}

	function centerPiece(el){
/*		if(locked) return;
		locked = true;
		setTimeout(function(){
			locked = false;
		},667);
*/		if('string' == typeof el) el = doc.getElementById(el);
		else if(!(isNaN(el))) el = players[el];
 		if(!el) throw new Error('No element');

		show(title, direction, currentIndex);

    var set = (stage.uxer[property] / 2) - (el.uxer[property] / 2);
		var cue = (el.uxer[direction] + offset);
		var diff = set - cue + offset;
		var count = players.length;
		
		players.forEach(function(e, i){
			
			e.addEventListener('transitionend', function(e){
				count-=1;
				if(count===0) {
					locked = false;
			  }
				e.target.removeEventListener('transitionend', function(){});
			});

			if (e.id === el.id) {
			  if (e.classList){
			    e.classList.add('scene');					
			  }
			  else {
			    e.className = e.className + ' scene';
			  }
			  currentIndex = i;
			}
			
			else {
			  if (e.classList) {
			    e.classList.remove('scene');					
			  }
			  else {
			    var ci = e.className.search(new RegExp('scene'));
			    if (ci) {
						e.className = e.className.replace('scene', '');
					}
			  }
			}

			e.style[prefix+'transform'] = 'translate'+t+'('+ (diff) +'px)';
			e.style['transform'] = 'translate'+t+'('+ (diff) +'px)';
		});
		
		offset = diff;
				
		return currentIndex
	};
	
	function next(){
		var index = currentIndex + 1;
		if(index > players.length - 1) index = 0;
		centerPiece(index);
		return currentIndex = index;
	};
	
	function prev(){
		var index = currentIndex - 1;
		if(index < 0) index = players.length - 1;
		centerPiece(index);
		return currentIndex = index;
	};

};


/*
  Changing the index of a Player and resetting the stage should work for wraparounds
  and continuous scrolling.
*/
});

require.define("/node_modules/uxer-show/setStage.js",function(require,module,exports,__dirname,__filename,process,global){var castCall = require('./castCall.js');
var getCSS = function(el, prop){
	var propValue = document.defaultView.getComputedStyle(el).getPropertyValue(prop)
	if(!propValue) throw new Error("No prop valueValue. Is the element appended to the document yet?")
	if(!propValue) return false
	return (parseInt(propValue) || 0)
}
var doc = window.document;
var body = doc.body;

module.exports = function(title, direction){
	
	var stage = doc.getElementById(title);
	var players = castCall(stage.children, direction);
	var property = direction.toLowerCase() == 'left' ? 'width' : 'height'
  var propertyValue = players.reduce(function(e, i){
	  return e + i.uxer[property]
  }, 0)

	stage.uxer = {};
	stage.uxer.width = getCSS(stage, 'width')//.primitive.val;
	stage.uxer.height = getCSS(stage, 'height')//.primitive.val;
	stage.uxer.left = getCSS(stage, 'left')//.primitive.val
	stage.uxer.top = getCSS(stage, 'top')//.primitive.val
	stage.uxer.right = getCSS(stage, 'right')//.primitive.val
	stage.uxer.bottom = getCSS(stage, 'bottom')//.primitive.val
	
	return {stage: stage, players: players}
	
}
});

require.define("/node_modules/uxer-show/castCall.js",function(require,module,exports,__dirname,__filename,process,global){var uuid = require('short-id')
var getCSS = function(el, prop){
	var propValue = document.defaultView.getComputedStyle(el).getPropertyValue(prop)
	if(!propValue) throw new Error("No prop valueValue. Is the element appended to the document yet?")
	if(!propValue) return false
	return (parseInt(propValue) || 0)
};

module.exports = function(children, direction){
	
	var players = Array.prototype.map.call(stage.children, function(player,i){
		if(!player.id.length) player.id = uuid.generate();
		player.uxer = {};
		player.uxer.width = getCSS(player, 'width')//.primitive.val
		player.uxer.height = getCSS(player, 'height')//.primitive.val
		return player
	});
	
	var total = 0
	var property = direction.toLowerCase() == 'left' ? 'width' : 'height'
	
	players.forEach(function(player, i){
		var left = players[i-1] ? players[i-1].uxer[property] : 0;
		total += left;
		player.uxer[direction] = total;
		player.style[direction] = total + 'px';
	})
	
	return players
	
}
});

require.define("/node_modules/uxer-show/node_modules/short-id/package.json",function(require,module,exports,__dirname,__filename,process,global){module.exports = {"main":"lib/index.js"}
});

require.define("/node_modules/uxer-show/node_modules/short-id/lib/index.js",function(require,module,exports,__dirname,__filename,process,global){
/**
 * Self-contained short-life ID generating module
 *
 * Not guarenteed to be unique outside of a single instance of the module.
 */

var sechash = require('sechash');
var merge   = require('merge-recursive');

var current = 0;
var storage = { };
var config = {
	length: 6,
	algorithm: 'sha1',
	salt: Math.random,
	useObjects: false
};

exports.configure = function(conf) {
	Object.keys(conf).forEach(function(key) {
		config[key] = conf[key];
	});
};

exports.generate = function(conf) {
	conf = merge({ }, config, conf || { });
	
	var key;
	var salt = config.salt;
	
	if (typeof salt === 'function') {
		salt = salt();
	}
	
	do {
		key = sechash.basicHash(config.algorithm, String(current++) + salt).slice(0, config.length);
	} while (storage.hasOwnProperty(key));
	
	storage[key] = null;
	
	if (conf.useObjects) {
		key = new exports.Id(key);
	}
	
	return key;
};

exports.invalidate = function(key) {
	delete storage[keyValue(key)];
};

exports.store = function(value) {
	var key = exports.generate();
	storage[keyValue(key)] = value;
	return key;
};

exports.fetch = function(key) {
	return storage[keyValue(key)];
};

exports.fetchAndInvalidate = function(key) {
	var value = exports.fetch(key);
	exports.invalidate(key);
	return value;
};

// ------------------------------------------------------------------

var type = function(value) {
	return Object.prototype.toString.call(value).slice(8, -1);
};

exports.isId = function(value) {
	return (type(value) === 'Object' && (value instanceof exports.Id || value._isShortIdObject));
};

// ------------------------------------------------------------------

exports.Id = function(id) {
	if (! this instanceof exports.Id) {
		return new exports.Id(id);
	}
	
	if (! id) {
		id = exports.generate({ useObjects: false });
	}
	
	Object.defineProperty(this, 'id', {
		value: id,
		writable: false,
		enumerable: true
	});
};

Object.defineProperty(exports.Id.prototype, '_isShortIdObject', {
	value: true,
	writable: false,
	enumerable: false
});

exports.Id.prototype.toString = function() {
	return this.id;
};

// ------------------------------------------------------------------

function keyValue(key) {
	return exports.isId(key) ? String(key) : key
}


});

require.define("/node_modules/uxer-show/node_modules/short-id/node_modules/sechash/package.json",function(require,module,exports,__dirname,__filename,process,global){module.exports = {"main":"lib/sechash.js"}
});

require.define("/node_modules/uxer-show/node_modules/short-id/node_modules/sechash/lib/sechash.js",function(require,module,exports,__dirname,__filename,process,global){/**
 * sechash
 *
 * Secure password hashing using salt and keystretching
 *
 * @author     James Brumond
 * @version    0.2.0
 * @copyright  Copyright 2012 James Brumond
 * @license    Dual licensed under MIT and GPL
 */
	
var oath    = require('oath');
var crypto  = require('crypto');

var defaultOptions = {
	algorithm: 'sha1',
	iterations: 2000,
	includeMeta: true,
	intervalLength: 500,
	salt: function() {
		return hash(this.algorithm, String(Math.random())).substring(0, 6);
	}
};

// ----------------------------------------------------------------------------
//  Public functions

exports.basicHash = function(alg, str) {
	return hash(alg, str);
};

exports.testBasicHash = function(alg, str, testHash) {
	return (hash(alg, str) === testHash);
};

exports.strongHashSync = function(str, opts) {
	opts = getOptions(opts);
	for (var i = 0; i < opts.iterations; i++) {
		str = hash(opts.algorithm, str + opts.salt);
	}
	return opts.meta + str;
};

exports.strongHash = function(str, opts, callback) {
	var promise = new oath();
	if (typeof opts === 'function') {
		callback = opts;
		opts = null;
	}
	opts = getOptions(opts);
	asyncFor(opts.iterations, opts.intervalLength,
		function() {
			str = hash(opts.algorithm, str + opts.salt);
		},
		function() {
			done(promise, callback, opts.meta + str);
		}
	);
	return promise.promise;
};

exports.testHashSync = function(str, hash, opts) {
	opts = getOptions(opts, hash);
	return (exports.strongHashSync(str, opts) === hash);
};

exports.testHash = function(str, hash, opts, callback) {
	var promise = new oath();
	if (typeof opts === 'function') {
		callback = opts;
		opts = null;
	}
	opts = getOptions(opts, hash);
	exports.strongHash(str, opts, function(err, result) {
		done(promise, callback, hash === result);
	});
	return promise.promise;
};



// ------------------------------------------------------------------
//  Helpers

function hash(alg, str) {
	var hashsum = crypto.createHash(alg);
	hashsum.update(str);
	return hashsum.digest('hex');
}

function done(promise, callback, result) {
	if (typeof callback === 'function') {
		callback(null, result);
	}
	promise.resolve(result);
}

function getOptions(opts, hash) {
	var result = { };
	Object.keys(defaultOptions).forEach(function(key) {
		result[key] = defaultOptions[key];
	});
	Object.keys(opts || { }).forEach(function(key) {
		result[key] = opts[key];
	});
	if (typeof result.salt === 'function') {
		result.salt = result.salt();
	}
	if (result.includeMeta) {
		result.meta = result.salt + ':' + result.algorithm + ':' + result.iterations + ':'
	} else {
		result.meta = '';
	}
	if (hash && hash.indexOf(':') >= 0) {
		hash = hash.split(':');
		result.salt = hash[0];
		result.algorithm = hash[1];
		result.iterations = Number(hash[2]);
	}
	return result;
}

function asyncFor(count, intervalLength, func, callback) {
	function runLoop() {
		for (var i = 0; (i < intervalLength && count); i++, count--) {
			func(count, i);
		}
		if (count) {
			process.nextTick(runLoop);
		} else {
			callback();
		}
	}
	runLoop();
}

/* End of file sechash.js */

});

require.define("/node_modules/uxer-show/node_modules/short-id/node_modules/sechash/node_modules/oath/package.json",function(require,module,exports,__dirname,__filename,process,global){module.exports = {"main":"./index"}
});

require.define("/node_modules/uxer-show/node_modules/short-id/node_modules/sechash/node_modules/oath/index.js",function(require,module,exports,__dirname,__filename,process,global){module.exports = require('./lib/oath');
});

require.define("/node_modules/uxer-show/node_modules/short-id/node_modules/sechash/node_modules/oath/lib/oath.js",function(require,module,exports,__dirname,__filename,process,global){/*!
 * Oath - Node.js / browser event emitter.
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var exports = module.exports = Oath;


/*!
 * oath version
 */
exports.version = '0.2.3';

/**
 * # Oath constructor
 *
 * Create a new promise.
 *
 * #### Options
 *
 * * parent - used internally for chaining
 * * context - object to set as `this` in callbacks
 *
 * You can use `Oath` within single functions
 *
 *      // assignment style
 *      var promise = new oath();
 *      promise.then(successFn, errorFn);
 *      myAsycFunction(function(err, result) {
 *        if (err) promise.reject(err);
 *        promise.resolve(result);
 *      });
 *
 * Or return them to ease chaining of callbacks
 *
 *      // return style
 *      function doSomething(data) {
 *        var promise = new oath();
 *        // async stuff here
 *        // promise should be returned immediately
 *        return promise;
 *      }
 *
 *      doSomething(data).then(successFn, errorFn);
 *
 * @name constructor
 * @param {Object} options
 * @api public
 */

function Oath (options) {
  options = options || {};

  this._pending = {};
  this._oath = {
      complete: false
    , context: options.context || this
  };

  var self = this;
  this.promise = {
      then: function (success, failure, progress) {
        if (success) self._register('resolve', success);
        if (failure) self._register('reject', failure);
        if (progress) self._register('progress', progress);
        if (self._oath.complete) self._traverse();
        return this;
      }
    , onprogress: function (fn) {
        self._register('progress', fn);
        return this;
      }
    , node: function (callback) {
        this.then(
            function (d) { callback(null, d); }
          , function (e) { callback(e); }
        );
        return this;
      }
  };
}

/**
 * # Oath.resolve(result)
 *
 * Emits completion event to execute `success` chain of functions.
 *
 *        // When async work is complete
 *        promise.resolve(my_data_obj);
 *
 * @name Oath.resolve
 * @param {Object} result
 * @api public
 */

Oath.prototype.resolve = function (result) {
  this._fulfill('resolve', result);
};

/**
 * # Oath.reject(result)
 *
 * Emit completion event to execute `failure` chain of functions.
 *
 *        // When async work errors
 *        promise.reject(my_error_obj);
 *
 * @name Oath.reject
 * @param {Object} result
 * @api public
 */

Oath.prototype.reject = function (result) {
  this._fulfill('reject', result);
};

/**
 * # Oath.progress(current, max)
 *
 * Emits the current progress to the the progress stack of functions.
 *
 * @name Oath.progress
 * @param {Object} result
 * @api public
 */

Oath.prototype.progress = function (result) {
  var map = this._pending['progress'];

  if (!map) return false;
  else {
    for (var i = 0; i < map.length; i++) {
      map[i](result);
    }
  }
};

/**
 * # Oath.node(err, [...])
 *
 * Provides a node-able function...
 * Works, provided the expectation is that
 * if there was an error, it will be returned
 * as the first argument.
 *
 *    var oath = new Oath();
 *    fs.mkdir(dir, oath.node());
 *
 * @name Oath.node
 * @return {Function} expection function (err, data) { ...
 */

Oath.prototype.node = function () {
  var self = this;
  return function () {
    if (arguments[0]) return self.reject(arguments[0]);
    var args = Array.prototype.slice.call(arguments, 1, arguments.length)
    self.resolve.apply(self, args);
  }
};

/**
 * # .then([success], [failure])
 *
 * Chainable function for promise observers to queue result functions.
 *
 *      doSomething(my_data)
 *        .then(successFn1, failureFn1)
 *        .then(successFn2, failureFn2)
 *
 * @name then
 * @param {Function} success will execute on `resolve`
 * @param {Function} failure will execute on `reject` (optional)
 * @api public
 */

//Oath.prototype.then =

Oath.prototype._register = function (type, fn) {
  var context = this._oath.context
    , map = this._pending[type]
    , cb;

  // For sync functions
  if (fn.length < 2) {
    cb = function (result) {
      return fn.call(context, result);
    };

  // For async functions
  } else if (fn.length == 2) {
    cb = function (result, next) {
      fn.call(context, result, next);
    };

  // WTF?
  } else {
    throw new Error('Oath: Invalid function registered - to many parameters.');
  }

  if (!map) this._pending[type] = [ cb ];
  else map.push(cb);
};

/*!
 * # ._fulfill(type, result)
 *
 * Check to see if the results have been posted,
 * and if not, store results and start callback chain.
 *
 * @name fulfill
 * @param {String} type
 * @param {Object} result
 * @api private
 */

Oath.prototype._fulfill = function (type, result) {
  if (this._oath.complete) return false;
  this._oath.complete = {
      type: type
    , result: result
  };
  this._traverse();
};

/*!
 * # ._traverse()
 *
 * Iterate through the callback stack and execute
 * functions serially. Provide next helper to async
 * functions and handle result reassignment.
 *
 * @name traverse
 * @api private
 */

Oath.prototype._traverse = function () {
  var self = this
    , context = this._oath.context
    , type = this._oath.complete.type;

  if (!this._pending[type]) {
    return false;
  }

  var iterate = function () {
    var fn = self._pending[type].shift()
      , result = self._oath.complete.result;
    if (fn.length < 2) {
      var res = fn(result);
      if (res) self._oath.complete.result = res;
      if (self._pending[type].length) iterate();
    } else {
      var next = function (res) {
        if (res) self._oath.complete.result = res;
        if (self._pending[type].length) iterate();
      }
      fn(result, next);
    }
  }

  iterate();
};

});

require.define("crypto",function(require,module,exports,__dirname,__filename,process,global){module.exports = require("crypto-browserify")
});

require.define("/node_modules/crypto-browserify/package.json",function(require,module,exports,__dirname,__filename,process,global){module.exports = {}
});

require.define("/node_modules/crypto-browserify/index.js",function(require,module,exports,__dirname,__filename,process,global){var sha = require('./sha')
var rng = require('./rng')
var md5 = require('./md5')

var algorithms = {
  sha1: {
    hex: sha.hex_sha1,
    binary: sha.b64_sha1,
    ascii: sha.str_sha1
  },
  md5: {
    hex: md5.hex_md5,
    binary: md5.b64_md5,
    ascii: md5.any_md5
  }
}

function error () {
  var m = [].slice.call(arguments).join(' ')
  throw new Error([
    m,
    'we accept pull requests',
    'http://github.com/dominictarr/crypto-browserify'
    ].join('\n'))
}

exports.createHash = function (alg) {
  alg = alg || 'sha1'
  if(!algorithms[alg])
    error('algorithm:', alg, 'is not yet supported')
  var s = ''
  var _alg = algorithms[alg]
  return {
    update: function (data) {
      s += data
      return this
    },
    digest: function (enc) {
      enc = enc || 'binary'
      var fn
      if(!(fn = _alg[enc]))
        error('encoding:', enc , 'is not yet supported for algorithm', alg)
      var r = fn(s)
      s = null //not meant to use the hash after you've called digest.
      return r
    }
  }
}

exports.randomBytes = function(size, callback) {
  if (callback && callback.call) {
    try {
      callback.call(this, undefined, rng(size));
    } catch (err) { callback(err); }
  } else {
    return rng(size);
  }
}

// the least I can do is make error messages for the rest of the node.js/crypto api.
;['createCredentials'
, 'createHmac'
, 'createCypher'
, 'createCypheriv'
, 'createDecipher'
, 'createDecipheriv'
, 'createSign'
, 'createVerify'
, 'createDeffieHellman'
, 'pbkdf2'].forEach(function (name) {
  exports[name] = function () {
    error('sorry,', name, 'is not implemented yet')
  }
})

});

require.define("/node_modules/crypto-browserify/sha.js",function(require,module,exports,__dirname,__filename,process,global){/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

exports.hex_sha1 = hex_sha1;
exports.b64_sha1 = b64_sha1;
exports.str_sha1 = str_sha1;
exports.hex_hmac_sha1 = hex_hmac_sha1;
exports.b64_hmac_sha1 = b64_hmac_sha1;
exports.str_hmac_sha1 = str_hmac_sha1;

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_sha1(s){return binb2hex(core_sha1(str2binb(s),s.length * chrsz));}
function b64_sha1(s){return binb2b64(core_sha1(str2binb(s),s.length * chrsz));}
function str_sha1(s){return binb2str(core_sha1(str2binb(s),s.length * chrsz));}
function hex_hmac_sha1(key, data){ return binb2hex(core_hmac_sha1(key, data));}
function b64_hmac_sha1(key, data){ return binb2b64(core_hmac_sha1(key, data));}
function str_hmac_sha1(key, data){ return binb2str(core_hmac_sha1(key, data));}

/*
 * Perform a simple self-test to see if the VM is working
 */
function sha1_vm_test()
{
  return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
}

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function core_sha1(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = len;

  var w = Array(80);
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  var e = -1009589776;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    var olde = e;

    for(var j = 0; j < 80; j++)
    {
      if(j < 16) w[j] = x[i + j];
      else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
      var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
                       safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d;
      d = c;
      c = rol(b, 30);
      b = a;
      a = t;
    }

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
  }
  return Array(a, b, c, d, e);

}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d)
{
  if(t < 20) return (b & c) | ((~b) & d);
  if(t < 40) return b ^ c ^ d;
  if(t < 60) return (b & c) | (b & d) | (c & d);
  return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t)
{
  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
         (t < 60) ? -1894007588 : -899497514;
}

/*
 * Calculate the HMAC-SHA1 of a key and some data
 */
function core_hmac_sha1(key, data)
{
  var bkey = str2binb(key);
  if(bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
  return core_sha1(opad.concat(hash), 512 + 160);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert an 8-bit or 16-bit string to an array of big-endian words
 * In 8-bit function, characters >255 have their hi-byte silently ignored.
 */
function str2binb(str)
{
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i%32);
  return bin;
}

/*
 * Convert an array of big-endian words to a string
 */
function binb2str(bin)
{
  var str = "";
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode((bin[i>>5] >>> (32 - chrsz - i%32)) & mask);
  return str;
}

/*
 * Convert an array of big-endian words to a hex string.
 */
function binb2hex(binarray)
{
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++)
  {
    str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
  }
  return str;
}

/*
 * Convert an array of big-endian words to a base-64 string
 */
function binb2b64(binarray)
{
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i += 3)
  {
    var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
    }
  }
  return str;
}


});

require.define("/node_modules/crypto-browserify/rng.js",function(require,module,exports,__dirname,__filename,process,global){// Original code adapted from Robert Kieffer.
// details at https://github.com/broofa/node-uuid
(function() {
  var _global = this;

  var mathRNG, whatwgRNG;

  // NOTE: Math.random() does not guarantee "cryptographic quality"
  mathRNG = function(size) {
    var bytes = new Array(size);
    var r;

    for (var i = 0, r; i < size; i++) {
      if ((i & 0x03) == 0) r = Math.random() * 0x100000000;
      bytes[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return bytes;
  }

  // currently only available in webkit-based browsers.
  if (_global.crypto && crypto.getRandomValues) {
    var _rnds = new Uint32Array(4);
    whatwgRNG = function(size) {
      var bytes = new Array(size);
      crypto.getRandomValues(_rnds);

      for (var c = 0 ; c < size; c++) {
        bytes[c] = _rnds[c >> 2] >>> ((c & 0x03) * 8) & 0xff;
      }
      return bytes;
    }
  }

  module.exports = whatwgRNG || mathRNG;

}())
});

require.define("/node_modules/crypto-browserify/md5.js",function(require,module,exports,__dirname,__filename,process,global){/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = "";  /* base-64 pad character. "=" for strict RFC compliance   */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_md5(s)    { return rstr2hex(rstr_md5(str2rstr_utf8(s))); }
function b64_md5(s)    { return rstr2b64(rstr_md5(str2rstr_utf8(s))); }
function any_md5(s, e) { return rstr2any(rstr_md5(str2rstr_utf8(s)), e); }
function hex_hmac_md5(k, d)
  { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
function b64_hmac_md5(k, d)
  { return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
function any_hmac_md5(k, d, e)
  { return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e); }

/*
 * Perform a simple self-test to see if the VM is working
 */
function md5_vm_test()
{
  return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72";
}

/*
 * Calculate the MD5 of a raw string
 */
function rstr_md5(s)
{
  return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
}

/*
 * Calculate the HMAC-MD5, of a key and some data (raw strings)
 */
function rstr_hmac_md5(key, data)
{
  var bkey = rstr2binl(key);
  if(bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
  return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
}

/*
 * Convert a raw string to a hex string
 */
function rstr2hex(input)
{
  try { hexcase } catch(e) { hexcase=0; }
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var output = "";
  var x;
  for(var i = 0; i < input.length; i++)
  {
    x = input.charCodeAt(i);
    output += hex_tab.charAt((x >>> 4) & 0x0F)
           +  hex_tab.charAt( x        & 0x0F);
  }
  return output;
}

/*
 * Convert a raw string to a base-64 string
 */
function rstr2b64(input)
{
  try { b64pad } catch(e) { b64pad=''; }
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var output = "";
  var len = input.length;
  for(var i = 0; i < len; i += 3)
  {
    var triplet = (input.charCodeAt(i) << 16)
                | (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
                | (i + 2 < len ? input.charCodeAt(i+2)      : 0);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > input.length * 8) output += b64pad;
      else output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
    }
  }
  return output;
}

/*
 * Convert a raw string to an arbitrary string encoding
 */
function rstr2any(input, encoding)
{
  var divisor = encoding.length;
  var i, j, q, x, quotient;

  /* Convert to an array of 16-bit big-endian values, forming the dividend */
  var dividend = Array(Math.ceil(input.length / 2));
  for(i = 0; i < dividend.length; i++)
  {
    dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
  }

  /*
   * Repeatedly perform a long division. The binary array forms the dividend,
   * the length of the encoding is the divisor. Once computed, the quotient
   * forms the dividend for the next step. All remainders are stored for later
   * use.
   */
  var full_length = Math.ceil(input.length * 8 /
                                    (Math.log(encoding.length) / Math.log(2)));
  var remainders = Array(full_length);
  for(j = 0; j < full_length; j++)
  {
    quotient = Array();
    x = 0;
    for(i = 0; i < dividend.length; i++)
    {
      x = (x << 16) + dividend[i];
      q = Math.floor(x / divisor);
      x -= q * divisor;
      if(quotient.length > 0 || q > 0)
        quotient[quotient.length] = q;
    }
    remainders[j] = x;
    dividend = quotient;
  }

  /* Convert the remainders to the output string */
  var output = "";
  for(i = remainders.length - 1; i >= 0; i--)
    output += encoding.charAt(remainders[i]);

  return output;
}

/*
 * Encode a string as utf-8.
 * For efficiency, this assumes the input is valid utf-16.
 */
function str2rstr_utf8(input)
{
  var output = "";
  var i = -1;
  var x, y;

  while(++i < input.length)
  {
    /* Decode utf-16 surrogate pairs */
    x = input.charCodeAt(i);
    y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
    if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
    {
      x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
      i++;
    }

    /* Encode output as utf-8 */
    if(x <= 0x7F)
      output += String.fromCharCode(x);
    else if(x <= 0x7FF)
      output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
                                    0x80 | ( x         & 0x3F));
    else if(x <= 0xFFFF)
      output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                                    0x80 | ((x >>> 6 ) & 0x3F),
                                    0x80 | ( x         & 0x3F));
    else if(x <= 0x1FFFFF)
      output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                                    0x80 | ((x >>> 12) & 0x3F),
                                    0x80 | ((x >>> 6 ) & 0x3F),
                                    0x80 | ( x         & 0x3F));
  }
  return output;
}

/*
 * Encode a string as utf-16
 */
function str2rstr_utf16le(input)
{
  var output = "";
  for(var i = 0; i < input.length; i++)
    output += String.fromCharCode( input.charCodeAt(i)        & 0xFF,
                                  (input.charCodeAt(i) >>> 8) & 0xFF);
  return output;
}

function str2rstr_utf16be(input)
{
  var output = "";
  for(var i = 0; i < input.length; i++)
    output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
                                   input.charCodeAt(i)        & 0xFF);
  return output;
}

/*
 * Convert a raw string to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */
function rstr2binl(input)
{
  var output = Array(input.length >> 2);
  for(var i = 0; i < output.length; i++)
    output[i] = 0;
  for(var i = 0; i < input.length * 8; i += 8)
    output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (i%32);
  return output;
}

/*
 * Convert an array of little-endian words to a string
 */
function binl2rstr(input)
{
  var output = "";
  for(var i = 0; i < input.length * 32; i += 8)
    output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);
  return output;
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */
function binl_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);
}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}


exports.hex_md5 = hex_md5;
exports.b64_md5 = b64_md5;
exports.any_md5 = any_md5;

});

require.define("/node_modules/uxer-show/node_modules/short-id/node_modules/merge-recursive/package.json",function(require,module,exports,__dirname,__filename,process,global){module.exports = {"main":"lib/index.js"}
});

require.define("/node_modules/uxer-show/node_modules/short-id/node_modules/merge-recursive/lib/index.js",function(require,module,exports,__dirname,__filename,process,global){
// Flat merge
module.exports = exports = function(host) {
	var donors = slice(arguments, 1);
	donors.forEach(function(donor) {
		Object.keys(donor).forEach(function(key) {
			host[key] = donor[key];
		});
	});
	return host;
};

// Flat, selective merge
exports.selective = function(keys, host) {
	var donors = slice(arguments, 1);
	donors.forEach(function(donor) {
		keys.forEach(function(key) {
			host[key] = donor[key];
		});
	});
	return host;
};

// Recursive merge
exports.recursive = function(host) {
	var donors = slice(arguments, 1);
	donors.forEach(function(donor) {
		Object.keys(donor).forEach(recurser(host, donor));
	});
	return host;
};

// Recursive, selective merge
exports.selective.recursive = function(keys, host) {
	var donors = slice(arguments, 1);
	donors.forEach(function(donor) {
		keys.forEach(recurser(host, donor));
	});
	return host;
};

// Helpers

function slice(arr, i) {
	return Array.prototype.slice.call(arr, i);
}

function isObj(value) {
	return !! (typeof value === 'object' && value);
}

function getType(value) {
	return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

function recurser(host, donor) {
	return function(key) {
		if (isObj(donor[key])) {
			if (isObj(host[key])) {
				exports.recursive(host[key], donor[key]);
			} else {
				var base = Array.isArray(donor[key]) ? [ ] : { };
				host[key] = exports.recursive(base, donor[key]);
			}
		} else {
			host[key] = donor[key];
		}
	};
}

/* End of file index.js */
/* Location: ./lib/index.js */

});

require.define("/node_modules/uxer-show/prefix.js",function(require,module,exports,__dirname,__filename,process,global){// from http://davidwalsh.name/vendor-prefix

module.exports = prefix;

function prefix () {
  var styles = window.getComputedStyle(document.documentElement, ''),
    pre = (Array.prototype.slice
      .call(styles)
      .join('') 
      .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
    )[1],
    dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
  return {
    dom: dom,
    lowercase: pre,
    css: '-' + pre + '-',
    js: pre[0].toUpperCase() + pre.substr(1)
  };
};
});

require.define("/reverso/entry.js",function(require,module,exports,__dirname,__filename,process,global){require('./reqFrame')
var stage = document.getElementById('stage');
var show = require('uxer-show')

var set = show('stage', 'left')
set.goTo(2)

Hammer(stage).on('swipeleft dragleft', leftHandler)
Hammer(stage).on('swiperight dragright', rightHandler)

document.ontouchmove = function(e){e.preventDefault()}

function leftHandler(evt){
  evt.preventDefault()
  evt.gesture.stopDetect();

  set.next();
}

function rightHandler(evt){
  evt.preventDefault()
  evt.gesture.stopDetect();

  set.prev();
}

//setInterval(set.next, 1000)




});
require("/reverso/entry.js");
})();
