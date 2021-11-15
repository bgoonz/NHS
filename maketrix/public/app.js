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
require.extensions = [".js",".coffee"];

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
    
    require.define = function (filename, fn) {
        if (require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
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
                process
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process){function filter (xs, fn) {
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
});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process){var process = module.exports = {};

process.nextTick = (function () {
    var queue = [];
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;
    
    if (canPost) {
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);
    }
    
    return function (fn) {
        if (canPost) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        }
        else setTimeout(fn, 0);
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

require.define("vm",function(require,module,exports,__dirname,__filename,process){module.exports = require("vm-browserify")});

require.define("/node_modules/vm-browserify/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"index.js"}});

require.define("/node_modules/vm-browserify/index.js",function(require,module,exports,__dirname,__filename,process){var Object_keys = function (obj) {
    if (Object.keys) return Object.keys(obj)
    else {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    }
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

var Script = exports.Script = function NodeScript (code) {
    if (!(this instanceof Script)) return new Script(code);
    this.code = code;
};

Script.prototype.runInNewContext = function (context) {
    if (!context) context = {};
    
    var iframe = document.createElement('iframe');
    if (!iframe.style) iframe.style = {};
    iframe.style.display = 'none';
    
    document.body.appendChild(iframe);
    
    var win = iframe.contentWindow;
    
    forEach(Object_keys(context), function (key) {
        win[key] = context[key];
    });
     
    if (!win.eval && win.execScript) {
        // win.eval() magically appears when this is called in IE:
        win.execScript('null');
    }
    
    var res = win.eval(this.code);
    
    forEach(Object_keys(win), function (key) {
        context[key] = win[key];
    });
    
    document.body.removeChild(iframe);
    
    return res;
};

Script.prototype.runInThisContext = function () {
    return eval(this.code); // maybe...
};

Script.prototype.runInContext = function (context) {
    // seems to be just runInNewContext on magical context objects which are
    // otherwise indistinguishable from objects except plain old objects
    // for the parameter segfaults node
    return this.runInNewContext(context);
};

forEach(Object_keys(Script.prototype), function (name) {
    exports[name] = Script[name] = function (code) {
        var s = Script(code);
        return s[name].apply(s, [].slice.call(arguments, 1));
    };
});

exports.createScript = function (code) {
    return exports.Script(code);
};

exports.createContext = Script.createContext = function (context) {
    // not really sure what this one does
    // seems to just make a shallow copy
    var copy = {};
    if(typeof context === 'object') {
        forEach(Object_keys(context), function (key) {
            copy[key] = context[key];
        });
    }
    return copy;
};
});

require.define("/node_modules/event-stream/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {}});

require.define("/node_modules/event-stream/index.js",function(require,module,exports,__dirname,__filename,process){//filter will reemit the data if cb(err,pass) pass is truthy

// reduce is more tricky
// maybe we want to group the reductions or emit progress updates occasionally
// the most basic reduce just emits one 'data' event after it has recieved 'end'

var Stream = require('stream').Stream
  , es = exports
  , through = require('through')
  , from = require('from')
  , duplex = require('duplexer')
  , map = require('map-stream')
  , pause = require('pause-stream')
  , split = require('split')
  , pipeline = require('stream-combiner')

es.Stream = Stream //re-export Stream from core
es.through = through
es.from = from
es.duplex = duplex
es.map = map
es.pause = pause
es.split = split
es.pipeline = es.connect = es.pipe = pipeline
// merge / concat
//
// combine multiple streams into a single stream.
// will emit end only once

es.concat = //actually this should be called concat
es.merge = function (/*streams...*/) {
  var toMerge = [].slice.call(arguments)
  var stream = new Stream()
  var endCount = 0
  stream.writable = stream.readable = true

  toMerge.forEach(function (e) {
    e.pipe(stream, {end: false})
    var ended = false
    e.on('end', function () {
      if(ended) return
      ended = true
      endCount ++
      if(endCount == toMerge.length)
        stream.emit('end') 
    })
  })
  stream.write = function (data) {
    this.emit('data', data)
  }
  stream.destroy = function () {
    merge.forEach(function (e) {
      if(e.destroy) e.destroy()
    })
  }
  return stream
}


// writable stream, collects all events into an array 
// and calls back when 'end' occurs
// mainly I'm using this to test the other functions

es.writeArray = function (done) {
  if ('function' !== typeof done)
    throw new Error('function writeArray (done): done must be function')

  var a = new Stream ()
    , array = [], isDone = false
  a.write = function (l) {
    array.push(l)
  }
  a.end = function () {
    isDone = true
    done(null, array)
  }
  a.writable = true
  a.readable = false
  a.destroy = function () {
    a.writable = a.readable = false
    if(isDone) return
    done(new Error('destroyed before end'), array)
  }
  return a
}

//return a Stream that reads the properties of an object
//respecting pause() and resume()

es.readArray = function (array) {
  var stream = new Stream()
    , i = 0
    , paused = false
    , ended = false
 
  stream.readable = true  
  stream.writable = false
 
  if(!Array.isArray(array))
    throw new Error('event-stream.read expects an array')
  
  stream.resume = function () {
    if(ended) return
    paused = false
    var l = array.length
    while(i < l && !paused && !ended) {
      stream.emit('data', array[i++])
    }
    if(i == l && !ended)
      ended = true, stream.readable = false, stream.emit('end')
  }
  process.nextTick(stream.resume)
  stream.pause = function () {
     paused = true
  }
  stream.destroy = function () {
    ended = true
    stream.emit('close')
  }
  return stream
}

//
// readable (asyncFunction)
// return a stream that calls an async function while the stream is not paused.
//
// the function must take: (count, callback) {...
//

es.readable =
function (func, continueOnError) {
  var stream = new Stream()
    , i = 0
    , paused = false
    , ended = false
    , reading = false

  stream.readable = true  
  stream.writable = false
 
  if('function' !== typeof func)
    throw new Error('event-stream.readable expects async function')
  
  stream.on('end', function () { ended = true })
  
  function get (err, data) {
    
    if(err) {
      stream.emit('error', err)
      if(!continueOnError) stream.emit('end')
    } else if (arguments.length > 1)
      stream.emit('data', data)

    process.nextTick(function () {
      if(ended || paused || reading) return
      try {
        reading = true
        func.call(stream, i++, function () {
          reading = false
          get.apply(null, arguments)
        })
      } catch (err) {
        stream.emit('error', err)    
      }
    })
  }
  stream.resume = function () {
    paused = false
    get()
  }
  process.nextTick(get)
  stream.pause = function () {
     paused = true
  }
  stream.destroy = function () {
    stream.emit('end')
    stream.emit('close')
    ended = true
  }
  return stream
}


//
// map sync
//

es.mapSync = function (sync) { 
  return es.through(function write(data) {
    var mappedData = sync(data)
    if (typeof mappedData !== 'undefined')
      this.emit('data', mappedData)
  })
}

//
// log just print out what is coming through the stream, for debugging
//

es.log = function (name) {
  return es.through(function (data) {
    var args = [].slice.call(arguments)
    if(name) console.error(name, data)
    else     console.error(data)
    this.emit('data', data)
  })
}


//
// child -- pipe through a child process
//

es.child = function (child) {

  return es.duplex(child.stdin, child.stdout)

}

//
// parse
//
// must be used after es.split() to ensure that each chunk represents a line
// source.pipe(es.split()).pipe(es.parse())

es.parse = function () { 
  return es.through(function (data) {
    var obj
    try {
      if(data) //ignore empty lines
        obj = JSON.parse(data.toString())
    } catch (err) {
      return console.error(err, 'attemping to parse:', data)
    }
    //ignore lines that where only whitespace.
    if(obj !== undefined)
      this.emit('data', obj)
  })
}
//
// stringify
//

es.stringify = function () { 
  var Buffer = require('buffer').Buffer
  return es.mapSync(function (e){ 
    return JSON.stringify(Buffer.isBuffer(e) ? e.toString() : e) + '\n'
  }) 
}

//
// replace a string within a stream.
//
// warn: just concatenates the string and then does str.split().join(). 
// probably not optimal.
// for smallish responses, who cares?
// I need this for shadow-npm so it's only relatively small json files.

es.replace = function (from, to) {
  return es.pipeline(es.split(from), es.join(to))
} 

//
// join chunks with a joiner. just like Array#join
// also accepts a callback that is passed the chunks appended together
// this is still supported for legacy reasons.
// 

es.join = function (str) {
  
  //legacy api
  if('function' === typeof str)
    return es.wait(str)

  var first = true
  return es.through(function (data) {
    if(!first)
      this.emit('data', str)
    first = false
    this.emit('data', data)
    return true
  })
}


//
// wait. callback when 'end' is emitted, with all chunks appended as string.
//

es.wait = function (callback) {
  var body = ''
  return es.through(function (data) { body += data },
    function () {
      this.emit('data', body)
      this.emit('end')
      if(callback) callback(null, body)
    })
}

es.pipeable = function () {
  throw new Error('[EVENT-STREAM] es.pipeable is deprecated')
}
});

require.define("stream",function(require,module,exports,__dirname,__filename,process){var events = require('events');
var util = require('util');

function Stream() {
  events.EventEmitter.call(this);
}
util.inherits(Stream, events.EventEmitter);
module.exports = Stream;
// Backwards-compat with node 0.4.x
Stream.Stream = Stream;

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once, and
  // only when all sources have ended.
  if (!dest._isStdio && (!options || options.end !== false)) {
    dest._pipeCount = dest._pipeCount || 0;
    dest._pipeCount++;

    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest._pipeCount--;

    // remove the listeners
    cleanup();

    if (dest._pipeCount > 0) {
      // waiting for other incoming streams to end.
      return;
    }

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest._pipeCount--;

    // remove the listeners
    cleanup();

    if (dest._pipeCount > 0) {
      // waiting for other incoming streams to end.
      return;
    }

    dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (this.listeners('error').length === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('end', cleanup);
    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('end', cleanup);
  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};
});

require.define("events",function(require,module,exports,__dirname,__filename,process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = list.indexOf(listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};
});

require.define("util",function(require,module,exports,__dirname,__filename,process){var events = require('events');

exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\033[' + styles[style][0] + 'm' + str +
             '\033[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
  return re instanceof RegExp ||
    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
}


function isDate(d) {
  if (d instanceof Date) return true;
  if (typeof d !== 'object') return false;
  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};
});

require.define("/node_modules/event-stream/node_modules/through/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"index.js"}});

require.define("/node_modules/event-stream/node_modules/through/index.js",function(require,module,exports,__dirname,__filename,process){var Stream = require('stream')

// through
//
// a stream that does nothing but re-emit the input.
// useful for aggregating a series of changing but not ending streams into one stream)



exports = module.exports = through
through.through = through

//create a readable writable stream.

function through (write, end) {
  write = write || function (data) { this.emit('data', data) }
  end = end || function () { this.emit('end') }

  var ended = false, destroyed = false
  var stream = new Stream(), buffer = []
  stream.buffer = buffer
  stream.readable = stream.writable = true
  stream.paused = false  
  stream.write = function (data) {
    write.call(this, data)
    return !stream.paused
  }

  function drain() {
    while(buffer.length && !stream.paused) {
      var data = buffer.shift()
      if(null === data)
        return stream.emit('end')
      else
        stream.emit('data', data)
    }
  }

  stream.queue = function (data) {
    buffer.push(data)
    drain()
  }

  //this will be registered as the first 'end' listener
  //must call destroy next tick, to make sure we're after any
  //stream piped from here. 
  //this is only a problem if end is not emitted synchronously.
  //a nicer way to do this is to make sure this is the last listener for 'end'

  stream.on('end', function () {
    stream.readable = false
    if(!stream.writable)
      process.nextTick(function () {
        stream.destroy()
      })
  })

  function _end () {
    stream.writable = false
    end.call(stream)
    if(!stream.readable)
      stream.destroy()
  }

  stream.end = function (data) {
    if(ended) return 
    //this breaks, because pipe doesn't check writable before calling end.
    //throw new Error('cannot call end twice')
    ended = true
    if(arguments.length) stream.write(data)
    if(!buffer.length) _end()
  }

  stream.destroy = function () {
    if(destroyed) return
    destroyed = true
    ended = true
    buffer.length = 0
    stream.writable = stream.readable = false
    stream.emit('close')
  }

  stream.pause = function () {
    if(stream.paused) return
    stream.paused = true
    stream.emit('pause')
  }
  stream.resume = function () {
    if(stream.paused) {
      stream.paused = false
    }
    drain()
    //may have become paused again,
    //as drain emits 'data'.
    if(!stream.paused)
      stream.emit('drain')
  }
  return stream
}

});

require.define("/node_modules/event-stream/node_modules/from/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"index.js"}});

require.define("/node_modules/event-stream/node_modules/from/index.js",function(require,module,exports,__dirname,__filename,process){
'use strict';

var Stream = require('stream')

// from
//
// a stream that reads from an source.
// source may be an array, or a function.
// from handles pause behaviour for you.

module.exports =
function from (source) {
  if(Array.isArray(source))
    return from (function (i) {
      if(source.length)
        this.emit('data', source.shift())
      else
        this.emit('end')
      return true
    })

  var s = new Stream(), i = 0
  s.ended = false
  s.started = false
  s.readable = true
  s.writable = false
  s.paused = false
  s.ended = false
  s.pause = function () {
    s.started = true
    s.paused = true
  }
  function next () {
    s.started = true
    if(s.ended) return
    while(!s.ended && !s.paused && source.call(s, i++, function () {
      if(!s.ended && !s.paused)
          next()
    }))
      ;
  }
  s.resume = function () {
    s.started = true
    s.paused = false
    next()
  }
  s.on('end', function () {
    s.ended = true
    s.readable = false
    process.nextTick(s.destroy)
  })
  s.destroy = function () {
    s.ended = true
    s.emit('close') 
  }
  /*
    by default, the stream will start emitting at nextTick
    if you want, you can pause it, after pipeing.
    you can also resume before next tick, and that will also
    work.
  */
  process.nextTick(function () {
    if(!s.started) s.resume()
  })
  return s
}
});

require.define("/node_modules/event-stream/node_modules/duplexer/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"index"}});

require.define("/node_modules/event-stream/node_modules/duplexer/index.js",function(require,module,exports,__dirname,__filename,process){var Stream = require("stream")
    , writeMethods = ["write", "end", "destroy"]
    , readMethods = ["resume", "pause"]
    , readEvents = ["data", "close"]
    , slice = Array.prototype.slice

module.exports = duplex

function duplex(writer, reader) {
    var stream = new Stream()
        , ended = false

    Object.defineProperties(stream, {
        writable: {
            get: getWritable
        }
        , readable: {
            get: getReadable
        }
    })

    writeMethods.forEach(proxyWriter)

    readMethods.forEach(proxyReader)

    readEvents.forEach(proxyStream)

    reader.on("end", handleEnd)

    writer.on("error", reemit)
    reader.on("error", reemit)

    return stream

    function getWritable() {
        return writer.writable
    }

    function getReadable() {
        return reader.readable
    }

    function proxyWriter(methodName) {
        stream[methodName] = method

        function method() {
            return writer[methodName].apply(writer, arguments)
        }
    }

    function proxyReader(methodName) {
        stream[methodName] = method

        function method() {
            stream.emit(methodName)
            var func = reader[methodName]
            if (func) {
                return func.apply(reader, arguments)
            }
            reader.emit(methodName)
        }
    }

    function proxyStream(methodName) {
        reader.on(methodName, reemit)

        function reemit() {
            var args = slice.call(arguments)
            args.unshift(methodName)
            stream.emit.apply(stream, args)
        }
    }

    function handleEnd() {
        if (ended) {
            return
        }
        ended = true
        var args = slice.call(arguments)
        args.unshift("end")
        stream.emit.apply(stream, args)
    }

    function reemit(err) {
        stream.emit("error", err)
    }
}});

require.define("/node_modules/event-stream/node_modules/map-stream/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {}});

require.define("/node_modules/event-stream/node_modules/map-stream/index.js",function(require,module,exports,__dirname,__filename,process){//filter will reemit the data if cb(err,pass) pass is truthy

// reduce is more tricky
// maybe we want to group the reductions or emit progress updates occasionally
// the most basic reduce just emits one 'data' event after it has recieved 'end'


var Stream = require('stream').Stream


//create an event stream and apply function to each .write
//emitting each response as data
//unless it's an empty callback

module.exports = function (mapper) {
  var stream = new Stream()
    , inputs = 0
    , outputs = 0
    , ended = false
    , paused = false
    , destroyed = false

  stream.writable = true
  stream.readable = true
   
  stream.write = function () {
    if(ended) throw new Error('map stream is not writable')
    inputs ++
    var args = [].slice.call(arguments)
      , r
      , inNext = false 
    //pipe only allows one argument. so, do not 
    function next (err) {
      if(destroyed) return
      inNext = true
      outputs ++
      var args = [].slice.call(arguments)
      if(err) {
        args.unshift('error')
        return inNext = false, stream.emit.apply(stream, args)
      }
      args.shift() //drop err
      if (args.length) {
        args.unshift('data')
        r = stream.emit.apply(stream, args)
      }
      if(inputs == outputs) {
        if(paused) paused = false, stream.emit('drain') //written all the incoming events
        if(ended) end()
      }
      inNext = false
    }
    args.push(next)
    
    try {
      //catch sync errors and handle them like async errors
      var written = mapper.apply(null, args)
      paused = (written === false)
      return !paused
    } catch (err) {
      //if the callback has been called syncronously, and the error
      //has occured in an listener, throw it again.
      if(inNext)
        throw err
      next(err)
      return !paused
    }
  }

  function end (data) {
    //if end was called with args, write it, 
    ended = true //write will emit 'end' if ended is true
    stream.writable = false
    if(data !== undefined)
      return stream.write(data)
    else if (inputs == outputs) //wait for processing 
      stream.readable = false, stream.emit('end'), stream.destroy() 
  }

  stream.end = function (data) {
    if(ended) return
    end()
  }

  stream.destroy = function () {
    ended = destroyed = true
    stream.writable = stream.readable = paused = false
    process.nextTick(function () {
      stream.emit('close')
    })
  }
  stream.pause = function () {
    paused = true
  }

  stream.resume = function () {
    paused = false
  }

  return stream
}




});

require.define("/node_modules/event-stream/node_modules/pause-stream/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"index.js"}});

require.define("/node_modules/event-stream/node_modules/pause-stream/index.js",function(require,module,exports,__dirname,__filename,process){var Stream = require('stream')

/*
  was gonna use through for this,
  but it does not match quite right,
  because you need a seperate pause
  mechanism for the readable and writable
  sides.
*/

module.exports = function () {
  var buffer = [], ended = false, destroyed = false
  var stream = new Stream() 
  stream.writable = stream.readable = true
  stream.paused = false 
  
  stream.write = function (data) {
    if(!this.paused)
      this.emit('data', data)
    else 
      buffer.push(data)
    return !(this.paused || buffer.length)
  }
  function onEnd () {
    stream.readable = false
    stream.emit('end')
    process.nextTick(stream.destroy.bind(stream))
  }
  stream.end = function (data) {
    if(data) this.write(data)
    this.ended = true
    this.writable = false
    if(!(this.paused || buffer.length))
      return onEnd()
    else
      this.once('drain', onEnd)
    this.drain()
  }

  stream.drain = function () {
    while(!this.paused && buffer.length)
      this.emit('data', buffer.shift())
    //if the buffer has emptied. emit drain.
    if(!buffer.length && !this.paused)
      this.emit('drain')
  }

  stream.resume = function () {
    //this is where I need pauseRead, and pauseWrite.
    //here the reading side is unpaused,
    //but the writing side may still be paused.
    //the whole buffer might not empity at once.
    //it might pause again.
    //the stream should never emit data inbetween pause()...resume()
    //and write should return !buffer.length

    this.paused = false
//    process.nextTick(this.drain.bind(this)) //will emit drain if buffer empties.
    this.drain()
    return this
  }

  stream.destroy = function () {
    if(destroyed) return
    destroyed = ended = true     
    buffer.length = 0
    this.emit('close')
  }

  stream.pause = function () {
    stream.paused = true
    return this
  }
 
  return stream
}
});

require.define("/node_modules/event-stream/node_modules/split/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {}});

require.define("/node_modules/event-stream/node_modules/split/index.js",function(require,module,exports,__dirname,__filename,process){//filter will reemit the data if cb(err,pass) pass is truthy

// reduce is more tricky
// maybe we want to group the reductions or emit progress updates occasionally
// the most basic reduce just emits one 'data' event after it has recieved 'end'


var through = require('through')


module.exports = split

function split (matcher) {
  var soFar = ''
  if (!matcher)
    matcher = '\n'

  return through(function (buffer) { 
    var stream = this
      , pieces = (soFar + buffer).split(matcher)
    soFar = pieces.pop()

    pieces.forEach(function (piece) {
      stream.emit('data', piece)
    })

    return true
  },
  function () {
    if(soFar)
      this.emit('data', soFar)  
    this.emit('end')
  })
}

});

require.define("/node_modules/event-stream/node_modules/split/node_modules/through/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"index.js"}});

require.define("/node_modules/event-stream/node_modules/split/node_modules/through/index.js",function(require,module,exports,__dirname,__filename,process){var Stream = require('stream')

// through
//
// a stream that does nothing but re-emit the input.
// useful for aggregating a series of changing but not ending streams into one stream)

exports = module.exports = through
through.through = through

//create a readable writable stream.

function through (write, end) {
  write = write || function (data) { this.emit('data', data) }
  end = end || function () { this.emit('end') }

  var ended = false, destroyed = false
  var stream = new Stream()
  stream.readable = stream.writable = true
  stream.paused = false  
  stream.write = function (data) {
    write.call(this, data)
    return !stream.paused
  }
  //this will be registered as the first 'end' listener
  //must call destroy next tick, to make sure we're after any
  //stream piped from here. 
  stream.on('end', function () {
    stream.readable = false
    if(!stream.writable)
      process.nextTick(function () {
        stream.destroy()
      })
  })

  stream.end = function (data) {
    if(ended) return 
    //this breaks, because pipe doesn't check writable before calling end.
    //throw new Error('cannot call end twice')
    ended = true
    if(arguments.length) stream.write(data)
    this.writable = false
    end.call(this)
    if(!this.readable)
      this.destroy()
  }
  stream.destroy = function () {
    if(destroyed) return
    destroyed = true
    ended = true
    stream.writable = stream.readable = false
    stream.emit('close')
  }
  stream.pause = function () {
    stream.paused = true
  }
  stream.resume = function () {
    if(stream.paused) {
      stream.paused = false
      stream.emit('drain')
    }
  }
  return stream
}

});

require.define("/node_modules/event-stream/node_modules/stream-combiner/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {}});

require.define("/node_modules/event-stream/node_modules/stream-combiner/index.js",function(require,module,exports,__dirname,__filename,process){var duplexer = require('duplexer')

module.exports = function () {

  var streams = [].slice.call(arguments)
    , first = streams[0]
    , last = streams[streams.length - 1]
    , thepipe = duplexer(first, last)

  if(streams.length == 1)
    return streams[0]
  else if (!streams.length)
    throw new Error('connect called with empty args')

  //pipe all the streams together

  function recurse (streams) {
    if(streams.length < 2)
      return
    streams[0].pipe(streams[1])
    recurse(streams.slice(1))  
  }
  
  recurse(streams)
 
  function onerror () {
    var args = [].slice.call(arguments)
    args.unshift('error')
    thepipe.emit.apply(thepipe, args)
  }
  
  //es.duplex already reemits the error from the first and last stream.
  //add a listener for the inner streams in the pipeline.
  for(var i = 1; i < streams.length - 1; i ++)
    streams[i].on('error', onerror)

  return thepipe
}

});

require.define("buffer",function(require,module,exports,__dirname,__filename,process){module.exports = require("buffer-browserify")});

require.define("/node_modules/buffer-browserify/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"index.js","browserify":"index.js"}});

require.define("/node_modules/buffer-browserify/index.js",function(require,module,exports,__dirname,__filename,process){function SlowBuffer (size) {
    this.length = size;
};

var assert = require('assert');

exports.INSPECT_MAX_BYTES = 50;


function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

SlowBuffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

SlowBuffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

SlowBuffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

SlowBuffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

SlowBuffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<SlowBuffer ' + out.join(' ') + '>';
};


SlowBuffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


SlowBuffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


SlowBuffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  SlowBuffer._charsWritten = i * 2;
  return i;
};


SlowBuffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};


// slice(start, end)
SlowBuffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;

  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  return new Buffer(this, end - start, +start);
};


function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}


// Buffer

function Buffer(subject, encoding, offset) {
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    this.parent = subject;
    this.offset = offset;
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    if (this.length > Buffer.poolSize) {
      // Big buffer, just alloc one.
      this.parent = new SlowBuffer(this.length);
      this.offset = 0;

    } else {
      // Small buffer.
      if (!pool || pool.length - pool.used < this.length) allocPool();
      this.parent = pool;
      this.offset = pool.used;
      pool.used += this.length;
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        this.parent[i + this.offset] = subject[i];
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    }
  }

}

function isArrayIsh(subject) {
  return Array.isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

exports.SlowBuffer = SlowBuffer;
exports.Buffer = Buffer;

Buffer.poolSize = 8 * 1024;
var pool;

function allocPool() {
  pool = new SlowBuffer(Buffer.poolSize);
  pool.used = 0;
}


// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof SlowBuffer;
};


// Inspect
Buffer.prototype.inspect = function inspect() {
  var out = [],
      len = this.length;

  for (var i = 0; i < len; i++) {
    out[i] = toHex(this.parent[i + this.offset]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }

  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i];
};


Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i] = v;
};


// write(string, offset = 0, length = buffer.length-offset, encoding = 'utf8')
Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  var ret;
  switch (encoding) {
    case 'hex':
      ret = this.parent.hexWrite(string, this.offset + offset, length);
      break;

    case 'utf8':
    case 'utf-8':
      ret = this.parent.utf8Write(string, this.offset + offset, length);
      break;

    case 'ascii':
      ret = this.parent.asciiWrite(string, this.offset + offset, length);
      break;

    case 'binary':
      ret = this.parent.binaryWrite(string, this.offset + offset, length);
      break;

    case 'base64':
      // Warning: maxLength not taken into account in base64Write
      ret = this.parent.base64Write(string, this.offset + offset, length);
      break;

    case 'ucs2':
    case 'ucs-2':
      ret = this.parent.ucs2Write(string, this.offset + offset, length);
      break;

    default:
      throw new Error('Unknown encoding');
  }

  Buffer._charsWritten = SlowBuffer._charsWritten;

  return ret;
};


// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();

  if (typeof start == 'undefined' || start < 0) {
    start = 0;
  } else if (start > this.length) {
    start = this.length;
  }

  if (typeof end == 'undefined' || end > this.length) {
    end = this.length;
  } else if (end < 0) {
    end = 0;
  }

  start = start + this.offset;
  end = end + this.offset;

  switch (encoding) {
    case 'hex':
      return this.parent.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.parent.utf8Slice(start, end);

    case 'ascii':
      return this.parent.asciiSlice(start, end);

    case 'binary':
      return this.parent.binarySlice(start, end);

    case 'base64':
      return this.parent.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.parent.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


// byteLength
Buffer.byteLength = SlowBuffer.byteLength;


// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  return this.parent.fill(value,
                          start + this.offset,
                          end + this.offset);
};


// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  end || (end = this.length);
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  return this.parent.copy(target.parent,
                          target_start + target.offset,
                          start + this.offset,
                          end + this.offset);
};


// slice(start, end)
Buffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;
  if (end > this.length) throw new Error('oob');
  if (start > end) throw new Error('oob');

  return new Buffer(this.parent, end - start, +start + this.offset);
};


// Legacy methods for backwards compatibility.

Buffer.prototype.utf8Slice = function(start, end) {
  return this.toString('utf8', start, end);
};

Buffer.prototype.binarySlice = function(start, end) {
  return this.toString('binary', start, end);
};

Buffer.prototype.asciiSlice = function(start, end) {
  return this.toString('ascii', start, end);
};

Buffer.prototype.utf8Write = function(string, offset) {
  return this.write(string, offset, 'utf8');
};

Buffer.prototype.binaryWrite = function(string, offset) {
  return this.write(string, offset, 'binary');
};

Buffer.prototype.asciiWrite = function(string, offset) {
  return this.write(string, offset, 'ascii');
};

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  return buffer[offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (isBigEndian) {
    val = buffer[offset] << 8;
    val |= buffer[offset + 1];
  } else {
    val = buffer[offset];
    val |= buffer[offset + 1] << 8;
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (isBigEndian) {
    val = buffer[offset + 1] << 16;
    val |= buffer[offset + 2] << 8;
    val |= buffer[offset + 3];
    val = val + (buffer[offset] << 24 >>> 0);
  } else {
    val = buffer[offset + 2] << 16;
    val |= buffer[offset + 1] << 8;
    val |= buffer[offset];
    val = val + (buffer[offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  neg = buffer[offset] & 0x80;
  if (!neg) {
    return (buffer[offset]);
  }

  return ((0xff - buffer[offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  buffer[offset] = value;
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  if (isBigEndian) {
    buffer[offset] = (value & 0xff00) >>> 8;
    buffer[offset + 1] = value & 0x00ff;
  } else {
    buffer[offset + 1] = (value & 0xff00) >>> 8;
    buffer[offset] = value & 0x00ff;
  }
}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  if (isBigEndian) {
    buffer[offset] = (value >>> 24) & 0xff;
    buffer[offset + 1] = (value >>> 16) & 0xff;
    buffer[offset + 2] = (value >>> 8) & 0xff;
    buffer[offset + 3] = value & 0xff;
  } else {
    buffer[offset + 3] = (value >>> 24) & 0xff;
    buffer[offset + 2] = (value >>> 16) & 0xff;
    buffer[offset + 1] = (value >>> 8) & 0xff;
    buffer[offset] = value & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;
SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;
SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;
SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;
SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;
SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;
SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;
SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;
SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;
SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;
SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;
SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;
SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;
SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;
SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;
SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;
SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;
SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;
SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;
SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;
SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;
SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;
SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;
SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;
SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;
SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;
SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;
SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;
});

require.define("assert",function(require,module,exports,__dirname,__filename,process){// UTILITY
var util = require('util');
var Buffer = require("buffer").Buffer;
var pSlice = Array.prototype.slice;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.message = options.message;
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
};
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (value === undefined) {
    return '' + value;
  }
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (typeof value === 'function' || value instanceof RegExp) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (typeof s == 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

assert.AssertionError.prototype.toString = function() {
  if (this.message) {
    return [this.name + ':', this.message].join(' ');
  } else {
    return [
      this.name + ':',
      truncate(JSON.stringify(this.actual, replacer), 128),
      this.operator,
      truncate(JSON.stringify(this.expected, replacer), 128)
    ].join(' ');
  }
};

// assert.AssertionError instanceof Error

assert.AssertionError.__proto__ = Error.prototype;

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!!!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = Object.keys(a),
        kb = Object.keys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (expected instanceof RegExp) {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail('Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail('Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};
});

require.define("/node_modules/buffer-browserify/node_modules/base64-js/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"lib/b64.js"}});

require.define("/node_modules/buffer-browserify/node_modules/base64-js/lib/b64.js",function(require,module,exports,__dirname,__filename,process){(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());
});

require.define("/node_modules/buffer-browserify/buffer_ieee754.js",function(require,module,exports,__dirname,__filename,process){exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};
});

require.define("/node_modules/through/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"index.js"}});

require.define("/node_modules/through/index.js",function(require,module,exports,__dirname,__filename,process){var Stream = require('stream')

// through
//
// a stream that does nothing but re-emit the input.
// useful for aggregating a series of changing but not ending streams into one stream)



exports = module.exports = through
through.through = through

//create a readable writable stream.

function through (write, end) {
  write = write || function (data) { this.queue(data) }
  end = end || function () { this.queue(null) }

  var ended = false, destroyed = false, buffer = []
  var stream = new Stream()
  stream.readable = stream.writable = true
  stream.paused = false

  stream.write = function (data) {
    write.call(this, data)
    return !stream.paused
  }

  function drain() {
    while(buffer.length && !stream.paused) {
      var data = buffer.shift()
      if(null === data)
        return stream.emit('end')
      else
        stream.emit('data', data)
    }
  }

  stream.queue = function (data) {
    buffer.push(data)
    drain()
    return stream
  }

  //this will be registered as the first 'end' listener
  //must call destroy next tick, to make sure we're after any
  //stream piped from here.
  //this is only a problem if end is not emitted synchronously.
  //a nicer way to do this is to make sure this is the last listener for 'end'

  stream.on('end', function () {
    stream.readable = false
    if(!stream.writable)
      process.nextTick(function () {
        stream.destroy()
      })
  })

  function _end () {
    stream.writable = false
    end.call(stream)
    if(!stream.readable)
      stream.destroy()
  }

  stream.end = function (data) {
    if(ended) return
    ended = true
    if(arguments.length) stream.write(data)
    _end() // will emit or queue
    return stream
  }

  stream.destroy = function () {
    if(destroyed) return
    destroyed = true
    ended = true
    buffer.length = 0
    stream.writable = stream.readable = false
    stream.emit('close')
    return stream
  }

  stream.pause = function () {
    if(stream.paused) return
    stream.paused = true
    stream.emit('pause')
    return stream
  }
  stream.resume = function () {
    if(stream.paused) {
      stream.paused = false
    }
    drain()
    //may have become paused again,
    //as drain emits 'data'.
    if(!stream.paused)
      stream.emit('drain')
    return stream
  }
  return stream
}

});

require.define("/css3d/lib/grid-map.js",function(require,module,exports,__dirname,__filename,process){var win = require('./screen')()
  , gridLayer = require('gridlayer')
  , utils = require('./getCSSPrimitiveValue')
  ;

module.exports = function(id, resx, resy){

  if(!resx) resx = 10;
  if(!resy) resy = resx;

  var el = document.getElementById(id);

  var style = window.getComputedStyle(el)
    ,  undefinedProperties = []
  ;

  el.computedStyles = {};

  Array.prototype.slice.call(style).forEach(function(x){
      var val = el.computedStyles[x] = style.getPropertyCSSValue(x);
      var primitives = utils(val);
      if(!primitives){
  	undefinedProperties.push(o)
	return
      }
      val.primitiveTypeString = primitives.type;
      val.type = primitives.value.type;
      val.value = primitives.value.val;
      val.unit = primitives.value.unit;
      val.property = x;
  });

  console.log(el.computedStyles)

  var x = el.computedStyles.width.value;
  var y = el.computedStyles.height.value;

  var grid = gridLayer(x / resx, y / resy)

//  console.log(x, y, grid)

  return grid

}
});

require.define("/css3d/lib/screen.js",function(require,module,exports,__dirname,__filename,process){module.exports = function(){

  var data = [];

  data[0] = window.innderWidth;
  data[1] = window.innerHeight;

  return data;

}
});

require.define("/node_modules/gridlayer/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"index.js"}});

require.define("/node_modules/gridlayer/index.js",function(require,module,exports,__dirname,__filename,process){module.exports = Board;

function Board (x,y){

	var grid = (x && y) ? matrix(x,y) : matrix(8,8);
			
	return grid
	
	function matrix(x,y){
		var arr = []
			,	n = x * y
		;
		
		var zerone = true; // [0,0] is top-left = white
		
		function Position(zerone, ordinal){
			var position = {};
			position.zerone = zerone;
			position.ordinal = ordinal;
			position.y = i % x;
			position.x = Math.floor(i / x);
			return position
		}
		
		for (i = 0; i < n; ++i)
		{
			arr[i] = Position(zerone, i);
			zerone = !zerone
		}
				
		return toMatrix.call(arr, x)
		
	};
		
};

function toMatrix(quantiles) {
      var indexes = []
        , matrix = []
        , matrixLength = quantiles || 2

      for (var i=0; i<matrixLength; i++) {
        indexes[i] = []

        if (!!indexes[i-1]) 
          indexes[i][0] = indexes[i-1][1]
        else 
          indexes[i][0] = 0

        if (i === matrixLength) 
          indexes[i][1] = this.length - 1
        else 
          indexes[i][1] = Math.round((this.length)*(i+1) / matrixLength) //-1

        matrix[i] = this.slice(indexes[i][0], indexes[i][1])

      }
      return matrix
    }});

require.define("/css3d/lib/getCSSPrimitiveValue.js",function(require,module,exports,__dirname,__filename,process){module.exports = function(propValue){
    var valueType = propValue.__proto__.constructor.name
    ;
    switch(valueType.toLowerCase()){
    case 'cssvalue':
	return {type: 'cssValue', value : {unit: '', type: propValue.cssValueType, val: propValue.cssText}};
	break;
    case 'cssvaluelist':
	var l = propValue.length;
        var obj = {};
	obj.type = 'cssPrimitiveValue'
	obj.value = Array.prototype.slice.call(propValue).map(function(x){ return CSSGetPrimitiveValue(x)});
        return obj;
	break;
    case 'cssprimitivevalue':
	return {type: 'cssPrimitiveValue', value : CSSGetPrimitiveValue(propValue)};
	break;
    case 'svgpaint':
	return {type: 'SVGPaint', value : CSSGetPrimitiveValue(propValue)};
	break;
    }

};

function CSSGetPrimitiveValue(value) {
		try {

				var valueType = value.primitiveType;

			  if (CSSPrimitiveValue.CSS_PX == valueType) {
					return {class: CSSPrimitiveValue.CSS_PX, unit : 'px', type: 'float', val : value.getFloatValue (valueType)};
			  }

			  if (valueType == CSSPrimitiveValue.CSS_NUMBER) {
					return {class: CSSPrimitiveValue.CSS_NUMBER, unit : '', type: 'float', val : value.getFloatValue (valueType)};
			  }

			  if (valueType == CSSPrimitiveValue.CSS_PERCENTAGE) {
					return {class: CSSPrimitiveValue.CSS_PERCENTAGE, unit : '%', type: 'float', val : value.getFloatValue (valueType)};
			  }

			  if (CSSPrimitiveValue.CSS_EMS == valueType) {
					return {class: CSSPrimitiveValue.CSS_EMS, unit : 'em', type: 'float', val : value.getFloatValue (valueType)};
			  }

			  if (CSSPrimitiveValue.CSS_CM == valueType) {
					return {class: CSSPrimitiveValue.CSS_CM, unit : 'cm', type: 'float', val : value.getFloatValue (valueType)};
			  }

			  if (CSSPrimitiveValue.CSS_IDENT == valueType) {
					return {class: CSSPrimitiveValue.CSS_IDENT, unit : '', type: 'string', val : value.getStringValue (valueType)};
			  }

			  if (CSSPrimitiveValue.CSS_EXS == valueType) {
					return {class: CSSPrimitiveValue.CSS_EXS, unit : 'ex', type: 'float', val : value.getFloatValue (valueType)};
			  }

			  if (CSSPrimitiveValue.CSS_IN == valueType) {
					return {class: CSSPrimitiveValue.CSS_IN, unit : 'in', type: 'float', val : value.getFloatValue (valueType)};
			  }

			  if (CSSPrimitiveValue.CSS_MM == valueType) {
					return {class: CSSPrimitiveValue.CSS_MM, unit : 'mm', type: 'float', val : value.getFloatValue (valueType)};
			  }

			  if (CSSPrimitiveValue.CSS_PC == valueType) {
					return {class: CSSPrimitiveValue.CSS_PC, unit : 'pc', type: 'float', val : value.getFloatValue (valueType)};
			  }

			  if (CSSPrimitiveValue.CSS_PT == valueType) {
					return {class: CSSPrimitiveValue.CSS_PT, unit : 'pt', type: 'float', val : value.getFloatValue (valueType)};
			  }

			 	if (valueType == CSSPrimitiveValue.CSS_DIMENSION){
					return {class: CSSPrimitiveValue.CSS_DIMENSION, unit : '', type: 'float', val : value.getFloatValue (valueType)};
				}

			  if (CSSPrimitiveValue.CSS_STRING <= valueType && valueType <= CSSPrimitiveValue.CSS_ATTR) {
			     return {unit : '', type: 'string', val: value.getStringValue (valueType)};
			  }

			  if (valueType == CSSPrimitiveValue.CSS_COUNTER) {
			    var counterValue = value.getCounterValue ();
					return {
						class: CSSPrimitiveValue.CSS_COUNTER,
						unit: '',
						type: 'counter',
						val : {
							identifier: counterValue.identifier,
							listStyle: counterValue.listStyle,
							separator: counterValue.separator
						}};
			   }

			   if (valueType == CSSPrimitiveValue.CSS_RECT) {
			      var rect = value.getRectValue ()
			       	,	topPX = rect.top.getFloatValue (CSSPrimitiveValue.CSS_PX)
			       	,	rightPX = rect.right.getFloatValue (CSSPrimitiveValue.CSS_PX)
			       	,	bottomPX = rect.bottom.getFloatValue (CSSPrimitiveValue.CSS_PX)
			       	,	leftPX = rect.left.getFloatValue (CSSPrimitiveValue.CSS_PX)
						;
						return {
							class: CSSPrimitiveValue.CSS_RECT,
							unit: 'px',
							type: 'rect',
							val: {
								top: topPX,
								right: rightPX,
								bottom: bottomPX,
								left: leftPX
							}};
			   }

			   if (valueType == CSSPrimitiveValue.CSS_RGBCOLOR) {
			      var rgb = value.getRGBColorValue ()
			       	,	r = rgb.red.getFloatValue (CSSPrimitiveValue.CSS_NUMBER)
			       	,	g = rgb.green.getFloatValue (CSSPrimitiveValue.CSS_NUMBER)
			       	, b = rgb.blue.getFloatValue (CSSPrimitiveValue.CSS_NUMBER)
						;

						return {
							class: CSSPrimitiveValue.CSS_RGBCOLOR,
							unit: '',
							type: 'rgb',
							val: {
								r: r,
								g: g,
								b: b,
							}};
			   }

				if (CSSPrimitiveValue.CSS_GRAD == valueType >= CSSPrimitiveValue.CSS_DEG ) {
					return {class: CSSPrimitiveValue.CSS_GRAD, unit : 'grad', type: 'angle', val : value.getFloatValue (valueType)};
				}

				if(valueType == CSSPrimitiveValue.CSS_DEG) {
					return {class: CSSPrimitiveValue.CSS_DEG, unit : 'deg', type: 'angle', val : value.getFloatValue (valueType)};
				}

				if(valueType == CSSPrimitiveValue.CSS_RAD) {
					return {class: CSSPrimitiveValue.CSS_RAD, unit : 'radian', type: 'angle', val : value.getFloatValue (valueType)};
				}

				if(CSSPrimitiveValue.CSS_S == valueType ) {
					return {class: CSSPrimitiveValue.CSS_S, unit : '', type: 'time', val : value.getFloatValue (valueType)};
				}

				if(valueType == CSSPrimitiveValue.CSS_MS ) {
					return {class: CSSPrimitiveValue.CSS_MS, unit : '', type: 'time', val : value.getFloatValue (valueType)};
				}

				if(!valueType) {
					return {class: undefined, unit : '', type: 'unknown', val : value.cssText};
				}

			return {class: undefined, unit : '', type: 'unknown', val : value.cssText};

		}

		catch (Err){	   
			return {class: 'unknown', unit : '', type: value.propValue.__proto__.constructor.name, val : value.cssText};
		}
};
});

require.define("/css3d/lib/spherical-context.js",function(require,module,exports,__dirname,__filename,process){var matrix = require('./matrix')

module.exports = function(radius, perspective){

  var wx = window.innerWidth
    , wy = window.innerHeight
    , bcode = '-webkit-'
  ;

  var style = document.createElement('style')
    , stage = document.createElement('div')
    , arena = document.createElement('div')
  ; 

  stage.classList.add('maketrix-stage');
  arena.classList.add('maketrix-arena');
  arena.id = 'mx-arena';
  stage.id = 'mx-stage';
//  stage.appendChild(arena)
  document.body.appendChild(arena);

  style.textContent = CSS(radius, perspective, bcode);
  style.id = 'maketrix-style';
  document.body.appendChild(style);
  style = Array.prototype.slice.call(document.styleSheets)
	  .reduce(function(acc, e){ 
	    if(e.ownerNode.id == 'maketrix-style') return e}, []);
  console.log(style);

  window.addEventListener('mousemove', function(e){
      document.body.style['-webkit-perspective'] = e.clientY *2;

      arena.style['-webkit-transform'] = 'translateZ(-'+e.clientX *2+'px)';
//    style.cssRules[0].style.cssText += '-webkit-perspective:'+e.clientX *2+'px;'
  }, false);
  matrix(stage, arena);

//  return {stage: stage, arena: arena, stylesheet: style}

}

function CSS(radius, perspective, bcode){
    var css = '' +
	'.maketrix-stage {' +
	'  width: 1px;' +
	'  height: 1px;' + 
	'  margin: 300px auto;' +
	'  '+bcode+'transform-style: preserve-3d;' +
	'}' +
	'.maketrix-arena{'+
	'  width: 1px;' +
	'  height: 1px;' +
	'  margin: 300px auto;' +
	'  '+bcode+'transform: translateZ(-700px);' +
	'  '+bcode+'transform-style: preserve-3d;' +
	'  '+bcode+'transform-origin: 50% 50% -'+0+'px}' + 
	'.maketrix-object{' +
	'  position:absolute;' +
	'}'
    return css
}
});

require.define("/css3d/lib/matrix.js",function(require,module,exports,__dirname,__filename,process){var generateMatrix = require('./maketrix');

module.exports = function(stage, arena){
    var y = plusminus(200);
    var z = 0;
    var a
    , dots = []
    ;


    for(a = 1; a <= 360/2; a++){
	var dot = document.createElement('div');
	dot.classList.add('dot');
	var el = document.createElement('div');
	el.appendChild(dot);
	dots.push(el);
	el.classList.add('maketrix-object');
	el.id = 'dot' + a;
	arena.appendChild(el);
	el.coords = [a * 2, a * 2, 90]
	var t = Math.sin((360 / a / 2)) * 300
	el.x = 360 * Math.random()
	el.style['-webkit-transform-origin'] = '50% 50% -'+70+'px ';
	el.style['-webkit-transform'] = generateMatrix(el.x, a* 2, 0,0,0, 700, 1)
       el.z = 10
       el.a = a*2
//       el.x = 0
	el.o = 700
    }

    function rotate(){
     z+=11
      var els = [].slice.call(document.querySelectorAll('.maketrix-object'));
      els.forEach(function(e){
	  var q =  z * Math.random();
        e.style['-webkit-transform'] = generateMatrix(z * Math.random(), z * Math.random(),0,0,0,q, 1);
	e.style['-webkit-transform-origin'] = '50% 50% -'+q+'px ';
      })
      arena.style['-webkit-transform'] = '';
      arena.style['-webkit-transition'] = '';
      arena.style['-webkit-transform'] = generateMatrix(0, 0 ,0,0,0, -z, 1);
      arena.style['-webkit-transition'] = 'all 1s linear';
    }

    arena.addEventListener( 'webkitTransitionEnd', rotate, false );
    setInterval(rotate, 100);


}

function plusminus(num){

  var flip = true
  num = num;

  return function(){
    flip = !flip;
    var a = flip ? num : num * -1
    return a * Math.random()
  }

}
});

require.define("/css3d/lib/maketrix.js",function(require,module,exports,__dirname,__filename,process){// returns a CSS string for matrix3D 

var $M = require('../sylvester/lib/node-sylvester').$M;
window.myth = require('../sylvester/lib/node-sylvester');
var deg2rad = Math.PI / 180;

module.exports = generateMatrix;

function generateMatrix(rotateX, rotateY, rotateZ, tx, ty, translateZ, scale){
    var rotationXMatrix, rotationYMatrix, rotationZMatrix, s, scaleMatrix, transformationMatrix, translationMatrix;
    rotationXMatrix = $M([[1, 0, 0, 0], [0, Math.cos(rotateX * deg2rad), Math.sin(-rotateX * deg2rad), 0], [0, Math.sin(rotateX * deg2rad), Math.cos(rotateX * deg2rad), 0], [0, 0, 0, 1]]);
    rotationYMatrix = $M([[Math.cos(rotateY * deg2rad), 0, Math.sin(rotateY * deg2rad), 0], [0, 1, 0, 0], [Math.sin(-rotateY * deg2rad), 0, Math.cos(rotateY * deg2rad), 0], [0, 0, 0, 1]]);
    rotationZMatrix = $M([[Math.cos(rotateZ * deg2rad), Math.sin(-rotateZ * deg2rad), 0, 0], [Math.sin(rotateZ * deg2rad), Math.cos(rotateZ * deg2rad), 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);
    scaleMatrix = $M([[scale, 0, 0, 0], [0, scale, 0, 0], [0, 0, scale, 0], [0, 0, 0, 1]]);
    translationMatrix = $M([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0],[tx, ty, translateZ, 1]]);
 //   translationMatrix = $M([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [Math.sin(rotateX * deg2rad) * 250 + 250, Math.sin(rotateY * deg2rad) * 150 + 150, 0, 1]]);
    transformationMatrix = rotationXMatrix.x(rotationYMatrix).x(rotationZMatrix).x(scaleMatrix).x(translationMatrix);
    s = "matrix3d(";
    s += transformationMatrix.e(1, 1).toFixed(10) + "," + transformationMatrix.e(1, 2).toFixed(10) + "," + transformationMatrix.e(1, 3) + "," + transformationMatrix.e(1, 4).toFixed(10) + ",";
    s += transformationMatrix.e(2, 1).toFixed(10) + "," + transformationMatrix.e(2, 2).toFixed(10) + "," + transformationMatrix.e(2, 3) + "," + transformationMatrix.e(2, 4).toFixed(10) + ",";
    s += transformationMatrix.e(3, 1).toFixed(10) + "," + transformationMatrix.e(3, 2).toFixed(10) + "," + transformationMatrix.e(3, 3) + "," + transformationMatrix.e(3, 4).toFixed(10) + ",";
    s += transformationMatrix.e(4, 1).toFixed(10) + "," + transformationMatrix.e(4, 2).toFixed(10) + "," + transformationMatrix.e(4, 3) + "," + transformationMatrix.e(4, 4).toFixed(10);
    s += ")";
    return s	
}
});

require.define("/css3d/lib/sylvester/lib/node-sylvester/index.js",function(require,module,exports,__dirname,__filename,process){// Copyright (c) 2011, Chris Umbel

exports.Vector = require('./vector');
exports.$V = exports.Vector.create;
exports.Matrix = require('./matrix');
exports.$M = exports.Matrix.create;
exports.Line = require('./line');
exports.$L = exports.Line.create;
exports.Plane = require('./plane');
exports.$P = exports.Plane.create;
exports.Line.Segment = require('./line.segment');
exports.Sylvester = require('./sylvester');
});

require.define("/css3d/lib/sylvester/lib/node-sylvester/vector.js",function(require,module,exports,__dirname,__filename,process){// Copyright (c) 2011, Chris Umbel, James Coglan
// This file is required in order for any other classes to work. Some Vector methods work with the
// other Sylvester classes and are useless unless they are included. Other classes such as Line and
// Plane will not function at all without Vector being loaded first.

var Sylvester = require('./sylvester'),
Matrix = require('./matrix');

function Vector() {}
Vector.prototype = {

    norm: function() {
	var n = this.elements.length;
	var sum = 0;

	while (n--) {
	    sum += Math.pow(this.elements[n], 2);
	}

	return Math.sqrt(sum);
    },

    // Returns element i of the vector
    e: function(i) {
      return (i < 1 || i > this.elements.length) ? null : this.elements[i - 1];
    },

    // Returns the number of rows/columns the vector has
    dimensions: function() {
      return {rows: 1, cols: this.elements.length};
    },

    // Returns the number of rows in the vector
    rows: function() {
      return 1;
    },

    // Returns the number of columns in the vector
    cols: function() {
      return this.elements.length;
    },

    // Returns the modulus ('length') of the vector
    modulus: function() {
      return Math.sqrt(this.dot(this));
    },

    // Returns true iff the vector is equal to the argument
    eql: function(vector) {
    	var n = this.elements.length;
    	var V = vector.elements || vector;
    	if (n != V.length) { return false; }
    	while (n--) {
    	    if (Math.abs(this.elements[n] - V[n]) > Sylvester.precision) { return false; }
    	}
    	return true;
    },

    // Returns a copy of the vector
    dup: function() {
	    return Vector.create(this.elements);
    },

    // Maps the vector to another vector according to the given function
    map: function(fn) {
	var elements = [];
	this.each(function(x, i) {
	    elements.push(fn(x, i));
	});
	return Vector.create(elements);
    },

    // Calls the iterator for each element of the vector in turn
    each: function(fn) {
	var n = this.elements.length;
	for (var i = 0; i < n; i++) {
	    fn(this.elements[i], i + 1);
	}
    },

    // Returns a new vector created by normalizing the receiver
    toUnitVector: function() {
	var r = this.modulus();
	if (r === 0) { return this.dup(); }
	return this.map(function(x) { return x / r; });
    },

    // Returns the angle between the vector and the argument (also a vector)
    angleFrom: function(vector) {
	var V = vector.elements || vector;
	var n = this.elements.length, k = n, i;
	if (n != V.length) { return null; }
	var dot = 0, mod1 = 0, mod2 = 0;
	// Work things out in parallel to save time
	this.each(function(x, i) {
	    dot += x * V[i - 1];
	    mod1 += x * x;
	    mod2 += V[i - 1] * V[i - 1];
	});
	mod1 = Math.sqrt(mod1); mod2 = Math.sqrt(mod2);
	if (mod1 * mod2 === 0) { return null; }
	var theta = dot / (mod1 * mod2);
	if (theta < -1) { theta = -1; }
	if (theta > 1) { theta = 1; }
	return Math.acos(theta);
    },

    // Returns true iff the vector is parallel to the argument
    isParallelTo: function(vector) {
	var angle = this.angleFrom(vector);
	return (angle === null) ? null : (angle <= Sylvester.precision);
    },

    // Returns true iff the vector is antiparallel to the argument
    isAntiparallelTo: function(vector) {
	var angle = this.angleFrom(vector);
	return (angle === null) ? null : (Math.abs(angle - Math.PI) <= Sylvester.precision);
    },

    // Returns true iff the vector is perpendicular to the argument
    isPerpendicularTo: function(vector) {
	var dot = this.dot(vector);
	return (dot === null) ? null : (Math.abs(dot) <= Sylvester.precision);
    },

    // Returns the result of adding the argument to the vector
    add: function(value) {
	var V = value.elements || value;

	if (this.elements.length != V.length) 
	    return this.map(function(v) { return v + value });
	else
	    return this.map(function(x, i) { return x + V[i - 1]; });
    },

    // Returns the result of subtracting the argument from the vector
    subtract: function(v) {
	if (typeof(v) == 'number')
	    return this.map(function(k) { return k - v; });

	var V = v.elements || v;
	if (this.elements.length != V.length) { return null; }
	return this.map(function(x, i) { return x - V[i - 1]; });
    },

    // Returns the result of multiplying the elements of the vector by the argument
    multiply: function(k) {
	return this.map(function(x) { return x * k; });
    },

    elementMultiply: function(v) {
	return this.map(function(k, i) {
	    return v.e(i) * k;
	});
    },

    sum: function() {
	var sum = 0;
	this.map(function(x) { sum += x;});
	return sum;
    },

    chomp: function(n) {
	var elements = [];

	for (var i = n; i < this.elements.length; i++) {
	    elements.push(this.elements[i]);
	}

	return Vector.create(elements);
    },

    top: function(n) {
	var elements = [];

	for (var i = 0; i < n; i++) {
	    elements.push(this.elements[i]);
	}

	return Vector.create(elements);
    },

    augment: function(elements) {
	var newElements = this.elements;

	for (var i = 0; i < elements.length; i++) {
	    newElements.push(elements[i]);
	}

	return Vector.create(newElements);
    },

    x: function(k) { return this.multiply(k); },

    log: function() {
	return Vector.log(this);
    },

    elementDivide: function(vector) {
	return this.map(function(v, i) {
	    return v / vector.e(i);
	});
    },

    product: function() {
	var p = 1;

	this.map(function(v) {
	    p *= v;
	});

	return p;
    },

    // Returns the scalar product of the vector with the argument
    // Both vectors must have equal dimensionality
    dot: function(vector) {
	var V = vector.elements || vector;
	var i, product = 0, n = this.elements.length;	
	if (n != V.length) { return null; }
	while (n--) { product += this.elements[n] * V[n]; }
	return product;
    },

    // Returns the vector product of the vector with the argument
    // Both vectors must have dimensionality 3
    cross: function(vector) {
	var B = vector.elements || vector;
	if (this.elements.length != 3 || B.length != 3) { return null; }
	var A = this.elements;
	return Vector.create([
	    (A[1] * B[2]) - (A[2] * B[1]),
	    (A[2] * B[0]) - (A[0] * B[2]),
	    (A[0] * B[1]) - (A[1] * B[0])
	]);
    },

    // Returns the (absolute) largest element of the vector
    max: function() {
	var m = 0, i = this.elements.length;
	while (i--) {
	    if (Math.abs(this.elements[i]) > Math.abs(m)) { m = this.elements[i]; }
	}
	return m;
    },


    maxIndex: function() {
	var m = 0, i = this.elements.length;
	var maxIndex = -1;

	while (i--) {
	    if (Math.abs(this.elements[i]) > Math.abs(m)) { 
		m = this.elements[i]; 
		maxIndex = i + 1;
	    }
	}

	return maxIndex;
    },


    // Returns the index of the first match found
    indexOf: function(x) {
	var index = null, n = this.elements.length;
	for (var i = 0; i < n; i++) {
	    if (index === null && this.elements[i] == x) {
		index = i + 1;
	    }
	}
	return index;
    },

    // Returns a diagonal matrix with the vector's elements as its diagonal elements
    toDiagonalMatrix: function() {
	return Matrix.Diagonal(this.elements);
    },

    // Returns the result of rounding the elements of the vector
    round: function() {
	return this.map(function(x) { return Math.round(x); });
    },

    // Transpose a Vector, return a 1xn Matrix
    transpose: function() {
	var rows = this.elements.length;
	var elements = [];

	for (var i = 0; i < rows; i++) {
	    elements.push([this.elements[i]]);
	}
	return Matrix.create(elements);
    },

    // Returns a copy of the vector with elements set to the given value if they
    // differ from it by less than Sylvester.precision
    snapTo: function(x) {
	return this.map(function(y) {
	    return (Math.abs(y - x) <= Sylvester.precision) ? x : y;
	});
    },

    // Returns the vector's distance from the argument, when considered as a point in space
    distanceFrom: function(obj) {
	if (obj.anchor || (obj.start && obj.end)) { return obj.distanceFrom(this); }
	var V = obj.elements || obj;
	if (V.length != this.elements.length) { return null; }
	var sum = 0, part;
	this.each(function(x, i) {
	    part = x - V[i - 1];
	    sum += part * part;
	});
	return Math.sqrt(sum);
    },

    // Returns true if the vector is point on the given line
    liesOn: function(line) {
	return line.contains(this);
    },

    // Return true iff the vector is a point in the given plane
    liesIn: function(plane) {
	return plane.contains(this);
    },

    // Rotates the vector about the given object. The object should be a
    // point if the vector is 2D, and a line if it is 3D. Be careful with line directions!
    rotate: function(t, obj) {
	var V, R = null, x, y, z;
	if (t.determinant) { R = t.elements; }
	switch (this.elements.length) {
	case 2:
            V = obj.elements || obj;
            if (V.length != 2) { return null; }
            if (!R) { R = Matrix.Rotation(t).elements; }
            x = this.elements[0] - V[0];
            y = this.elements[1] - V[1];
            return Vector.create([
		V[0] + R[0][0] * x + R[0][1] * y,
		V[1] + R[1][0] * x + R[1][1] * y
            ]);
            break;
	case 3:
            if (!obj.direction) { return null; }
            var C = obj.pointClosestTo(this).elements;
            if (!R) { R = Matrix.Rotation(t, obj.direction).elements; }
            x = this.elements[0] - C[0];
            y = this.elements[1] - C[1];
            z = this.elements[2] - C[2];
            return Vector.create([
		C[0] + R[0][0] * x + R[0][1] * y + R[0][2] * z,
		C[1] + R[1][0] * x + R[1][1] * y + R[1][2] * z,
		C[2] + R[2][0] * x + R[2][1] * y + R[2][2] * z
            ]);
            break;
	default:
            return null;
	}
    },

    // Returns the result of reflecting the point in the given point, line or plane
    reflectionIn: function(obj) {
	if (obj.anchor) {
	    // obj is a plane or line
	    var P = this.elements.slice();
	    var C = obj.pointClosestTo(P).elements;
	    return Vector.create([C[0] + (C[0] - P[0]), C[1] + (C[1] - P[1]), C[2] + (C[2] - (P[2] || 0))]);
	} else {
	    // obj is a point
	    var Q = obj.elements || obj;
	    if (this.elements.length != Q.length) { return null; }
	    return this.map(function(x, i) { return Q[i - 1] + (Q[i - 1] - x); });
	}
    },

    // Utility to make sure vectors are 3D. If they are 2D, a zero z-component is added
    to3D: function() {
	var V = this.dup();
	switch (V.elements.length) {
	case 3: break;
	case 2: V.elements.push(0); break;
	default: return null;
	}
	return V;
    },

    // Returns a string representation of the vector
    inspect: function() {
	return '[' + this.elements.join(', ') + ']';
    },

    // Set vector's elements from an array
    setElements: function(els) {
	this.elements = (els.elements || els).slice();
	return this;
    }
};

// Constructor function
Vector.create = function(elements) {
    var V = new Vector();
    return V.setElements(elements);
};

// i, j, k unit vectors
Vector.i = Vector.create([1, 0, 0]);
Vector.j = Vector.create([0, 1, 0]);
Vector.k = Vector.create([0, 0, 1]);

// Random vector of size n
Vector.Random = function(n) {
    var elements = [];
    while (n--) { elements.push(Math.random()); }
    return Vector.create(elements);
};

Vector.Fill = function(n, v) {
    var elements = [];
    while (n--) { elements.push(v); }
    return Vector.create(elements);
};

// Vector filled with zeros
Vector.Zero = function(n) {
    return Vector.Fill(n, 0);
};

Vector.One = function(n) {
    return Vector.Fill(n, 1);
};

Vector.log = function(v) {
    return v.map(function(x) {
	return Math.log(x);
    });
};

module.exports = Vector;
});

require.define("/css3d/lib/sylvester/lib/node-sylvester/sylvester.js",function(require,module,exports,__dirname,__filename,process){// Copyright (c) 2011, Chris Umbel, James Coglan
// This file is required in order for any other classes to work. Some Vector methods work with the
// other Sylvester classes and are useless unless they are included. Other classes such as Line and
// Plane will not function at all without Vector being loaded first.           

Math.sign = function(x) {
    return x < 0 ? -1: 1;
}
                                              
var Sylvester = {
    precision: 1e-6,
    approxPrecision: 1e-5
};

module.exports = Sylvester;
});

require.define("/css3d/lib/sylvester/lib/node-sylvester/matrix.js",function(require,module,exports,__dirname,__filename,process){// Copyright (c) 2011, Chris Umbel, James Coglan
// Matrix class - depends on Vector.

var fs = require('fs');
var Sylvester = require('./sylvester');
var Vector = require('./vector');

// augment a matrix M with identity rows/cols
function identSize(M, m, n, k) {
    var e = M.elements;
    var i = k - 1;

    while(i--) {
	var row = [];
	
	for(var j = 0; j < n; j++)
	    row.push(j == i ? 1 : 0);
	
        e.unshift(row);
    }
    
    for(var i = k - 1; i < m; i++) {
        while(e[i].length < n)
            e[i].unshift(0);
    }

    return $M(e);
}

function pca(X) {
    var Sigma = X.transpose().x(X).x(1 / X.rows());
    var svd = Sigma.svd();
    return {U: svd.U, S: svd.S};
}

// singular value decomposition in pure javascript
function svdJs() {
    var A = this;
    var V = Matrix.I(A.rows());
    var S = A.transpose();
    var U = Matrix.I(A.cols());
    var err = Number.MAX_VALUE;
    var i = 0;
    var maxLoop = 100;

    while(err > 2.2737e-13 && i < maxLoop) {
        var qr = S.transpose().qrJs();
        S = qr.R;
        V = V.x(qr.Q);
        qr = S.transpose().qrJs();
        U = U.x(qr.Q);
        S = qr.R;

        var e = S.triu(1).unroll().norm();
        var f = S.diagonal().norm();

        if(f == 0)
            f = 1;

        err = e / f;

        i++;
    }

    var ss = S.diagonal();
    var s = [];

    for(var i = 1; i <= ss.cols(); i++) {
        var ssn = ss.e(i);
        s.push(Math.abs(ssn));

        if(ssn < 0) {
            for(var j = 0; j < U.rows(); j++) {
                V.elements[j][i - 1] = -(V.elements[j][i - 1]);
            }
        }
    }

    return {U: U, S: $V(s).toDiagonalMatrix(), V: V};
}

// singular value decomposition using LAPACK
function svdPack() {
    var result = lapack.sgesvd('A', 'A', this.elements);

    return {
        U: $M(result.U),
        S: $M(result.S).column(1).toDiagonalMatrix(),
	V: $M(result.VT).transpose()
    };
}

// QR decomposition in pure javascript
function qrJs() {
    var m = this.rows();
    var n = this.cols();
    var Q = Matrix.I(m);
    var A = this;
    
    for(var k = 1; k < Math.min(m, n); k++) {
	var ak = A.slice(k, 0, k, k).col(1);
	var oneZero = [1];
	
	while(oneZero.length <=  m - k)
	    oneZero.push(0);
	
	oneZero = $V(oneZero);
	var vk = ak.add(oneZero.x(ak.norm() * Math.sign(ak.e(1))));
	var Vk = $M(vk);
	var Hk = Matrix.I(m - k + 1).subtract(Vk.x(2).x(Vk.transpose()).div(Vk.transpose().x(Vk).e(1, 1)));
	var Qk = identSize(Hk, m, n, k);
	A = Qk.x(A);
	// slow way to compute Q
	Q = Q.x(Qk);
    }
    
    return {Q: Q, R: A};
}

// QR decomposition using LAPACK
function qrPack() {
    var qr = lapack.qr(this.elements);

    return {
	Q: $M(qr.Q),
	R: $M(qr.R)
    };
}

function Matrix() {}
Matrix.prototype = {
    // solve a system of linear equations (work in progress)
    solve: function(b) {
	var lu = this.lu();
	b = lu.P.x(b);
	var y = lu.L.forwardSubstitute(b);
	var x = lu.U.backSubstitute(y);
	return lu.P.x(x);
	//return this.inv().x(b);
    },

    // project a matrix onto a lower dim
    pcaProject: function(k, U) {
	var U = U || pca(this).U;
	var Ureduce= U.slice(1, U.rows(), 1, k);
	return {Z: this.x(Ureduce), U: U};
    },

    // recover a matrix to a higher dimension
    pcaRecover: function(U) {
	var k = this.cols();
	var Ureduce = U.slice(1, U.rows(), 1, k);
	return this.x(Ureduce.transpose());
    },    

    // grab the upper triangular part of the matrix
    triu: function(k) {
	if(!k)
	    k = 0;
	
	return this.map(function(x, i, j) {
	    return j - i >= k ? x : 0;
	});
    },

    // unroll a matrix into a vector
    unroll: function() {
	var v = [];
	
	for(var i = 1; i <= this.cols(); i++) {
	    for(var j = 1; j <= this.rows(); j++) {
		v.push(this.e(j, i));
	    }
	}

	return $V(v);
    },

    // return a sub-block of the matrix
    slice: function(startRow, endRow, startCol, endCol) {
	var x = [];
	
	if(endRow == 0)
	    endRow = this.rows();
	
	if(endCol == 0)
	    endCol = this.cols();

	for(i = startRow; i <= endRow; i++) {
	    var row = [];

	    for(j = startCol; j <= endCol; j++) {
		row.push(this.e(i, j));
	    }

	    x.push(row);
	}

	return $M(x);
    },

    // Returns element (i,j) of the matrix
    e: function(i,j) {
	if (i < 1 || i > this.elements.length || j < 1 || j > this.elements[0].length) { return null; }
	return this.elements[i - 1][j - 1];
    },

    // Returns row k of the matrix as a vector
    row: function(i) {
	if (i > this.elements.length) { return null; }
	return $V(this.elements[i - 1]);
    },

    // Returns column k of the matrix as a vector
    col: function(j) {
	if (j > this.elements[0].length) { return null; }
	var col = [], n = this.elements.length;
	for (var i = 0; i < n; i++) { col.push(this.elements[i][j - 1]); }
	return $V(col);
    },

    // Returns the number of rows/columns the matrix has
    dimensions: function() {
	return {rows: this.elements.length, cols: this.elements[0].length};
    },

    // Returns the number of rows in the matrix
    rows: function() {
	return this.elements.length;
    },

    // Returns the number of columns in the matrix
    cols: function() {
	return this.elements[0].length;
    },

    approxEql: function(matrix) {
	return this.eql(matrix, Sylvester.approxPrecision);
    },

    // Returns true iff the matrix is equal to the argument. You can supply
    // a vector as the argument, in which case the receiver must be a
    // one-column matrix equal to the vector.
    eql: function(matrix, precision) {
	var M = matrix.elements || matrix;
	if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
	if (this.elements.length != M.length ||
            this.elements[0].length != M[0].length) { return false; }
	var i = this.elements.length, nj = this.elements[0].length, j;
	while (i--) { j = nj;
		      while (j--) {
			  if (Math.abs(this.elements[i][j] - M[i][j]) > (precision || Sylvester.precision)) { return false; }
		      }
		    }
	return true;
    },

    // Returns a copy of the matrix
    dup: function() {
	return Matrix.create(this.elements);
    },

    // Maps the matrix to another matrix (of the same dimensions) according to the given function
    map: function(fn) {
    var els = [], i = this.elements.length, nj = this.elements[0].length, j;
	while (i--) { j = nj;
		      els[i] = [];
		      while (j--) {
			  els[i][j] = fn(this.elements[i][j], i + 1, j + 1);
		      }
		    }
	return Matrix.create(els);
    },

    // Returns true iff the argument has the same dimensions as the matrix
    isSameSizeAs: function(matrix) {
	var M = matrix.elements || matrix;
	if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
	return (this.elements.length == M.length &&
		this.elements[0].length == M[0].length);
    },

    // Returns the result of adding the argument to the matrix
    add: function(matrix) {
	if(typeof(matrix) == 'number') {
	    return this.map(function(x, i, j) { return x + matrix});
	} else {
	    var M = matrix.elements || matrix;
	    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
	    if (!this.isSameSizeAs(M)) { return null; }
	    return this.map(function(x, i, j) { return x + M[i - 1][j - 1]; });
	}
    },

    // Returns the result of subtracting the argument from the matrix
    subtract: function(matrix) {
	if(typeof(matrix) == 'number') {
	    return this.map(function(x, i, j) { return x - matrix});
	} else {
	    var M = matrix.elements || matrix;
	    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
	    if (!this.isSameSizeAs(M)) { return null; }
	    return this.map(function(x, i, j) { return x - M[i - 1][j - 1]; });
	}
    },

    // Returns true iff the matrix can multiply the argument from the left
    canMultiplyFromLeft: function(matrix) {
	var M = matrix.elements || matrix;
	if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
	// this.columns should equal matrix.rows
	return (this.elements[0].length == M.length);
    },

    // Returns the result of a multiplication-style operation the matrix from the right by the argument.
    // If the argument is a scalar then just operate on all the elements. If the argument is
    // a vector, a vector is returned, which saves you having to remember calling
    // col(1) on the result.
    mulOp: function(matrix, op) {
	if (!matrix.elements) {
	    return this.map(function(x) { return op(x, matrix); });
	}

	var returnVector = matrix.modulus ? true : false;
	var M = matrix.elements || matrix;
	if (typeof(M[0][0]) == 'undefined') 
	    M = Matrix.create(M).elements;
	if (!this.canMultiplyFromLeft(M)) 
	    return null; 
	var e = this.elements, rowThis, rowElem, elements = [],
        sum, m = e.length, n = M[0].length, o = e[0].length, i = m, j, k;

	while (i--) {
            rowElem = [];
            rowThis = e[i];
            j = n;

            while (j--) {
		sum = 0;
		k = o;

		while (k--) {
                    sum += op(rowThis[k], M[k][j]);
		}

		rowElem[j] = sum;
            }

            elements[i] = rowElem;
	}

	var M = Matrix.create(elements);
	return returnVector ? M.col(1) : M;
    },

    // Returns the result of dividing the matrix from the right by the argument.
    // If the argument is a scalar then just divide all the elements. If the argument is
    // a vector, a vector is returned, which saves you having to remember calling
    // col(1) on the result.
    div: function(matrix) {
	return this.mulOp(matrix, function(x, y) { return x / y});
    },

    // Returns the result of multiplying the matrix from the right by the argument.
    // If the argument is a scalar then just multiply all the elements. If the argument is
    // a vector, a vector is returned, which saves you having to remember calling
    // col(1) on the result.
    multiply: function(matrix) {
	return this.mulOp(matrix, function(x, y) { return x * y});
    },

    x: function(matrix) { return this.multiply(matrix); },

    elementMultiply: function(v) {
        return this.map(function(k, i, j) {
            return v.e(i, j) * k;
        });
    },

    // sum all elements in the matrix
    sum: function() {
        var sum = 0;

        this.map(function(x) { sum += x;});

        return sum;
    },

    // Returns a Vector of each colum averaged.
    mean: function() {
      var dim = this.dimensions();
      var r = [];
      for (var i = 1; i <= dim.cols; i++) {
        r.push(this.col(i).sum() / dim.rows);
      }
      return $V(r);
    },

    column: function(n) {
	return this.col(n);
    },

    // element-wise log
    log: function() {
	return this.map(function(x) { return Math.log(x); });
    },

    // Returns a submatrix taken from the matrix
    // Argument order is: start row, start col, nrows, ncols
    // Element selection wraps if the required index is outside the matrix's bounds, so you could
    // use this to perform row/column cycling or copy-augmenting.
    minor: function(a, b, c, d) {
	var elements = [], ni = c, i, nj, j;
	var rows = this.elements.length, cols = this.elements[0].length;
	while (ni--) {
	    i = c - ni - 1;
	    elements[i] = [];
	    nj = d;
	    while (nj--) {
		j = d - nj - 1;
		elements[i][j] = this.elements[(a + i - 1) % rows][(b + j - 1) % cols];
	    }
	}
	return Matrix.create(elements);
    },

    // Returns the transpose of the matrix
    transpose: function() {
    var rows = this.elements.length, i, cols = this.elements[0].length, j;
	var elements = [], i = cols;
	while (i--) {
	    j = rows;
	    elements[i] = [];
	    while (j--) {
		elements[i][j] = this.elements[j][i];
	    }
	}
	return Matrix.create(elements);
    },

    // Returns true iff the matrix is square
    isSquare: function() {
	return (this.elements.length == this.elements[0].length);
    },

    // Returns the (absolute) largest element of the matrix
    max: function() {
	var m = 0, i = this.elements.length, nj = this.elements[0].length, j;
	while (i--) {
	    j = nj;
	    while (j--) {
		if (Math.abs(this.elements[i][j]) > Math.abs(m)) { m = this.elements[i][j]; }
	    }
	}
	return m;
    },

    // Returns the indeces of the first match found by reading row-by-row from left to right
    indexOf: function(x) {
	var index = null, ni = this.elements.length, i, nj = this.elements[0].length, j;
	for (i = 0; i < ni; i++) {
	    for (j = 0; j < nj; j++) {
		if (this.elements[i][j] == x) { return {i: i + 1, j: j + 1}; }
	    }
	}
	return null;
    },

    // If the matrix is square, returns the diagonal elements as a vector.
    // Otherwise, returns null.
    diagonal: function() {
	if (!this.isSquare) { return null; }
	var els = [], n = this.elements.length;
	for (var i = 0; i < n; i++) {
	    els.push(this.elements[i][i]);
	}
	return $V(els);
    },

    // Make the matrix upper (right) triangular by Gaussian elimination.
    // This method only adds multiples of rows to other rows. No rows are
    // scaled up or switched, and the determinant is preserved.
    toRightTriangular: function() {
	var M = this.dup(), els;
	var n = this.elements.length, i, j, np = this.elements[0].length, p;
	for (i = 0; i < n; i++) {
	    if (M.elements[i][i] == 0) {
		for (j = i + 1; j < n; j++) {
		    if (M.elements[j][i] != 0) {
			els = [];
			for (p = 0; p < np; p++) { els.push(M.elements[i][p] + M.elements[j][p]); }
			M.elements[i] = els;
			break;
		    }
		}
	    }
	    if (M.elements[i][i] != 0) {
		for (j = i + 1; j < n; j++) {
		    var multiplier = M.elements[j][i] / M.elements[i][i];
		    els = [];
		    for (p = 0; p < np; p++) {
			// Elements with column numbers up to an including the number
			// of the row that we're subtracting can safely be set straight to
			// zero, since that's the point of this routine and it avoids having
			// to loop over and correct rounding errors later
			els.push(p <= i ? 0 : M.elements[j][p] - M.elements[i][p] * multiplier);
		    }
		    M.elements[j] = els;
		}
	    }
	}
	return M;
    },

    toUpperTriangular: function() { return this.toRightTriangular(); },

    // Returns the determinant for square matrices
    determinant: function() {
	if (!this.isSquare()) { return null; }
	if (this.cols == 1 && this.rows == 1) { return this.row(1); }
	if (this.cols == 0 && this.rows == 0) { return 1; }
	var M = this.toRightTriangular();
	var det = M.elements[0][0], n = M.elements.length;
	for (var i = 1; i < n; i++) {
	    det = det * M.elements[i][i];
	}
	return det;
    },
    det: function() { return this.determinant(); },

    // Returns true iff the matrix is singular
    isSingular: function() {
	return (this.isSquare() && this.determinant() === 0);
    },

    // Returns the trace for square matrices
    trace: function() {
	if (!this.isSquare()) { return null; }
	var tr = this.elements[0][0], n = this.elements.length;
	for (var i = 1; i < n; i++) {
	    tr += this.elements[i][i];
	}
	return tr;
    },

    tr: function() { return this.trace(); },

    // Returns the rank of the matrix
    rank: function() {
	var M = this.toRightTriangular(), rank = 0;
	var i = this.elements.length, nj = this.elements[0].length, j;
	while (i--) {
	    j = nj;
	    while (j--) {
		if (Math.abs(M.elements[i][j]) > Sylvester.precision) { rank++; break; }
	    }
	}
	return rank;
    },

    rk: function() { return this.rank(); },

    // Returns the result of attaching the given argument to the right-hand side of the matrix
    augment: function(matrix) {
	var M = matrix.elements || matrix;
	if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
	var T = this.dup(), cols = T.elements[0].length;
	var i = T.elements.length, nj = M[0].length, j;
	if (i != M.length) { return null; }
	while (i--) {
	    j = nj;
	    while (j--) {
		T.elements[i][cols + j] = M[i][j];
	    }
	}
	return T;
    },

    // Returns the inverse (if one exists) using Gauss-Jordan
    inverse: function() {
	if (!this.isSquare() || this.isSingular()) { return null; }
	var n = this.elements.length, i = n, j;
	var M = this.augment(Matrix.I(n)).toRightTriangular();
	var np = M.elements[0].length, p, els, divisor;
	var inverse_elements = [], new_element;
	// Matrix is non-singular so there will be no zeros on the diagonal
	// Cycle through rows from last to first
	while (i--) {
	    // First, normalise diagonal elements to 1
	    els = [];
	    inverse_elements[i] = [];
	    divisor = M.elements[i][i];
	    for (p = 0; p < np; p++) {
        new_element = M.elements[i][p] / divisor;
		els.push(new_element);
		// Shuffle off the current row of the right hand side into the results
		// array as it will not be modified by later runs through this loop
		if (p >= n) { inverse_elements[i].push(new_element); }
	    }
	    M.elements[i] = els;
	    // Then, subtract this row from those above it to
	    // give the identity matrix on the left hand side
	    j = i;
	    while (j--) {
		els = [];
		for (p = 0; p < np; p++) {
		    els.push(M.elements[j][p] - M.elements[i][p] * M.elements[j][i]);
		}
		M.elements[j] = els;
	    }
	}
	return Matrix.create(inverse_elements);
    },

    inv: function() { return this.inverse(); },

    // Returns the result of rounding all the elements
    round: function() {
	return this.map(function(x) { return Math.round(x); });
    },

    // Returns a copy of the matrix with elements set to the given value if they
    // differ from it by less than Sylvester.precision
    snapTo: function(x) {
	return this.map(function(p) {
	    return (Math.abs(p - x) <= Sylvester.precision) ? x : p;
	});
    },

    // Returns a string representation of the matrix
    inspect: function() {
	var matrix_rows = [];
	var n = this.elements.length;
	for (var i = 0; i < n; i++) {
	    matrix_rows.push($V(this.elements[i]).inspect());
	}
	return matrix_rows.join('\n');
    },

    // Returns a array representation of the matrix
    toArray: function() {
    	var matrix_rows = [];
    	var n = this.elements.length;
    	for (var i = 0; i < n; i++) {
        matrix_rows.push(this.elements[i]);
    	}
      return matrix_rows;
    },


    // Set the matrix's elements from an array. If the argument passed
    // is a vector, the resulting matrix will be a single column.
    setElements: function(els) {
	var i, j, elements = els.elements || els;
	if (typeof(elements[0][0]) != 'undefined') {
	    i = elements.length;
	    this.elements = [];
	    while (i--) {
		j = elements[i].length;
		this.elements[i] = [];
		while (j--) {
		    this.elements[i][j] = elements[i][j];
		}
	    }
	    return this;
	}
	var n = elements.length;
	this.elements = [];
	for (i = 0; i < n; i++) {
	    this.elements.push([elements[i]]);
	}
	return this;
    },

    // return the indexes of the columns with the largest value
    // for each row
    maxColumnIndexes: function() {
	var maxes = [];

	for(var i = 1; i <= this.rows(); i++) {
	    var max = null;
	    var maxIndex = -1;

	    for(var j = 1; j <= this.cols(); j++) {
		if(max === null || this.e(i, j) > max) {
		    max = this.e(i, j);
		    maxIndex = j;
		}
	    }

	    maxes.push(maxIndex);
	}

	return $V(maxes);
    },

    // return the largest values in each row
    maxColumns: function() {
	var maxes = [];

	for(var i = 1; i <= this.rows(); i++) {
	    var max = null;

	    for(var j = 1; j <= this.cols(); j++) {
		if(max === null || this.e(i, j) > max) {
		    max = this.e(i, j);
		}
	    }

	    maxes.push(max);
	}

	return $V(maxes);
    },

    // return the indexes of the columns with the smallest values
    // for each row
    minColumnIndexes: function() {
	var mins = [];

	for(var i = 1; i <= this.rows(); i++) {
	    var min = null;
	    var minIndex = -1;

	    for(var j = 1; j <= this.cols(); j++) {
		if(min === null || this.e(i, j) < min) {
		    min = this.e(i, j);
		    minIndex = j;
		}
	    }

	    mins.push(minIndex);
	}

	return $V(mins);
    },

    // return the smallest values in each row
    minColumns: function() {
	var mins = [];

	for(var i = 1; i <= this.rows(); i++) {
	    var min = null;

	    for(var j = 1; j <= this.cols(); j++) {
		if(min === null || this.e(i, j) < min) {
		    min = this.e(i, j);
		}
	    }

	    mins.push(min);
	}

	return $V(mins);
    },
    
    // perorm a partial pivot on the matrix. essentially move the largest
    // row below-or-including the pivot and replace the pivot's row with it.
    // a pivot matrix is returned so multiplication can perform the transform.
    partialPivot: function(k, j, P, A, L) {
	var maxIndex = 0;
	var maxValue = 0;

	for(var i = k; i <= A.rows(); i++) {
	    if(Math.abs(A.e(i, j)) > maxValue) {
		maxValue = Math.abs(A.e(k, j));
		maxIndex = i;
	    }
	}

	if(maxIndex != k) {
	    var tmp = A.elements[k - 1];
	    A.elements[k - 1] = A.elements[maxIndex - 1];
	    A.elements[maxIndex - 1] = tmp;
	    
	    P.elements[k - 1][k - 1] = 0;
	    P.elements[k - 1][maxIndex - 1] = 1;
	    P.elements[maxIndex - 1][maxIndex - 1] = 0;
	    P.elements[maxIndex - 1][k - 1] = 1;
	}
	
	return P;
    },

    // solve lower-triangular matrix * x = b via forward substitution
    forwardSubstitute: function(b) {
	var xa = [];

	for(var i = 1; i <= this.rows(); i++) {
	    var w = 0;

	    for(var j = 1; j < i; j++) {
		w += this.e(i, j) * xa[j - 1];
	    }

	    xa.push((b.e(i) - w) / this.e(i, i));
	}

	return $V(xa);
    },

    // solve an upper-triangular matrix * x = b via back substitution
    backSubstitute: function(b) {
	var xa = [];

	for(var i = this.rows(); i > 0; i--) {
	    var w = 0;

	    for(var j = this.cols(); j > i; j--) {
		w += this.e(i, j) * xa[this.rows() - j];
	    }

	    xa.push((b.e(i) - w) / this.e(i, i));
	}

	return $V(xa.reverse());
    },
    
    luPack: luPack,
    luJs: luJs,
    svdJs: svdJs,
    svdPack: svdPack,
    qrJs: qrJs,
    qrPack: qrPack
};

// LU factorization from LAPACK
function luPack() {
    var lu = lapack.lu(this.elements);
    return {
	L: $M(lu.L),
	U: $M(lu.U),
	P: $M(lu.P)
	// don't pass back IPIV
    };
}

var tolerance =  1.4901e-08;

// pure Javascript LU factorization
function luJs() {
    var A = this.dup();
    var L = Matrix.I(A.rows());
    var P = Matrix.I(A.rows());
    var U = Matrix.Zeros(A.rows(), A.cols());
    var p = 1;

    for(var k = 1; k <= Math.min(A.cols(), A.rows()); k++) {
	P = A.partialPivot(k, p, P, A, L);
	
	for(var i = k + 1; i <= A.rows(); i++) {
	    var l = A.e(i, p) / A.e(k, p);
	    L.elements[i - 1][k - 1] = l;
	    
	    for(var j = k + 1 ; j <= A.cols(); j++) {
		A.elements[i - 1][j - 1] -= A.e(k, j) * l;
	    }
	}
	
	for(var j = k; j <= A.cols(); j++) {
	    U.elements[k - 1][j - 1] = A.e(k, j);
	}

	if(p < A.cols())
	    p++;
    }    
    
    return {L: L, U: U, P: P};
}

function getLapack() {
    try {
//	return require('lapack');
    } catch(e) {}
}

var lapack;

// if node-lapack is installed use the fast, native fortran routines
if(lapack = getLapack()) {
    Matrix.prototype.svd = svdPack;
    Matrix.prototype.qr = qrPack;
    Matrix.prototype.lu = luPack;
} else {
    // otherwise use the slower pure Javascript versions
    Matrix.prototype.svd = svdJs;
    Matrix.prototype.qr = qrJs;
    Matrix.prototype.lu = luJs;
}

// Constructor function
Matrix.create = function(aElements, ignoreLapack) {
    var M = new Matrix().setElements(aElements);
    return M;
};

// Identity matrix of size n
Matrix.I = function(n) {
    var els = [], i = n, j;
    while (i--) {
	j = n;
	els[i] = [];
	while (j--) {
	    els[i][j] = (i == j) ? 1 : 0;
	}
    }
    return Matrix.create(els);
};

Matrix.loadFile = function(file) {
    var contents = fs.readFileSync(file, 'utf-8');
    var matrix = [];

    var rowArray = contents.split('\n');
    for (var i = 0; i < rowArray.length; i++) {
	var d = rowArray[i].split(',');
	if (d.length > 1) {
	    matrix.push(d);
	}
    }

    var M = new Matrix();
    return M.setElements(matrix);
};

// Diagonal matrix - all off-diagonal elements are zero
Matrix.Diagonal = function(elements) {
    var i = elements.length;
    var M = Matrix.I(i);
    while (i--) {
	M.elements[i][i] = elements[i];
    }
    return M;
};

// Rotation matrix about some axis. If no axis is
// supplied, assume we're after a 2D transform
Matrix.Rotation = function(theta, a) {
    if (!a) {
	return Matrix.create([
	    [Math.cos(theta), -Math.sin(theta)],
	    [Math.sin(theta), Math.cos(theta)]
	]);
    }
    var axis = a.dup();
    if (axis.elements.length != 3) { return null; }
    var mod = axis.modulus();
    var x = axis.elements[0] / mod, y = axis.elements[1] / mod, z = axis.elements[2] / mod;
    var s = Math.sin(theta), c = Math.cos(theta), t = 1 - c;
    // Formula derived here: http://www.gamedev.net/reference/articles/article1199.asp
    // That proof rotates the co-ordinate system so theta
    // becomes -theta and sin becomes -sin here.
    return Matrix.create([
	[t * x * x + c, t * x * y - s * z, t * x * z + s * y],
	[t * x * y + s * z, t * y * y + c, t * y * z - s * x],
	[t * x * z - s * y, t * y * z + s * x, t * z * z + c]
    ]);
};

// Special case rotations
Matrix.RotationX = function(t) {
    var c = Math.cos(t), s = Math.sin(t);
    return Matrix.create([
	[1, 0, 0],
	[0, c, -s],
	[0, s, c]
    ]);
};

Matrix.RotationY = function(t) {
    var c = Math.cos(t), s = Math.sin(t);
    return Matrix.create([
	[c, 0, s],
	[0, 1, 0],
	[-s, 0, c]
    ]);
};

Matrix.RotationZ = function(t) {
    var c = Math.cos(t), s = Math.sin(t);
    return Matrix.create([
	[c, -s, 0],
	[s, c, 0],
	[0, 0, 1]
    ]);
};

// Random matrix of n rows, m columns
Matrix.Random = function(n, m) {
    if (arguments.length === 1) m = n;
    return Matrix.Zero(n, m).map(
	function() { return Math.random(); }
  );
};

Matrix.Fill = function(n, m, v) {
    if (arguments.length === 2) {
	v = m;
	m = n;
    }

    var els = [], i = n, j;

    while (i--) {
	j = m;
	els[i] = [];

	while (j--) {
	    els[i][j] = v;
	}
    }

    return Matrix.create(els);
};

// Matrix filled with zeros
Matrix.Zero = function(n, m) {
    return Matrix.Fill(n, m, 0);
};

// Matrix filled with zeros
Matrix.Zeros = function(n, m) {
    return Matrix.Zero(n, m);
};

// Matrix filled with ones
Matrix.One = function(n, m) {
    return Matrix.Fill(n, m, 1);
};

// Matrix filled with ones
Matrix.Ones = function(n, m) {
    return Matrix.One(n, m);
};

module.exports = Matrix;
});

require.define("fs",function(require,module,exports,__dirname,__filename,process){// nothing to see here... no file methods for the browser
});

require.define("/css3d/lib/sylvester/lib/node-sylvester/line.js",function(require,module,exports,__dirname,__filename,process){// Copyright (c) 2011, Chris Umbel, James Coglan
var Vector = require('./vector');
var Matrix = require('./matrix');
var Plane = require('./plane');
var Sylvester = require('./sylvester');

// Line class - depends on Vector, and some methods require Matrix and Plane.

function Line() {}
Line.prototype = {

  // Returns true if the argument occupies the same space as the line
  eql: function(line) {
    return (this.isParallelTo(line) && this.contains(line.anchor));
  },

  // Returns a copy of the line
  dup: function() {
    return Line.create(this.anchor, this.direction);
  },

  // Returns the result of translating the line by the given vector/array
  translate: function(vector) {
    var V = vector.elements || vector;
    return Line.create([
      this.anchor.elements[0] + V[0],
      this.anchor.elements[1] + V[1],
      this.anchor.elements[2] + (V[2] || 0)
    ], this.direction);
  },

  // Returns true if the line is parallel to the argument. Here, 'parallel to'
  // means that the argument's direction is either parallel or antiparallel to
  // the line's own direction. A line is parallel to a plane if the two do not
  // have a unique intersection.
  isParallelTo: function(obj) {
    if (obj.normal || (obj.start && obj.end)) { return obj.isParallelTo(this); }
    var theta = this.direction.angleFrom(obj.direction);
    return (Math.abs(theta) <= Sylvester.precision || Math.abs(theta - Math.PI) <= Sylvester.precision);
  },

  // Returns the line's perpendicular distance from the argument,
  // which can be a point, a line or a plane
  distanceFrom: function(obj) {
    if (obj.normal || (obj.start && obj.end)) { return obj.distanceFrom(this); }
    if (obj.direction) {
      // obj is a line
      if (this.isParallelTo(obj)) { return this.distanceFrom(obj.anchor); }
      var N = this.direction.cross(obj.direction).toUnitVector().elements;
      var A = this.anchor.elements, B = obj.anchor.elements;
      return Math.abs((A[0] - B[0]) * N[0] + (A[1] - B[1]) * N[1] + (A[2] - B[2]) * N[2]);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      var A = this.anchor.elements, D = this.direction.elements;
      var PA1 = P[0] - A[0], PA2 = P[1] - A[1], PA3 = (P[2] || 0) - A[2];
      var modPA = Math.sqrt(PA1*PA1 + PA2*PA2 + PA3*PA3);
      if (modPA === 0) return 0;
      // Assumes direction vector is normalized
      var cosTheta = (PA1 * D[0] + PA2 * D[1] + PA3 * D[2]) / modPA;
      var sin2 = 1 - cosTheta*cosTheta;
      return Math.abs(modPA * Math.sqrt(sin2 < 0 ? 0 : sin2));
    }
  },

  // Returns true iff the argument is a point on the line, or if the argument
  // is a line segment lying within the receiver
  contains: function(obj) {
    if (obj.start && obj.end) { return this.contains(obj.start) && this.contains(obj.end); }
    var dist = this.distanceFrom(obj);
    return (dist !== null && dist <= Sylvester.precision);
  },

  // Returns the distance from the anchor of the given point. Negative values are
  // returned for points that are in the opposite direction to the line's direction from
  // the line's anchor point.
  positionOf: function(point) {
    if (!this.contains(point)) { return null; }
    var P = point.elements || point;
    var A = this.anchor.elements, D = this.direction.elements;
    return (P[0] - A[0]) * D[0] + (P[1] - A[1]) * D[1] + ((P[2] || 0) - A[2]) * D[2];
  },

  // Returns true iff the line lies in the given plane
  liesIn: function(plane) {
    return plane.contains(this);
  },

  // Returns true iff the line has a unique point of intersection with the argument
  intersects: function(obj) {
    if (obj.normal) { return obj.intersects(this); }
    return (!this.isParallelTo(obj) && this.distanceFrom(obj) <= Sylvester.precision);
  },

  // Returns the unique intersection point with the argument, if one exists
  intersectionWith: function(obj) {
    if (obj.normal || (obj.start && obj.end)) { return obj.intersectionWith(this); }
    if (!this.intersects(obj)) { return null; }
    var P = this.anchor.elements, X = this.direction.elements,
        Q = obj.anchor.elements, Y = obj.direction.elements;
    var X1 = X[0], X2 = X[1], X3 = X[2], Y1 = Y[0], Y2 = Y[1], Y3 = Y[2];
    var PsubQ1 = P[0] - Q[0], PsubQ2 = P[1] - Q[1], PsubQ3 = P[2] - Q[2];
    var XdotQsubP = - X1*PsubQ1 - X2*PsubQ2 - X3*PsubQ3;
    var YdotPsubQ = Y1*PsubQ1 + Y2*PsubQ2 + Y3*PsubQ3;
    var XdotX = X1*X1 + X2*X2 + X3*X3;
    var YdotY = Y1*Y1 + Y2*Y2 + Y3*Y3;
    var XdotY = X1*Y1 + X2*Y2 + X3*Y3;
    var k = (XdotQsubP * YdotY / XdotX + XdotY * YdotPsubQ) / (YdotY - XdotY * XdotY);
    return Vector.create([P[0] + k*X1, P[1] + k*X2, P[2] + k*X3]);
  },

  // Returns the point on the line that is closest to the given point or line/line segment
  pointClosestTo: function(obj) {
    if (obj.start && obj.end) {
      // obj is a line segment
      var P = obj.pointClosestTo(this);
      return (P === null) ? null : this.pointClosestTo(P);
    } else if (obj.direction) {
      // obj is a line
      if (this.intersects(obj)) { return this.intersectionWith(obj); }
      if (this.isParallelTo(obj)) { return null; }
      var D = this.direction.elements, E = obj.direction.elements;
      var D1 = D[0], D2 = D[1], D3 = D[2], E1 = E[0], E2 = E[1], E3 = E[2];
      // Create plane containing obj and the shared normal and intersect this with it
      // Thank you: http://www.cgafaq.info/wiki/Line-line_distance
      var x = (D3 * E1 - D1 * E3), y = (D1 * E2 - D2 * E1), z = (D2 * E3 - D3 * E2);
      var N = [x * E3 - y * E2, y * E1 - z * E3, z * E2 - x * E1];
      var P = Plane.create(obj.anchor, N);
      return P.intersectionWith(this);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      if (this.contains(P)) { return Vector.create(P); }
      var A = this.anchor.elements, D = this.direction.elements;
      var D1 = D[0], D2 = D[1], D3 = D[2], A1 = A[0], A2 = A[1], A3 = A[2];
      var x = D1 * (P[1]-A2) - D2 * (P[0]-A1), y = D2 * ((P[2] || 0) - A3) - D3 * (P[1]-A2),
          z = D3 * (P[0]-A1) - D1 * ((P[2] || 0) - A3);
      var V = Vector.create([D2 * x - D3 * z, D3 * y - D1 * x, D1 * z - D2 * y]);
      var k = this.distanceFrom(P) / V.modulus();
      return Vector.create([
        P[0] + V.elements[0] * k,
        P[1] + V.elements[1] * k,
        (P[2] || 0) + V.elements[2] * k
      ]);
    }
  },

  // Returns a copy of the line rotated by t radians about the given line. Works by
  // finding the argument's closest point to this line's anchor point (call this C) and
  // rotating the anchor about C. Also rotates the line's direction about the argument's.
  // Be careful with this - the rotation axis' direction affects the outcome!
  rotate: function(t, line) {
    // If we're working in 2D
    if (typeof(line.direction) == 'undefined') { line = Line.create(line.to3D(), Vector.k); }
    var R = Matrix.Rotation(t, line.direction).elements;
    var C = line.pointClosestTo(this.anchor).elements;
    var A = this.anchor.elements, D = this.direction.elements;
    var C1 = C[0], C2 = C[1], C3 = C[2], A1 = A[0], A2 = A[1], A3 = A[2];
    var x = A1 - C1, y = A2 - C2, z = A3 - C3;
    return Line.create([
      C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z,
      C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z,
      C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z
    ], [
      R[0][0] * D[0] + R[0][1] * D[1] + R[0][2] * D[2],
      R[1][0] * D[0] + R[1][1] * D[1] + R[1][2] * D[2],
      R[2][0] * D[0] + R[2][1] * D[1] + R[2][2] * D[2]
    ]);
  },

  // Returns a copy of the line with its direction vector reversed.
  // Useful when using lines for rotations.
  reverse: function() {
    return Line.create(this.anchor, this.direction.x(-1));
  },

  // Returns the line's reflection in the given point or line
  reflectionIn: function(obj) {
    if (obj.normal) {
      // obj is a plane
      var A = this.anchor.elements, D = this.direction.elements;
      var A1 = A[0], A2 = A[1], A3 = A[2], D1 = D[0], D2 = D[1], D3 = D[2];
      var newA = this.anchor.reflectionIn(obj).elements;
      // Add the line's direction vector to its anchor, then mirror that in the plane
      var AD1 = A1 + D1, AD2 = A2 + D2, AD3 = A3 + D3;
      var Q = obj.pointClosestTo([AD1, AD2, AD3]).elements;
      var newD = [Q[0] + (Q[0] - AD1) - newA[0], Q[1] + (Q[1] - AD2) - newA[1], Q[2] + (Q[2] - AD3) - newA[2]];
      return Line.create(newA, newD);
    } else if (obj.direction) {
      // obj is a line - reflection obtained by rotating PI radians about obj
      return this.rotate(Math.PI, obj);
    } else {
      // obj is a point - just reflect the line's anchor in it
      var P = obj.elements || obj;
      return Line.create(this.anchor.reflectionIn([P[0], P[1], (P[2] || 0)]), this.direction);
    }
  },

  // Set the line's anchor point and direction.
  setVectors: function(anchor, direction) {
    // Need to do this so that line's properties are not
    // references to the arguments passed in
    anchor = Vector.create(anchor);
    direction = Vector.create(direction);
    if (anchor.elements.length == 2) {anchor.elements.push(0); }
    if (direction.elements.length == 2) { direction.elements.push(0); }
    if (anchor.elements.length > 3 || direction.elements.length > 3) { return null; }
    var mod = direction.modulus();
    if (mod === 0) { return null; }
    this.anchor = anchor;
    this.direction = Vector.create([
      direction.elements[0] / mod,
      direction.elements[1] / mod,
      direction.elements[2] / mod
    ]);
    return this;
  }
};

// Constructor function
Line.create = function(anchor, direction) {
  var L = new Line();
  return L.setVectors(anchor, direction);
};

// Axes
Line.X = Line.create(Vector.Zero(3), Vector.i);
Line.Y = Line.create(Vector.Zero(3), Vector.j);
Line.Z = Line.create(Vector.Zero(3), Vector.k);

module.exports = Line;
});

require.define("/css3d/lib/sylvester/lib/node-sylvester/plane.js",function(require,module,exports,__dirname,__filename,process){// Copyright (c) 2011, Chris Umbel, James Coglan
// Plane class - depends on Vector. Some methods require Matrix and Line.
var Vector = require('./vector');
var Matrix = require('./matrix');
var Line = require('./line');

var Sylvester = require('./sylvester');

function Plane() {}
Plane.prototype = {

  // Returns true iff the plane occupies the same space as the argument
  eql: function(plane) {
    return (this.contains(plane.anchor) && this.isParallelTo(plane));
  },

  // Returns a copy of the plane
  dup: function() {
    return Plane.create(this.anchor, this.normal);
  },

  // Returns the result of translating the plane by the given vector
  translate: function(vector) {
    var V = vector.elements || vector;
    return Plane.create([
      this.anchor.elements[0] + V[0],
      this.anchor.elements[1] + V[1],
      this.anchor.elements[2] + (V[2] || 0)
    ], this.normal);
  },

  // Returns true iff the plane is parallel to the argument. Will return true
  // if the planes are equal, or if you give a line and it lies in the plane.
  isParallelTo: function(obj) {
    var theta;
    if (obj.normal) {
      // obj is a plane
      theta = this.normal.angleFrom(obj.normal);
      return (Math.abs(theta) <= Sylvester.precision || Math.abs(Math.PI - theta) <= Sylvester.precision);
    } else if (obj.direction) {
      // obj is a line
      return this.normal.isPerpendicularTo(obj.direction);
    }
    return null;
  },

  // Returns true iff the receiver is perpendicular to the argument
  isPerpendicularTo: function(plane) {
    var theta = this.normal.angleFrom(plane.normal);
    return (Math.abs(Math.PI/2 - theta) <= Sylvester.precision);
  },

  // Returns the plane's distance from the given object (point, line or plane)
  distanceFrom: function(obj) {
    if (this.intersects(obj) || this.contains(obj)) { return 0; }
    if (obj.anchor) {
      // obj is a plane or line
      var A = this.anchor.elements, B = obj.anchor.elements, N = this.normal.elements;
      return Math.abs((A[0] - B[0]) * N[0] + (A[1] - B[1]) * N[1] + (A[2] - B[2]) * N[2]);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      var A = this.anchor.elements, N = this.normal.elements;
      return Math.abs((A[0] - P[0]) * N[0] + (A[1] - P[1]) * N[1] + (A[2] - (P[2] || 0)) * N[2]);
    }
  },

  // Returns true iff the plane contains the given point or line
  contains: function(obj) {
    if (obj.normal) { return null; }
    if (obj.direction) {
      return (this.contains(obj.anchor) && this.contains(obj.anchor.add(obj.direction)));
    } else {
      var P = obj.elements || obj;
      var A = this.anchor.elements, N = this.normal.elements;
      var diff = Math.abs(N[0]*(A[0] - P[0]) + N[1]*(A[1] - P[1]) + N[2]*(A[2] - (P[2] || 0)));
      return (diff <= Sylvester.precision);
    }
  },

  // Returns true iff the plane has a unique point/line of intersection with the argument
  intersects: function(obj) {
    if (typeof(obj.direction) == 'undefined' && typeof(obj.normal) == 'undefined') { return null; }
    return !this.isParallelTo(obj);
  },

  // Returns the unique intersection with the argument, if one exists. The result
  // will be a vector if a line is supplied, and a line if a plane is supplied.
  intersectionWith: function(obj) {
    if (!this.intersects(obj)) { return null; }
    if (obj.direction) {
      // obj is a line
      var A = obj.anchor.elements, D = obj.direction.elements,
          P = this.anchor.elements, N = this.normal.elements;
      var multiplier = (N[0]*(P[0]-A[0]) + N[1]*(P[1]-A[1]) + N[2]*(P[2]-A[2])) / (N[0]*D[0] + N[1]*D[1] + N[2]*D[2]);
      return Vector.create([A[0] + D[0]*multiplier, A[1] + D[1]*multiplier, A[2] + D[2]*multiplier]);
    } else if (obj.normal) {
      // obj is a plane
      var direction = this.normal.cross(obj.normal).toUnitVector();
      // To find an anchor point, we find one co-ordinate that has a value
      // of zero somewhere on the intersection, and remember which one we picked
      var N = this.normal.elements, A = this.anchor.elements,
          O = obj.normal.elements, B = obj.anchor.elements;
      var solver = Matrix.Zero(2,2), i = 0;
      while (solver.isSingular()) {
        i++;
        solver = Matrix.create([
          [ N[i%3], N[(i+1)%3] ],
          [ O[i%3], O[(i+1)%3]  ]
        ]);
      }
      // Then we solve the simultaneous equations in the remaining dimensions
      var inverse = solver.inverse().elements;
      var x = N[0]*A[0] + N[1]*A[1] + N[2]*A[2];
      var y = O[0]*B[0] + O[1]*B[1] + O[2]*B[2];
      var intersection = [
        inverse[0][0] * x + inverse[0][1] * y,
        inverse[1][0] * x + inverse[1][1] * y
      ];
      var anchor = [];
      for (var j = 1; j <= 3; j++) {
        // This formula picks the right element from intersection by
        // cycling depending on which element we set to zero above
        anchor.push((i == j) ? 0 : intersection[(j + (5 - i)%3)%3]);
      }
      return Line.create(anchor, direction);
    }
  },

  // Returns the point in the plane closest to the given point
  pointClosestTo: function(point) {
    var P = point.elements || point;
    var A = this.anchor.elements, N = this.normal.elements;
    var dot = (A[0] - P[0]) * N[0] + (A[1] - P[1]) * N[1] + (A[2] - (P[2] || 0)) * N[2];
    return Vector.create([P[0] + N[0] * dot, P[1] + N[1] * dot, (P[2] || 0) + N[2] * dot]);
  },

  // Returns a copy of the plane, rotated by t radians about the given line
  // See notes on Line#rotate.
  rotate: function(t, line) {
    var R = t.determinant ? t.elements : Matrix.Rotation(t, line.direction).elements;
    var C = line.pointClosestTo(this.anchor).elements;
    var A = this.anchor.elements, N = this.normal.elements;
    var C1 = C[0], C2 = C[1], C3 = C[2], A1 = A[0], A2 = A[1], A3 = A[2];
    var x = A1 - C1, y = A2 - C2, z = A3 - C3;
    return Plane.create([
      C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z,
      C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z,
      C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z
    ], [
      R[0][0] * N[0] + R[0][1] * N[1] + R[0][2] * N[2],
      R[1][0] * N[0] + R[1][1] * N[1] + R[1][2] * N[2],
      R[2][0] * N[0] + R[2][1] * N[1] + R[2][2] * N[2]
    ]);
  },

  // Returns the reflection of the plane in the given point, line or plane.
  reflectionIn: function(obj) {
    if (obj.normal) {
      // obj is a plane
      var A = this.anchor.elements, N = this.normal.elements;
      var A1 = A[0], A2 = A[1], A3 = A[2], N1 = N[0], N2 = N[1], N3 = N[2];
      var newA = this.anchor.reflectionIn(obj).elements;
      // Add the plane's normal to its anchor, then mirror that in the other plane
      var AN1 = A1 + N1, AN2 = A2 + N2, AN3 = A3 + N3;
      var Q = obj.pointClosestTo([AN1, AN2, AN3]).elements;
      var newN = [Q[0] + (Q[0] - AN1) - newA[0], Q[1] + (Q[1] - AN2) - newA[1], Q[2] + (Q[2] - AN3) - newA[2]];
      return Plane.create(newA, newN);
    } else if (obj.direction) {
      // obj is a line
      return this.rotate(Math.PI, obj);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      return Plane.create(this.anchor.reflectionIn([P[0], P[1], (P[2] || 0)]), this.normal);
    }
  },

  // Sets the anchor point and normal to the plane. If three arguments are specified,
  // the normal is calculated by assuming the three points should lie in the same plane.
  // If only two are sepcified, the second is taken to be the normal. Normal vector is
  // normalised before storage.
  setVectors: function(anchor, v1, v2) {
    anchor = Vector.create(anchor);
    anchor = anchor.to3D(); if (anchor === null) { return null; }
    v1 = Vector.create(v1);
    v1 = v1.to3D(); if (v1 === null) { return null; }
    if (typeof(v2) == 'undefined') {
      v2 = null;
    } else {
      v2 = Vector.create(v2);
      v2 = v2.to3D(); if (v2 === null) { return null; }
    }
    var A1 = anchor.elements[0], A2 = anchor.elements[1], A3 = anchor.elements[2];
    var v11 = v1.elements[0], v12 = v1.elements[1], v13 = v1.elements[2];
    var normal, mod;
    if (v2 !== null) {
      var v21 = v2.elements[0], v22 = v2.elements[1], v23 = v2.elements[2];
      normal = Vector.create([
        (v12 - A2) * (v23 - A3) - (v13 - A3) * (v22 - A2),
        (v13 - A3) * (v21 - A1) - (v11 - A1) * (v23 - A3),
        (v11 - A1) * (v22 - A2) - (v12 - A2) * (v21 - A1)
      ]);
      mod = normal.modulus();
      if (mod === 0) { return null; }
      normal = Vector.create([normal.elements[0] / mod, normal.elements[1] / mod, normal.elements[2] / mod]);
    } else {
      mod = Math.sqrt(v11*v11 + v12*v12 + v13*v13);
      if (mod === 0) { return null; }
      normal = Vector.create([v1.elements[0] / mod, v1.elements[1] / mod, v1.elements[2] / mod]);
    }
    this.anchor = anchor;
    this.normal = normal;
    return this;
  }
};

// Constructor function
Plane.create = function(anchor, v1, v2) {
  var P = new Plane();
  return P.setVectors(anchor, v1, v2);
};

// X-Y-Z planes
Plane.XY = Plane.create(Vector.Zero(3), Vector.k);
Plane.YZ = Plane.create(Vector.Zero(3), Vector.i);
Plane.ZX = Plane.create(Vector.Zero(3), Vector.j);
Plane.YX = Plane.XY; Plane.ZY = Plane.YZ; Plane.XZ = Plane.ZX;

// Returns the plane containing the given points (can be arrays as
// well as vectors). If the points are not coplanar, returns null.
Plane.fromPoints = function(points) {
  var np = points.length, list = [], i, P, n, N, A, B, C, D, theta, prevN, totalN = Vector.Zero(3);
  for (i = 0; i < np; i++) {
    P = Vector.create(points[i]).to3D();
    if (P === null) { return null; }
    list.push(P);
    n = list.length;
    if (n > 2) {
      // Compute plane normal for the latest three points
      A = list[n-1].elements; B = list[n-2].elements; C = list[n-3].elements;
      N = Vector.create([
        (A[1] - B[1]) * (C[2] - B[2]) - (A[2] - B[2]) * (C[1] - B[1]),
        (A[2] - B[2]) * (C[0] - B[0]) - (A[0] - B[0]) * (C[2] - B[2]),
        (A[0] - B[0]) * (C[1] - B[1]) - (A[1] - B[1]) * (C[0] - B[0])
      ]).toUnitVector();
      if (n > 3) {
        // If the latest normal is not (anti)parallel to the previous one, we've strayed off the plane.
        // This might be a slightly long-winded way of doing things, but we need the sum of all the normals
        // to find which way the plane normal should point so that the points form an anticlockwise list.
        theta = N.angleFrom(prevN);
        if (theta !== null) {
          if (!(Math.abs(theta) <= Sylvester.precision || Math.abs(theta - Math.PI) <= Sylvester.precision)) { return null; }
        }
      }
      totalN = totalN.add(N);
      prevN = N;
    }
  }
  // We need to add in the normals at the start and end points, which the above misses out
  A = list[1].elements; B = list[0].elements; C = list[n-1].elements; D = list[n-2].elements;
  totalN = totalN.add(Vector.create([
    (A[1] - B[1]) * (C[2] - B[2]) - (A[2] - B[2]) * (C[1] - B[1]),
    (A[2] - B[2]) * (C[0] - B[0]) - (A[0] - B[0]) * (C[2] - B[2]),
    (A[0] - B[0]) * (C[1] - B[1]) - (A[1] - B[1]) * (C[0] - B[0])
  ]).toUnitVector()).add(Vector.create([
    (B[1] - C[1]) * (D[2] - C[2]) - (B[2] - C[2]) * (D[1] - C[1]),
    (B[2] - C[2]) * (D[0] - C[0]) - (B[0] - C[0]) * (D[2] - C[2]),
    (B[0] - C[0]) * (D[1] - C[1]) - (B[1] - C[1]) * (D[0] - C[0])
  ]).toUnitVector());
  return Plane.create(list[0], totalN);
};

module.exports = Plane;
});

require.define("/css3d/lib/sylvester/lib/node-sylvester/line.segment.js",function(require,module,exports,__dirname,__filename,process){// Copyright (c) 2011, Chris Umbel, James Coglan
// Line.Segment class - depends on Line and its dependencies.

var Line = require('./line');
var Vector = require('./vector');

Line.Segment = function() {};
Line.Segment.prototype = {

  // Returns true iff the line segment is equal to the argument
  eql: function(segment) {
    return (this.start.eql(segment.start) && this.end.eql(segment.end)) ||
        (this.start.eql(segment.end) && this.end.eql(segment.start));
  },

  // Returns a copy of the line segment
  dup: function() {
    return Line.Segment.create(this.start, this.end);
  },

  // Returns the length of the line segment
  length: function() {
    var A = this.start.elements, B = this.end.elements;
    var C1 = B[0] - A[0], C2 = B[1] - A[1], C3 = B[2] - A[2];
    return Math.sqrt(C1*C1 + C2*C2 + C3*C3);
  },

  // Returns the line segment as a vector equal to its
  // end point relative to its endpoint
  toVector: function() {
    var A = this.start.elements, B = this.end.elements;
    return Vector.create([B[0] - A[0], B[1] - A[1], B[2] - A[2]]);
  },

  // Returns the segment's midpoint as a vector
  midpoint: function() {
    var A = this.start.elements, B = this.end.elements;
    return Vector.create([(B[0] + A[0])/2, (B[1] + A[1])/2, (B[2] + A[2])/2]);
  },

  // Returns the plane that bisects the segment
  bisectingPlane: function() {
    return Plane.create(this.midpoint(), this.toVector());
  },

  // Returns the result of translating the line by the given vector/array
  translate: function(vector) {
    var V = vector.elements || vector;
    var S = this.start.elements, E = this.end.elements;
    return Line.Segment.create(
      [S[0] + V[0], S[1] + V[1], S[2] + (V[2] || 0)],
      [E[0] + V[0], E[1] + V[1], E[2] + (V[2] || 0)]
    );
  },

  // Returns true iff the line segment is parallel to the argument. It simply forwards
  // the method call onto its line property.
  isParallelTo: function(obj) {
    return this.line.isParallelTo(obj);
  },

  // Returns the distance between the argument and the line segment's closest point to the argument
  distanceFrom: function(obj) {
    var P = this.pointClosestTo(obj);
    return (P === null) ? null : P.distanceFrom(obj);
  },

  // Returns true iff the given point lies on the segment
  contains: function(obj) {
    if (obj.start && obj.end) { return this.contains(obj.start) && this.contains(obj.end); }
    var P = (obj.elements || obj).slice();
    if (P.length == 2) { P.push(0); }
    if (this.start.eql(P)) { return true; }
    var S = this.start.elements;
    var V = Vector.create([S[0] - P[0], S[1] - P[1], S[2] - (P[2] || 0)]);
    var vect = this.toVector();
    return V.isAntiparallelTo(vect) && V.modulus() <= vect.modulus();
  },

  // Returns true iff the line segment intersects the argument
  intersects: function(obj) {
    return (this.intersectionWith(obj) !== null);
  },

  // Returns the unique point of intersection with the argument
  intersectionWith: function(obj) {
    if (!this.line.intersects(obj)) { return null; }
    var P = this.line.intersectionWith(obj);
    return (this.contains(P) ? P : null);
  },

  // Returns the point on the line segment closest to the given object
  pointClosestTo: function(obj) {
    if (obj.normal) {
      // obj is a plane
      var V = this.line.intersectionWith(obj);
      if (V === null) { return null; }
      return this.pointClosestTo(V);
    } else {
      // obj is a line (segment) or point
      var P = this.line.pointClosestTo(obj);
      if (P === null) { return null; }
      if (this.contains(P)) { return P; }
      return (this.line.positionOf(P) < 0 ? this.start : this.end).dup();
    }
  },

  // Set the start and end-points of the segment
  setPoints: function(startPoint, endPoint) {
    startPoint = Vector.create(startPoint).to3D();
    endPoint = Vector.create(endPoint).to3D();
    if (startPoint === null || endPoint === null) { return null; }
    this.line = Line.create(startPoint, endPoint.subtract(startPoint));
    this.start = startPoint;
    this.end = endPoint;
    return this;
  }
};

// Constructor function
Line.Segment.create = function(v1, v2) {
  var S = new Line.Segment();
  return S.setPoints(v1, v2);
};

module.exports = Line.Segment;
});

require.define("/css3d/lib/bundle.js",function(require,module,exports,__dirname,__filename,process){var es = require('event-stream')
  , thru = require('through')
  , gridMap = require('./grid-map')
  , createContext = require('./spherical-context')
  ;

createContext(700, 700)
});
require("/css3d/lib/bundle.js");
})();
