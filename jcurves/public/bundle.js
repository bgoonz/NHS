(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//var normalize = require('normalize-time')
var install = require('./install-canvas')(document.body)
var nvelope = require('nvelope')
var hover = require('../mousearound')
var touchdown = require('touchdown')

var canvas = install()
var ctx = canvas.getContext('2d')
var pts = [[0,0], [1,1]] // irrelevant assignation
var ptsmap = []

touchdown.start(canvas)
var hovered = null
var dragging = null 

canvas.addEventListener('deltavector', function(evt){
  if(hovered){
    //console.log(hovered)
    hovered.x = evt.detail.offsetX
    hovered.y = evt.detail.offsetY
    hovered.update()
    env = pts2env(ptsmap)
    window.requestAnimationFrame(function(){
      clear()
      draw(env)
       
      drawControls()
    })
  }  
})

canvas.addEventListener('liftoff', function(evt){
  if(hovered){
    //console.log(hovered)
    hovered.x = evt.detail.offsetX
    hovered.y = evt.detail.offsetY
    hovered.hover = false
    hovered.update()
    env = pts2env(ptsmap)
    window.requestAnimationFrame(function(){
      //clear()
      draw(env)
       
      drawControls()
    })
  }  
})

var p = []

exports([[[0,0],[.5,.5],[.5,.5],[1,1]]], [1])

function clear(){
  ctx.clearRect(0,0,canvas.width, canvas.height)
}

function pts2env(map){
  var m = map.map(function(e){
    return [e.x / canvas.width,  1 - e.y / canvas.height]
  }).sort(function(a,b){
    return a[0] - b[0] 
  })
  m = [m]    
  return nvelope(m, [canvas.width])
}

function exports(ctls, dur){
  
  ptsmap = ctls[0].map(function(pt){
    var map = {}
    map.radius = 20
    map.x = pt[0] * canvas.width
    map.y = canvas.height - ((pt[1]) * canvas.height)
    return map 
  })
  env = nvelope(ctls, [canvas.width]) //nvelope(pts2env(ptsmap), [canvas.width, canvas.height])
  draw(env)
  drawControls()
  ptsmap = hover(canvas, ptsmap, function(ev, pt, xy, start, end){
    if(end && pt === hovered) hovered = null 
    else if(!hovered) hovered = pt
    else return
  })
  
}

function drawControls(){
  ptsmap.forEach(function(pt){
    ctx.beginPath()
    ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2, false)
    ctx.fillStyle = 'green'
    ctx.fill()
    ctx.stroke()
  })
}

function draw(env){
  ctx.moveTo(0, env(0))
  ctx.beginPath()
  for(var x = 1; x <= canvas.width; x++){
    ctx.lineTo(x, (canvas.height * (1 - env(x))))
  }
  ctx.strokeStyle = 'pink'
  ctx.lineWidth = 3;
  ctx.stroke()
}


},{"../mousearound":10,"./install-canvas":2,"nvelope":4,"touchdown":8}],2:[function(require,module,exports){
module.exports = function(parent){
  if(!parent) parent = document.body
  var index = []

  return installCanvas

  function installCanvas(zIndex){
    zIndex = zIndex || index.length
    var canvas = document.createElement('canvas')
    canvas.width = parseFloat(getCSS(parent, 'width'))
    canvas.height = parseFloat(getCSS(parent, 'height'))
    canvas.style.width = canvas.width + 'px'
    canvas.style.height = canvas.height + 'px'
    canvas.style.position = 'absolute'
    canvas.style.backgroundColor = 'transparent'
    canvas.style.zIndex = zIndex 
    canvas.style.top = '0px'
    canvas.style.left = '0px'
    index.splice(zIndex, 0, canvas)
    parent.appendChild(canvas)
    var ctx = canvas.getContext('2d')
    ctx.translate(.5, .5)
    return canvas
  }

}

function getCSS(el, prop){
  return document.defaultView.getComputedStyle(el).getPropertyValue(prop)
}


},{}],3:[function(require,module,exports){
module.exports = function (pts) {
        return function (t) {
                for (var a = pts; a.length > 1; a = b){
                        for (var i = 0, b = [], j; i < a.length - 1; i++){
                                for (b[i] = [], j = 1; j < a[i].length; j++){
                                        b[i][j] = a[i][j] * (1 - t) + a[i+1][j] * t;
                                }
                        }
                }
                return a[0][1];
	}    
}



},{}],4:[function(require,module,exports){
var amod = require( './amod.js');
var tnorm = require('normalize-time');

module.exports = function(pts, durs){
	
	pts = pts.map(amod)
	var t = 0;
	var totalDuration = durs.reduce(function(e,i){return e + i}, 0);
	var tdNormFN = tnorm(t, totalDuration);
	var s = 0;
	var end = t + totalDuration;
	var durFNS = durs.map(function(e,i){
		var x = tnorm(t + s, e)
		s += e;
		return x
	})
	var dp = 0;
	var durpercent = durs.map(function(e, i){
		var x = (e / totalDuration) + dp;
		dp+= (e / totalDuration)
		return x
	})
	var tn, n, i, v = 0, fn = 0;
	var envelope = function(t){
		tn = tdNormFN(t);
		if(0 > tn || tn > 1) return 0;
		fn = durpercent.reduce(function(p, e, i, d){return ((d[i-1] || 0) <= tn && tn <= e) ? i : p}, 0)
		v = pts[fn](durFNS[fn](t))
		return v
	}
	return envelope

	// probably deletable
	function xenvelope(t, sustain){
		tn = tdNormFN(t); 
		if(0 >= tn || tn  >= 1) return 0;
		if(tn > durpercent[fn]) fn = (fn + 1 > pts.length - 1 ? 0 : fn + 1)
		v = pts[fn](durFNS[fn](t))
		return v
	}
}


},{"./amod.js":3,"normalize-time":5}],5:[function(require,module,exports){
module.exports = function(start, dur, min, max){

	if(!min) min = 0;
	if(!max) max = 1;
	var end = start + dur;
	var d = end - start;
	var r = max - min;

	return function(time){

		x = min + (time - start) * r / d
		if(x > 1){
//			console.log('pre', time, end)
			if(time < end) x = Number('.' + x.toString().split('.').join(''))
//			console.log('norm', x)
		}
		return x
	}

}

},{}],6:[function(require,module,exports){
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

(function() {
  var _global = this;

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng;

  // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
  //
  // Moderately fast, high quality
  if (typeof(_global.require) == 'function') {
    try {
      var _rb = _global.require('crypto').randomBytes;
      _rng = _rb && function() {return _rb(16);};
    } catch(e) {}
  }

  if (!_rng && _global.crypto && crypto.getRandomValues) {
    // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
    //
    // Moderately fast, high quality
    var _rnds8 = new Uint8Array(16);
    _rng = function whatwgRNG() {
      crypto.getRandomValues(_rnds8);
      return _rnds8;
    };
  }

  if (!_rng) {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    var  _rnds = new Array(16);
    _rng = function() {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }

      return _rnds;
    };
  }

  // Buffer class to use
  var BufferClass = typeof(_global.Buffer) == 'function' ? _global.Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = options.clockseq != null ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = options.msecs != null ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) == 'string') {
      buf = options == 'binary' ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;

  if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else  if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define(function() {return uuid;});
 

  } else {
    // Publish as global (in browsers)
    var _previousRoot = _global.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _global.uuid = _previousRoot;
      return uuid;
    };

    _global.uuid = uuid;
  }
}).call(this);

},{}],7:[function(require,module,exports){
/**
 * Merge object b with object a.
 *
 *     var a = { foo: 'bar' }
 *       , b = { bar: 'baz' };
 *
 *     merge(a, b);
 *     // => { foo: 'bar', bar: 'baz' }
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api public
 */

exports = module.exports = function(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};

},{}],8:[function(require,module,exports){
var touchy = require('./touchy.js')
,   uuid = require('node-uuid')
,   merge = require('utils-merge')
;

module.exports = (function(){

  if(window._touch) return window._touch;

  else return new touch()

}());

function touch(){

  window._touch = this;

  this.elements = [];

  this.touchy = touchy(window, touchtest);

};

touch.prototype.start = touch.prototype.listen = function(el){

    if(!el.touch_id) el.touch_id = ('function' == typeof uuid.v1) ? uuid.v1() : uuid();

    this.elements.push(el);

    el.touch = 1;

		return el

};

touch.prototype.register = function(el){

    if(!el.touch_id) el.touch_id = uuid.v1();

    this.elements.push(el);

    el.touch = 0; // needs to be started

		return el

};


function touchtest(hand, finger){
	
	var lastPoint = [], allPoints = [];

  var lastOffsetPoint = [], allOffsetPoints = [];

  finger.on('start', function(point){
	
		var element = document.elementFromPoint(point.x - window.scrollX, point.y - window.scrollY);
    
    var el = search(element);

    if(el){
      if(!point.offsetX){
        point.offsetX = point.x - point.e.target.offsetLeft
        point.offsetY = point.y - point.e.target.offsetTop
      }
      merge(point, point.e)

		  
      lastPoint[0] = point.x
      lastPoint[1] = point.y
      lastPoint[2] = point.time
		  
      lastOffsetPoint[0] = point.offsetX
      lastOffsetPoint[1] = point.offsetY

		  allPoints.push(lastPoint.slice(0))
      allOffsetPoints.push(lastOffsetPoint.slice(0))

      this.is = true;

      this.el = el;

      this.event.id = this.id;

      var evt = new CustomEvent('touchdown', { cancelable: true, bubbles: false, detail : point});
      
      el.dispatchEvent(evt);

    }

  });
 
  finger.on('move', function(point){

    if(this.is){
   
      if(!point.offsetX){
        point.offsetX = point.x - point.e.target.offsetLeft
        point.offsetY = point.y - point.e.target.offsetTop
      }

      merge(point, point.e)
      /*
        if(!point.offsetX){
        point.offsetX = point.x - point.e[0].target.offsetLeft
        point.offsetY = point.y - point.e[0].target.offsetTop
      }
      */
	
      var evt = new CustomEvent('deltavector', { cancelable: true, bubbles: false, detail : point});

			evt.detail.delta = [point.x - lastPoint[0], point.y - lastPoint[1]];

      evt.detail.angle = Math.atan2(evt.detail.delta[0], evt.detail.delta[1])

			evt.detail.vector = [point.x, point.y];

			evt.detail.allPoints = allPoints;
      
      evt.detail.lastOffsetPoint = lastOffsetPoint.slice(0)

			evt.detail.lastPoint = lastPoint.splice(0)
      
      evt.detail.allOffsetPoints = allOffsetPoints

      lastPoint[0] = point.x
      lastPoint[1] = point.y
      lastPoint[2] = point.time
		  
      lastOffsetPoint[0] = point.offsetX
      lastOffsetPoint[1] = point.offsetY

		  allPoints.push(lastPoint.slice(0))
      allOffsetPoints.push(lastOffsetPoint.slice(0))
		
      this.el.dispatchEvent(evt);

    }

  });

  finger.on('end', function(point){
 
    if(this.is){

      
      if(!point.offsetX){
        point.offsetX = point.x - point.e.target.offsetLeft
        point.offsetY = point.y - point.e.target.offsetTop
      }
      merge(point, point.e)
/*
      if(!point.offsetX){
        point.offsetX = point.x - point.e[0].target.offsetLeft
        point.offsetY = point.y - point.e[0].target.offsetTop
      }
*/
      var evt = new CustomEvent('liftoff', { cancelable: true, bubbles: false, detail : point});

			evt.detail.delta = [point.x - lastPoint[0], point.y - lastPoint[1]];

      evt.detail.angle = Math.atan2(evt.detail.delta[0], evt.detail.delta[1])

      evt.detail.vector = [point.x, point.y];

			evt.detail.allPoints = allPoints;
		
			evt.detail.lastPoint = lastPoint.splice(0)
		
      evt.detail.allOffsetPoints = allOffsetPoints

      evt.detail.lastOffsetPoint = lastOffsetPoint.slice(0)

      lastPoint[0] = point.x
      lastPoint[1] = point.y
      lastPoint[2] = point.time
		  
      lastOffsetPoint[0] = point.offsetX
      lastOffsetPoint[1] = point.offsetY

		  allPoints.push(lastPoint.slice(0))
      allOffsetPoints.push(lastOffsetPoint.slice(0))
		
      this.el.dispatchEvent(evt);

    }

  });

};

function search(el){

  return scan(el)

  function scan(el){

    if(!el) return false;
  
    var x = window._touch.elements.reduce(function(val, i){	

      if(i.touch_id == el.touch_id && i.touch){

        val = i

      };

      return val

    }, false)

    return x || scan(el.parentElement)

  }

};


touch.prototype.pause = function(el){

  el.touch = 0

  return el

};

touch.prototype.resume = function(el){

  el.touch = 1

	return el

};

touch.prototype.end = function(el){

  delete el.touch

  delete el.touch_id

	return el

};

touch.prototype.handleMouse = function(x){

  if(Modernizr) Modernizr.touch = true;

  this.touchy.handleMouse(x);

};



},{"./touchy.js":9,"node-uuid":6,"utils-merge":7}],9:[function(require,module,exports){
/* Modernizr 2.6.2 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-touch-teststyles-prefixes
 */
var Modernizr=function(a,b,c){function v(a){i.cssText=a}function w(a,b){return v(l.join(a+";")+(b||""))}function x(a,b){return typeof a===b}function y(a,b){return!!~(""+a).indexOf(b)}function z(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:x(f,"function")?f.bind(d||b):f}return!1}var d="2.6.2",e={},f=b.documentElement,g="modernizr",h=b.createElement(g),i=h.style,j,k={}.toString,l=" -webkit- -moz- -o- -ms- ".split(" "),m={},n={},o={},p=[],q=p.slice,r,s=function(a,c,d,e){var h,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:g+(d+1),l.appendChild(j);return h=["&#173;",'<style id="s',g,'">',a,"</style>"].join(""),l.id=g,(m?l:n).innerHTML+=h,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=f.style.overflow,f.style.overflow="hidden",f.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),f.style.overflow=k),!!i},t={}.hasOwnProperty,u;!x(t,"undefined")&&!x(t.call,"undefined")?u=function(a,b){return t.call(a,b)}:u=function(a,b){return b in a&&x(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=q.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(q.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(q.call(arguments)))};return e}),m.touch=function(){var c;return"ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch?c=!0:s(["@media (",l.join("touch-enabled),("),g,")","{#modernizr{top:9px;position:absolute}}"].join(""),function(a){c=a.offsetTop===9}),c};for(var A in m)u(m,A)&&(r=A.toLowerCase(),e[r]=m[A](),p.push((e[r]?"":"no-")+r));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)u(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof enableClasses!="undefined"&&enableClasses&&(f.className+=" "+(b?"":"no-")+a),e[a]=b}return e},v(""),h=j=null,e._version=d,e._prefixes=l,e.testStyles=s,e}(window,window.document);

/*
	Touchy.js
	Socket-style finger management for touch events

	Jairaj Sethi
	http://creativecommons.org/licenses/by/3.0/
*/



/* Make sure I can itereate through arrays */
var forEach = function () {
    if (Array.prototype.forEach) {
	return function (arr, callback, self) {
	    Array.prototype.forEach.call(arr, callback, self);
	};
    }

    else {
	return function (arr, callback, self) {
	    for (var i=0, len=arr.length; i<len; i++) {
		if (i in arr) {
		    callback.call(self, arr[i], i, arr);
		}
	    }
	};
    }
}();

/* Make sure I can search through arrays */
var indexOf = function () {
    if (Array.prototype.indexOf) {
	return function (arr, item, startIndex) {
	    return Array.prototype.indexOf.call(arr, item, startIndex);
	};
    }

    else {
	return function (arr, item, startIndex) {
	    for (var i=startIndex || 0, len=arr.length; i<len; i++) {
		if ((i in arr) && (arr[i] === item)) {
		    return i;
		}
	    }

	    return -1;
	};
    }
}();

/* Make sure I can map arrays */
var map = function () {
    if (Array.prototype.map) {
	return function (arr, callback, self) {
	    return Array.prototype.map.call(arr, callback, self);
	};
    }

    else {
	return function (arr, callback, self) {
	    var len = arr.length,
	    mapArr = new Array(len);

	    for (var i=0; i<len; i++) {
		if (i in arr) {
		    mapArr[i] = callback.call(self, arr[i], i, arr);
		}
	    }

	    return mapArr;
	};
    }
}();

/* Make sure I can filter arrays */
var filter = function () {
    if (Array.prototype.filter) {
	return function (arr, func, self) {
	    return Array.prototype.filter.call(arr, func, self);
	};
    }

    else {
	return function (arr, func, self) {
	    var filterArr = [];

	    for (var val, i=0, len=arr.length; i<len; i++) {
		val = arr[i];

		if ((i in arr) && func.call(self, val, i, arr)) {
		    filterArr.push(val);
		}
	    }

	    return filterArr;
	};
    }
}();

/* Bind event listener to element */
var boundEvents = {};

function bind (elem, eventName, callback) {
    if (elem.addEventListener) {
	elem.addEventListener(eventName, callback, false);
    }

    else if (elem.attachEvent) {
	var eID = elem.attachEvent('on'+eventName, callback);
	boundEvents[eID] = { name: eventName, callback: callback };
    }
}

function unbind (elem, eventName, callback) {
    if (elem.removeEventListener) {
	elem.removeEventListener(eventName, callback, false);
    }

    else if (elem.detachEvent) {
	for (var eID in boundEvents) {
	    if ((boundEvents[eID].name === eventName) &&
		(boundEvents[eID].callback === callback)) {
		elem.detachEvent(eID);
		delete boundEvents[eID];
	    }
	}
    }
}

/* Simple inheritance */
function inheritsFrom (func, parent) {
    var proto = func.prototype,
    superProto = parent.prototype,
    oldSuper;

    for (var prop in superProto) {
	proto[prop] = superProto[prop];
    }

    function superMethod (name) {
	var args = Array.prototype.slice.call(arguments, 1);

	if ( superProto[name] ) {
	    return superProto[name].apply(this, args);
	}
    }

    if (proto._super) {
	oldSuper = proto._super;

	proto._super = function () {
	    oldSuper.call(this, arguments);
	    superMethod.call(this, arguments);
	};
    }

    else {
	proto._super = superMethod;
    }
}



/* Event bus to handle finger event listeners */
function EventBus () {
    this.onEvents = {};
    this.onceEvents = {};
}

/* Attach a handler to listen for an event */
EventBus.prototype.on = function (name, callback) {
    if ( !callback ) {
	return;
    }

    if (name in this.onEvents) {
	var index = indexOf(this.onEvents[name], callback);

	if (index != -1) {
	    return;
	}
    }

    else {
	this.onEvents[name] = [];
    }

    if (name in this.onceEvents) {
	var index = indexOf(this.onceEvents[name], callback);

	if (index != -1) {
	    this.onceEvents.splice(index, 1);
	}
    }

    this.onEvents[name].push(callback);
};

/* Attach a one-time-use handler to listen for an event */
EventBus.prototype.once = function (name, callback) {
    if ( !callback ) {
	return;
    }

    if (name in this.onceEvents) {
	var index = indexOf(this.onceEvents[name], callback);

	if (index != -1) {
	    return;
	}
    }

    else {
	this.onceEvents[name] = [];
    }

    if (name in this.onEvents) {
	var index = indexOf(this.onEvents[name], callback);

	if (index != -1) {
	    this.onEvents.splice(index, 1);
	}
    }

    this.onceEvents[name].push(callback);
};

/* Detach a handler from listening for an event */
EventBus.prototype.off = function (name, callback) {
    if ( !callback ) {
	return;
    }

    if (name in this.onEvents) {
	var index = indexOf(this.onEvents[name], callback);

	if (index != -1) {
	    this.onEvents.splice(index, 1);
	    return;
	}
    }

    if (name in this.onceEvents) {
	var index = indexOf(this.onceEvents[name], callback);

	if (index != -1) {
	    this.onceEvents.splice(index, 1);
	    return;
	}
    }
};

/* Fire an event, triggering all handlers */
EventBus.prototype.trigger = function (name) {
    var args = Array.prototype.slice.call(arguments, 1),
    callbacks = (this.onEvents[name] || []).concat(this.onceEvents[name] || []),
    callback;

    while (callback = callbacks.shift()) {
	callback.apply(this, args);
    }
};



/* Object to manage a single-finger interactions */
function Finger (id, e) {
    this._super('constructor');
    this.id        = id;
    this.lastPoint = null;
    this.event = e;
}
inheritsFrom(Finger, EventBus);



/* Object to manage multiple-finger interactions */
function Hand (ids) {
    this._super('constructor');

    this.fingers = !ids ? [] : map(ids, function (id) {
	return new Finger(id);
    });
}
inheritsFrom(Hand, EventBus);

/* Get finger by id */
Hand.prototype.get = function (id) {
    var foundFinger;

    forEach(this.fingers, function (finger) {
	if (finger.id == id) {
	    foundFinger = finger;
	}
    });

    return foundFinger;
};



/* Convert DOM touch event object to simple dictionary style object */
function domTouchToObj (touches, time, e) {
    return map(touches, function (touch) {
	return {
	    e: touches,
	    id: touch.identifier,
	    x: touch.pageX,
	    y: touch.pageY,
	    time: time
	};
    });
}

function domMouseToObj (mouseEvent, mouseID) {
    return [{
	e: mouseEvent,
	id: mouseID,
	x: mouseEvent.pageX,
	y: mouseEvent.pageY,
	time: mouseEvent.timeStamp
    }];
}



/* Controller object to handle Touchy interactions on an element */
function TouchController (elem, handleMouse, settings) {
    if (typeof settings == 'undefined') {
	settings = handleMouse;
	handleMouse = false;
    }

    if (typeof settings == 'function') {
	settings = { any: settings };
    }

    for (var name in plugins) {
	if (name in settings) {
	    var updates = plugins[name](elem, settings[name]);

	    if (typeof updates == 'function') {
		updates = { any: updates };
	    }

	    for (var handlerType in updates) {
		if (handlerType in settings) {
		    settings[handlerType] = (function (handler1, handler2) {
			return function () {
			    handler1.call(this, arguments);
			    handler2.call(this, arguments);
			};
		    })(settings[handlerType], updates[handlerType]);
		}

		else {
		    settings[handlerType] = updates[handlerType];
		}
	    }
	}
    }

    this.running = false;
    this.elem = elem;
    this.settings = settings || {};
    this.mainHand = new Hand();
    this.multiHand = null;
    this.mouseID = null;

    this.start();
};

/* Start watching element for touch events */
TouchController.prototype.start = function () {

    if (this.running) {
    	return;
    }
    this.running = true;
    if(Modernizr.touch){
	bind(this.elem, 'touchstart', this.touchstart() );
	bind(this.elem, 'touchmove' , this.touchmove()  );
	bind(this.elem, 'touchend'  , this.touchend()   );	
	bind(window, 'touchmove', function(e){e.preventDefault()});
    }
    else{
	bind(this.elem, 'mousedown' , this.mousedown() );
	bind(this.elem, 'mouseup'   , this.mouseup()   );
	bind(this.elem, 'mousemove' , this.mousemove() );	
    }
};

TouchController.prototype.handleMouse = function(x){

  if(x){
    bind(this.elem, 'mousedown' , this.mousedown() );
    bind(this.elem, 'mouseup'   , this.mouseup()   );
    bind(this.elem, 'mousemove' , this.mousemove() );
  }

  else{
    unbind(this.elem, 'mousedown' , this.mousedown() );
    unbind(this.elem, 'mouseup'   , this.mouseup()   );
    unbind(this.elem, 'mousemove' , this.mousemove() );
  } 
}

/* Stop watching element for touch events */
TouchController.prototype.stop = function () {
    if ( !this.running ) {
	return;
    }
    this.running = false;

    unbind(this.elem, 'touchstart', this.touchstart() );
    unbind(this.elem, 'touchmove' , this.touchmove()  );
    unbind(this.elem, 'touchend'  , this.touchend()   );

    unbind(this.elem, 'mousedown' , this.mousedown() );
    unbind(this.elem, 'mouseup'   , this.mouseup()   );
    unbind(this.elem, 'mousemove' , this.mousemove() );
};

/* Return a handler for DOM touchstart event */
TouchController.prototype.touchstart = function () {
    if ( !this._touchstart ) {
	var self = this;
	this._touchstart = function (e) {
      console.log(e)
      var touches = domTouchToObj(e.touches, e.timeStamp),
	    changedTouches = domTouchToObj(e.changedTouches, e.timeStamp, e);

	    self.mainHandStart(changedTouches);
	    self.multiHandStart(changedTouches, touches);
	};
    }

    return this._touchstart;
};

/* Return a handler for DOM touchmove event */
TouchController.prototype.touchmove = function () {
    if ( !this._touchmove ) {
	var self = this;
	this._touchmove = function (e) {
	    var touches = domTouchToObj(e.touches, e.timeStamp),
	    changedTouches = domTouchToObj(e.changedTouches, e.timeStamp);

	    self.mainHandMove(changedTouches);
	    self.multiHandMove(changedTouches, touches);
	};
    }

    return this._touchmove;
};

/* Return a handler for DOM touchend event */
TouchController.prototype.touchend = function () {
    if ( !this._touchend ) {
	var self = this;
	this._touchend = function (e) {
	    var touches = domTouchToObj(e.touches, e.timeStamp),
	    changedTouches = domTouchToObj(e.changedTouches, e.timeStamp);

	    self.mainHandEnd(changedTouches);
	    self.multiHandEnd(changedTouches, touches);
	};
    }

    return this._touchend;
};

/* Return a handler for DOM mousedown event */
TouchController.prototype.mousedown = function () {
    if ( !this._mousedown ) {
	var self = this;
	this._mousedown = function (e) {
	    var touches;

	    if ( self.mouseID ) {
		touches = domMouseToObj(e, self.mouseID);
		self.mainHandEnd(touches);
		self.multiHandEnd(touches, touches);
		self.mouseID = null;
	    }

	    self.mouseID = Math.random() + '';

	    touches = domMouseToObj(e, self.mouseID);
	    self.mainHandStart(touches);
	    self.multiHandStart(touches, touches);
	};
    }

    return this._mousedown;
};

/* Return a handler for DOM mouseup event */
TouchController.prototype.mouseup = function () {
    if ( !this._mouseup ) {
	var self = this;
	this._mouseup = function (e) {
	    var touches;

	    if ( self.mouseID ) {
		touches = domMouseToObj(e, self.mouseID);
		self.mainHandEnd(touches);
		self.multiHandEnd(touches, touches);
		self.mouseID = null;
	    }
	};
    }

    return this._mouseup;
};

/* Return a handler for DOM mousemove event */
TouchController.prototype.mousemove = function () {
    if ( !this._mousemove ) {
	var self = this;
	this._mousemove = function (e) {
	    var touches;

	    if ( self.mouseID ) {
		touches = domMouseToObj(e, self.mouseID);
		self.mainHandMove(touches);
		self.multiHandMove(touches, touches);
	    }
	};
    }

    return this._mousemove;
};

/* Handle the start of an individual finger interaction */
TouchController.prototype.mainHandStart = function (changedTouches) {
    var self = this,
    newFingers = [];

    forEach(changedTouches, function (touch) {
	var finger = new Finger(touch.id, touch.e);
	finger.lastPoint = touch;
	newFingers.push([ finger, touch ]);
	self.mainHand.fingers.push(finger);
    });

    forEach(newFingers, function (data) {
	self.settings.any && self.settings.any.call(self, self.mainHand, data[0]);
	data[0].trigger('start', data[1]);
    });

    self.mainHand.trigger('start', changedTouches);
};

/* Handle the movement of an individual finger interaction */
TouchController.prototype.mainHandMove = function (changedTouches) {
    var self = this,
    movedFingers = [];

    forEach(changedTouches, function (touch) {
	var finger = self.mainHand.get(touch.id);

	if ( !finger ) {
	    return;
	}

	finger.lastPoint = touch;
	movedFingers.push([ finger, touch ]);
    });

    forEach(movedFingers, function (data) {
	data[0].trigger('move', data[1]);
    });

    self.mainHand.trigger('move', changedTouches);
};

/* Handle the end of an individual finger interaction */
TouchController.prototype.mainHandEnd = function (changedTouches) {
    var self = this,
    endFingers = [];

    forEach(changedTouches, function (touch) {
	var finger = self.mainHand.get(touch.id),
	index;

	if ( !finger ) {
	    return;
	}

	finger.lastPoint = touch;
	endFingers.push([ finger, touch ]);

	index = indexOf(self.mainHand.fingers, finger);
	self.mainHand.fingers.splice(index, 1);
    });

    forEach(endFingers, function (data) {
	data[0].trigger('end', data[1]);
    });

    self.mainHand.trigger('end', changedTouches);
};

/* Handle the start of a multi-touch interaction */
TouchController.prototype.multiHandStart = function (changedTouches, touches) {
    this.multiHandDestroy();
    this.multiHandRestart(touches);
};

/* Handle the movement of a multi-touch interaction */
TouchController.prototype.multiHandMove = function (changedTouches, touches) {
    var self = this,
    movedFingers = [];

    forEach(changedTouches, function (touch) {
	var finger = self.multiHand.get(touch.id);

	if( !finger ) {
	    return;
	}

	finger.lastPoint = touch;
	movedFingers.push([ finger, touch ]);
    });

    forEach(movedFingers, function (data) {
	data[0].trigger('move', data[1]);
    });

    self.multiHand.trigger('move', changedTouches);
};

/* Handle the end of a multi-touch interaction */
TouchController.prototype.multiHandEnd = function (changedTouches, touches) {
    this.multiHandDestroy();

    var remainingTouches = filter(touches, function (touch) {
	var unChanged = true;

	forEach(changedTouches, function (changedTouch) {
	    if (changedTouch.id == touch.id) {
		unChanged = false;
	    }
	});

	return unChanged;
    });

    this.multiHandRestart(remainingTouches);
};

/* Create a new hand based on the current touches on the screen */
TouchController.prototype.multiHandRestart = function (touches) {
    var self = this;

    if (touches.length == 0) {
	return;
    }

    self.multiHand = new Hand();
    var newFingers = [];

    forEach(touches, function (touch) {
	var finger = new Finger(touch.id);

	finger.lastPoint = touch;
	newFingers.push([ finger, touch ]);
	self.multiHand.fingers.push(finger);
    });

    var func = self.settings[ {
	1: 'one',
	2: 'two',
	3: 'three',
	4: 'four',
	5: 'five'
    }[ self.multiHand.fingers.length ] ];

    func && func.apply(self, [ self.multiHand ].concat( self.multiHand.fingers ));

    forEach(newFingers, function (data) {
	data[0].trigger('start', data[1]);
    });

    self.multiHand.trigger('start', touches);
};

/* Destroy the current hand regardless of fingers on the screen */
TouchController.prototype.multiHandDestroy = function () {
    if ( !this.multiHand ) {
	return;
    }

    var points = [];

    forEach(this.multiHand.fingers, function (finger) {
	var point = finger.lastPoint;
	points.push(point);
	finger.trigger('end', point);
    });

    this.multiHand.trigger('end', points);

    this.multiHand = null;
};

/* Socket-style finger management for multi-touch events */
function Touchy (elem, handleMouse, settings) {
    return new TouchController(elem, handleMouse, settings);
}

/* Plugin support for custom touch handling */
var plugins = {};
Touchy.plugin = function (name, callback) {
    if (name in plugins) {
	throw 'Touchy: ' + name + ' plugin already defined';
    }

    plugins[name] = callback;
};



/* Prevent window movement (iOS fix) */
var preventDefault = function (e) { e.preventDefault() };

Touchy.stopWindowBounce = function () {
    bind(window, 'touchmove', preventDefault);
};

Touchy.startWindowBounce = function () {
    unbind(window, 'touchmove', preventDefault);
};

module.exports = Touchy;

},{}],10:[function(require,module,exports){
var close = require('closeness')

module.exports = function(node, points, fn){
  
  if(!(Array.isArray(points))){
    fn = points
    points = null
  }

  if(points){
    points = points.map(function(e){
      var self = e
      e.update = function(){
        self.closeX = close(self.x, self.radius * 10 || 10)
        self.closeY = close(self.y, self.radius * 10 || 10)
      }
      e.update()
      return e
    })
  }

  node.addEventListener('mouseover', onHover, true)

  node.addEventListener('mouseout', onExit, true)

  var node = node;

  var position = [0, 0];

  function mouseMove(evt){

    if(points){
      points.forEach(function(pt) {
        var x, y
        if(pt.hover){
          if(!(pt.closeX(x = evt.offsetX) && pt.closeY(y = evt.offsetY))){
            pt.hover = false
            fn(evt, pt, [x, y], false, true)
          }
        }
        if(pt.closeX(x = evt.offsetX) && pt.closeY(y = evt.offsetY)){
          pt.hover = true
          fn(evt, pt, [x, y], false, false)
        }
      })    
      return
    }

    position = findPos(evt.target);

    fn(evt, node, position, false, false)

  };

  function onExit(evt){

    window.removeEventListener('mousemove', mouseMove, true)
    
    if(points){
      points.forEach(function(pt) {
        var x, y
        if(pt.closeX(x = evt.offsetX) && pt.closeY(y = evt.offsetY)){
          pt.hover = false
          fn(evt, pt, [x, y], false, true)
        }
      })    
      return
    }


    position = findPos(evt.target);

    fn(evt, node, position, false, true)
  };


  function onHover(evt){

    window.addEventListener('mousemove', mouseMove, true);

    if(points){
      points.forEach(function(pt) {
        var x, y
        if(pt.closeX(x = evt.offsetX) && pt.closeY(y = evt.offsetY)){
          pt.hover = true
          fn(evt, pt, [x, y], true, false)
        }
      })    
      return
    }
    

    position = findPos(evt.target);

    fn(evt, node, position, true, false)

  };

  return points

}

function findPos(obj) {
  var curleft = 0
  ,   curtop = 0;

  if (obj.offsetParent) {

    do {

      curleft += obj.offsetLeft;

      curtop += obj.offsetTop;

    } 

    while (obj = obj.offsetParent);

    return [curleft,curtop];

  };
};

},{"closeness":11}],11:[function(require,module,exports){
module.exports = function(num, dist){
	return function(val){
		return (Math.abs(num - val) < dist)
	}
};
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5ucG0vbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiZW50cnkuanMiLCJpbnN0YWxsLWNhbnZhcy5qcyIsIm5vZGVfbW9kdWxlcy9udmVsb3BlL2Ftb2QuanMiLCJub2RlX21vZHVsZXMvbnZlbG9wZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9udmVsb3BlL25vZGVfbW9kdWxlcy9ub3JtYWxpemUtdGltZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaGRvd24vbm9kZV9tb2R1bGVzL25vZGUtdXVpZC91dWlkLmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoZG93bi9ub2RlX21vZHVsZXMvdXRpbHMtbWVyZ2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvdG91Y2hkb3duL3RvdWNoZG93bi5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaGRvd24vdG91Y2h5LmpzIiwiLi4vbW91c2Vhcm91bmQvaW5kZXguanMiLCIuLi9tb3VzZWFyb3VuZC9ub2RlX21vZHVsZXMvY2xvc2VuZXNzL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNydUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvL3ZhciBub3JtYWxpemUgPSByZXF1aXJlKCdub3JtYWxpemUtdGltZScpXG52YXIgaW5zdGFsbCA9IHJlcXVpcmUoJy4vaW5zdGFsbC1jYW52YXMnKShkb2N1bWVudC5ib2R5KVxudmFyIG52ZWxvcGUgPSByZXF1aXJlKCdudmVsb3BlJylcbnZhciBob3ZlciA9IHJlcXVpcmUoJy4uL21vdXNlYXJvdW5kJylcbnZhciB0b3VjaGRvd24gPSByZXF1aXJlKCd0b3VjaGRvd24nKVxuXG52YXIgY2FudmFzID0gaW5zdGFsbCgpXG52YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcbnZhciBwdHMgPSBbWzAsMF0sIFsxLDFdXSAvLyBpcnJlbGV2YW50IGFzc2lnbmF0aW9uXG52YXIgcHRzbWFwID0gW11cblxudG91Y2hkb3duLnN0YXJ0KGNhbnZhcylcbnZhciBob3ZlcmVkID0gbnVsbFxudmFyIGRyYWdnaW5nID0gbnVsbCBcblxuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ2RlbHRhdmVjdG9yJywgZnVuY3Rpb24oZXZ0KXtcbiAgaWYoaG92ZXJlZCl7XG4gICAgLy9jb25zb2xlLmxvZyhob3ZlcmVkKVxuICAgIGhvdmVyZWQueCA9IGV2dC5kZXRhaWwub2Zmc2V0WFxuICAgIGhvdmVyZWQueSA9IGV2dC5kZXRhaWwub2Zmc2V0WVxuICAgIGhvdmVyZWQudXBkYXRlKClcbiAgICBlbnYgPSBwdHMyZW52KHB0c21hcClcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCl7XG4gICAgICBjbGVhcigpXG4gICAgICBkcmF3KGVudilcbiAgICAgICBcbiAgICAgIGRyYXdDb250cm9scygpXG4gICAgfSlcbiAgfSAgXG59KVxuXG5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbGlmdG9mZicsIGZ1bmN0aW9uKGV2dCl7XG4gIGlmKGhvdmVyZWQpe1xuICAgIC8vY29uc29sZS5sb2coaG92ZXJlZClcbiAgICBob3ZlcmVkLnggPSBldnQuZGV0YWlsLm9mZnNldFhcbiAgICBob3ZlcmVkLnkgPSBldnQuZGV0YWlsLm9mZnNldFlcbiAgICBob3ZlcmVkLmhvdmVyID0gZmFsc2VcbiAgICBob3ZlcmVkLnVwZGF0ZSgpXG4gICAgZW52ID0gcHRzMmVudihwdHNtYXApXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpe1xuICAgICAgLy9jbGVhcigpXG4gICAgICBkcmF3KGVudilcbiAgICAgICBcbiAgICAgIGRyYXdDb250cm9scygpXG4gICAgfSlcbiAgfSAgXG59KVxuXG52YXIgcCA9IFtdXG5cbmV4cG9ydHMoW1tbMCwwXSxbLjUsLjVdLFsuNSwuNV0sWzEsMV1dXSwgWzFdKVxuXG5mdW5jdGlvbiBjbGVhcigpe1xuICBjdHguY2xlYXJSZWN0KDAsMCxjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpXG59XG5cbmZ1bmN0aW9uIHB0czJlbnYobWFwKXtcbiAgdmFyIG0gPSBtYXAubWFwKGZ1bmN0aW9uKGUpe1xuICAgIHJldHVybiBbZS54IC8gY2FudmFzLndpZHRoLCAgMSAtIGUueSAvIGNhbnZhcy5oZWlnaHRdXG4gIH0pLnNvcnQoZnVuY3Rpb24oYSxiKXtcbiAgICByZXR1cm4gYVswXSAtIGJbMF0gXG4gIH0pXG4gIG0gPSBbbV0gICAgXG4gIHJldHVybiBudmVsb3BlKG0sIFtjYW52YXMud2lkdGhdKVxufVxuXG5mdW5jdGlvbiBleHBvcnRzKGN0bHMsIGR1cil7XG4gIFxuICBwdHNtYXAgPSBjdGxzWzBdLm1hcChmdW5jdGlvbihwdCl7XG4gICAgdmFyIG1hcCA9IHt9XG4gICAgbWFwLnJhZGl1cyA9IDIwXG4gICAgbWFwLnggPSBwdFswXSAqIGNhbnZhcy53aWR0aFxuICAgIG1hcC55ID0gY2FudmFzLmhlaWdodCAtICgocHRbMV0pICogY2FudmFzLmhlaWdodClcbiAgICByZXR1cm4gbWFwIFxuICB9KVxuICBlbnYgPSBudmVsb3BlKGN0bHMsIFtjYW52YXMud2lkdGhdKSAvL252ZWxvcGUocHRzMmVudihwdHNtYXApLCBbY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0XSlcbiAgZHJhdyhlbnYpXG4gIGRyYXdDb250cm9scygpXG4gIHB0c21hcCA9IGhvdmVyKGNhbnZhcywgcHRzbWFwLCBmdW5jdGlvbihldiwgcHQsIHh5LCBzdGFydCwgZW5kKXtcbiAgICBpZihlbmQgJiYgcHQgPT09IGhvdmVyZWQpIGhvdmVyZWQgPSBudWxsIFxuICAgIGVsc2UgaWYoIWhvdmVyZWQpIGhvdmVyZWQgPSBwdFxuICAgIGVsc2UgcmV0dXJuXG4gIH0pXG4gIFxufVxuXG5mdW5jdGlvbiBkcmF3Q29udHJvbHMoKXtcbiAgcHRzbWFwLmZvckVhY2goZnVuY3Rpb24ocHQpe1xuICAgIGN0eC5iZWdpblBhdGgoKVxuICAgIGN0eC5hcmMocHQueCwgcHQueSwgcHQucmFkaXVzLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpXG4gICAgY3R4LmZpbGxTdHlsZSA9ICdncmVlbidcbiAgICBjdHguZmlsbCgpXG4gICAgY3R4LnN0cm9rZSgpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGRyYXcoZW52KXtcbiAgY3R4Lm1vdmVUbygwLCBlbnYoMCkpXG4gIGN0eC5iZWdpblBhdGgoKVxuICBmb3IodmFyIHggPSAxOyB4IDw9IGNhbnZhcy53aWR0aDsgeCsrKXtcbiAgICBjdHgubGluZVRvKHgsIChjYW52YXMuaGVpZ2h0ICogKDEgLSBlbnYoeCkpKSlcbiAgfVxuICBjdHguc3Ryb2tlU3R5bGUgPSAncGluaydcbiAgY3R4LmxpbmVXaWR0aCA9IDM7XG4gIGN0eC5zdHJva2UoKVxufVxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHBhcmVudCl7XG4gIGlmKCFwYXJlbnQpIHBhcmVudCA9IGRvY3VtZW50LmJvZHlcbiAgdmFyIGluZGV4ID0gW11cblxuICByZXR1cm4gaW5zdGFsbENhbnZhc1xuXG4gIGZ1bmN0aW9uIGluc3RhbGxDYW52YXMoekluZGV4KXtcbiAgICB6SW5kZXggPSB6SW5kZXggfHwgaW5kZXgubGVuZ3RoXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgY2FudmFzLndpZHRoID0gcGFyc2VGbG9hdChnZXRDU1MocGFyZW50LCAnd2lkdGgnKSlcbiAgICBjYW52YXMuaGVpZ2h0ID0gcGFyc2VGbG9hdChnZXRDU1MocGFyZW50LCAnaGVpZ2h0JykpXG4gICAgY2FudmFzLnN0eWxlLndpZHRoID0gY2FudmFzLndpZHRoICsgJ3B4J1xuICAgIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBjYW52YXMuaGVpZ2h0ICsgJ3B4J1xuICAgIGNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbiAgICBjYW52YXMuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50J1xuICAgIGNhbnZhcy5zdHlsZS56SW5kZXggPSB6SW5kZXggXG4gICAgY2FudmFzLnN0eWxlLnRvcCA9ICcwcHgnXG4gICAgY2FudmFzLnN0eWxlLmxlZnQgPSAnMHB4J1xuICAgIGluZGV4LnNwbGljZSh6SW5kZXgsIDAsIGNhbnZhcylcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoY2FudmFzKVxuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuICAgIGN0eC50cmFuc2xhdGUoLjUsIC41KVxuICAgIHJldHVybiBjYW52YXNcbiAgfVxuXG59XG5cbmZ1bmN0aW9uIGdldENTUyhlbCwgcHJvcCl7XG4gIHJldHVybiBkb2N1bWVudC5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKGVsKS5nZXRQcm9wZXJ0eVZhbHVlKHByb3ApXG59XG5cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHB0cykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBhID0gcHRzOyBhLmxlbmd0aCA+IDE7IGEgPSBiKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBiID0gW10sIGo7IGkgPCBhLmxlbmd0aCAtIDE7IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoYltpXSA9IFtdLCBqID0gMTsgaiA8IGFbaV0ubGVuZ3RoOyBqKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJbaV1bal0gPSBhW2ldW2pdICogKDEgLSB0KSArIGFbaSsxXVtqXSAqIHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFbMF1bMV07XG5cdH0gICAgXG59XG5cblxuIiwidmFyIGFtb2QgPSByZXF1aXJlKCAnLi9hbW9kLmpzJyk7XG52YXIgdG5vcm0gPSByZXF1aXJlKCdub3JtYWxpemUtdGltZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHB0cywgZHVycyl7XG5cdFxuXHRwdHMgPSBwdHMubWFwKGFtb2QpXG5cdHZhciB0ID0gMDtcblx0dmFyIHRvdGFsRHVyYXRpb24gPSBkdXJzLnJlZHVjZShmdW5jdGlvbihlLGkpe3JldHVybiBlICsgaX0sIDApO1xuXHR2YXIgdGROb3JtRk4gPSB0bm9ybSh0LCB0b3RhbER1cmF0aW9uKTtcblx0dmFyIHMgPSAwO1xuXHR2YXIgZW5kID0gdCArIHRvdGFsRHVyYXRpb247XG5cdHZhciBkdXJGTlMgPSBkdXJzLm1hcChmdW5jdGlvbihlLGkpe1xuXHRcdHZhciB4ID0gdG5vcm0odCArIHMsIGUpXG5cdFx0cyArPSBlO1xuXHRcdHJldHVybiB4XG5cdH0pXG5cdHZhciBkcCA9IDA7XG5cdHZhciBkdXJwZXJjZW50ID0gZHVycy5tYXAoZnVuY3Rpb24oZSwgaSl7XG5cdFx0dmFyIHggPSAoZSAvIHRvdGFsRHVyYXRpb24pICsgZHA7XG5cdFx0ZHArPSAoZSAvIHRvdGFsRHVyYXRpb24pXG5cdFx0cmV0dXJuIHhcblx0fSlcblx0dmFyIHRuLCBuLCBpLCB2ID0gMCwgZm4gPSAwO1xuXHR2YXIgZW52ZWxvcGUgPSBmdW5jdGlvbih0KXtcblx0XHR0biA9IHRkTm9ybUZOKHQpO1xuXHRcdGlmKDAgPiB0biB8fCB0biA+IDEpIHJldHVybiAwO1xuXHRcdGZuID0gZHVycGVyY2VudC5yZWR1Y2UoZnVuY3Rpb24ocCwgZSwgaSwgZCl7cmV0dXJuICgoZFtpLTFdIHx8IDApIDw9IHRuICYmIHRuIDw9IGUpID8gaSA6IHB9LCAwKVxuXHRcdHYgPSBwdHNbZm5dKGR1ckZOU1tmbl0odCkpXG5cdFx0cmV0dXJuIHZcblx0fVxuXHRyZXR1cm4gZW52ZWxvcGVcblxuXHQvLyBwcm9iYWJseSBkZWxldGFibGVcblx0ZnVuY3Rpb24geGVudmVsb3BlKHQsIHN1c3RhaW4pe1xuXHRcdHRuID0gdGROb3JtRk4odCk7IFxuXHRcdGlmKDAgPj0gdG4gfHwgdG4gID49IDEpIHJldHVybiAwO1xuXHRcdGlmKHRuID4gZHVycGVyY2VudFtmbl0pIGZuID0gKGZuICsgMSA+IHB0cy5sZW5ndGggLSAxID8gMCA6IGZuICsgMSlcblx0XHR2ID0gcHRzW2ZuXShkdXJGTlNbZm5dKHQpKVxuXHRcdHJldHVybiB2XG5cdH1cbn1cblxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdGFydCwgZHVyLCBtaW4sIG1heCl7XG5cblx0aWYoIW1pbikgbWluID0gMDtcblx0aWYoIW1heCkgbWF4ID0gMTtcblx0dmFyIGVuZCA9IHN0YXJ0ICsgZHVyO1xuXHR2YXIgZCA9IGVuZCAtIHN0YXJ0O1xuXHR2YXIgciA9IG1heCAtIG1pbjtcblxuXHRyZXR1cm4gZnVuY3Rpb24odGltZSl7XG5cblx0XHR4ID0gbWluICsgKHRpbWUgLSBzdGFydCkgKiByIC8gZFxuXHRcdGlmKHggPiAxKXtcbi8vXHRcdFx0Y29uc29sZS5sb2coJ3ByZScsIHRpbWUsIGVuZClcblx0XHRcdGlmKHRpbWUgPCBlbmQpIHggPSBOdW1iZXIoJy4nICsgeC50b1N0cmluZygpLnNwbGl0KCcuJykuam9pbignJykpXG4vL1x0XHRcdGNvbnNvbGUubG9nKCdub3JtJywgeClcblx0XHR9XG5cdFx0cmV0dXJuIHhcblx0fVxuXG59XG4iLCIvLyAgICAgdXVpZC5qc1xuLy9cbi8vICAgICBDb3B5cmlnaHQgKGMpIDIwMTAtMjAxMiBSb2JlcnQgS2llZmZlclxuLy8gICAgIE1JVCBMaWNlbnNlIC0gaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBfZ2xvYmFsID0gdGhpcztcblxuICAvLyBVbmlxdWUgSUQgY3JlYXRpb24gcmVxdWlyZXMgYSBoaWdoIHF1YWxpdHkgcmFuZG9tICMgZ2VuZXJhdG9yLiAgV2UgZmVhdHVyZVxuICAvLyBkZXRlY3QgdG8gZGV0ZXJtaW5lIHRoZSBiZXN0IFJORyBzb3VyY2UsIG5vcm1hbGl6aW5nIHRvIGEgZnVuY3Rpb24gdGhhdFxuICAvLyByZXR1cm5zIDEyOC1iaXRzIG9mIHJhbmRvbW5lc3MsIHNpbmNlIHRoYXQncyB3aGF0J3MgdXN1YWxseSByZXF1aXJlZFxuICB2YXIgX3JuZztcblxuICAvLyBOb2RlLmpzIGNyeXB0by1iYXNlZCBSTkcgLSBodHRwOi8vbm9kZWpzLm9yZy9kb2NzL3YwLjYuMi9hcGkvY3J5cHRvLmh0bWxcbiAgLy9cbiAgLy8gTW9kZXJhdGVseSBmYXN0LCBoaWdoIHF1YWxpdHlcbiAgaWYgKHR5cGVvZihfZ2xvYmFsLnJlcXVpcmUpID09ICdmdW5jdGlvbicpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIF9yYiA9IF9nbG9iYWwucmVxdWlyZSgnY3J5cHRvJykucmFuZG9tQnl0ZXM7XG4gICAgICBfcm5nID0gX3JiICYmIGZ1bmN0aW9uKCkge3JldHVybiBfcmIoMTYpO307XG4gICAgfSBjYXRjaChlKSB7fVxuICB9XG5cbiAgaWYgKCFfcm5nICYmIF9nbG9iYWwuY3J5cHRvICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMpIHtcbiAgICAvLyBXSEFUV0cgY3J5cHRvLWJhc2VkIFJORyAtIGh0dHA6Ly93aWtpLndoYXR3Zy5vcmcvd2lraS9DcnlwdG9cbiAgICAvL1xuICAgIC8vIE1vZGVyYXRlbHkgZmFzdCwgaGlnaCBxdWFsaXR5XG4gICAgdmFyIF9ybmRzOCA9IG5ldyBVaW50OEFycmF5KDE2KTtcbiAgICBfcm5nID0gZnVuY3Rpb24gd2hhdHdnUk5HKCkge1xuICAgICAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhfcm5kczgpO1xuICAgICAgcmV0dXJuIF9ybmRzODtcbiAgICB9O1xuICB9XG5cbiAgaWYgKCFfcm5nKSB7XG4gICAgLy8gTWF0aC5yYW5kb20oKS1iYXNlZCAoUk5HKVxuICAgIC8vXG4gICAgLy8gSWYgYWxsIGVsc2UgZmFpbHMsIHVzZSBNYXRoLnJhbmRvbSgpLiAgSXQncyBmYXN0LCBidXQgaXMgb2YgdW5zcGVjaWZpZWRcbiAgICAvLyBxdWFsaXR5LlxuICAgIHZhciAgX3JuZHMgPSBuZXcgQXJyYXkoMTYpO1xuICAgIF9ybmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCByOyBpIDwgMTY7IGkrKykge1xuICAgICAgICBpZiAoKGkgJiAweDAzKSA9PT0gMCkgciA9IE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMDtcbiAgICAgICAgX3JuZHNbaV0gPSByID4+PiAoKGkgJiAweDAzKSA8PCAzKSAmIDB4ZmY7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBfcm5kcztcbiAgICB9O1xuICB9XG5cbiAgLy8gQnVmZmVyIGNsYXNzIHRvIHVzZVxuICB2YXIgQnVmZmVyQ2xhc3MgPSB0eXBlb2YoX2dsb2JhbC5CdWZmZXIpID09ICdmdW5jdGlvbicgPyBfZ2xvYmFsLkJ1ZmZlciA6IEFycmF5O1xuXG4gIC8vIE1hcHMgZm9yIG51bWJlciA8LT4gaGV4IHN0cmluZyBjb252ZXJzaW9uXG4gIHZhciBfYnl0ZVRvSGV4ID0gW107XG4gIHZhciBfaGV4VG9CeXRlID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgICBfYnl0ZVRvSGV4W2ldID0gKGkgKyAweDEwMCkudG9TdHJpbmcoMTYpLnN1YnN0cigxKTtcbiAgICBfaGV4VG9CeXRlW19ieXRlVG9IZXhbaV1dID0gaTtcbiAgfVxuXG4gIC8vICoqYHBhcnNlKClgIC0gUGFyc2UgYSBVVUlEIGludG8gaXQncyBjb21wb25lbnQgYnl0ZXMqKlxuICBmdW5jdGlvbiBwYXJzZShzLCBidWYsIG9mZnNldCkge1xuICAgIHZhciBpID0gKGJ1ZiAmJiBvZmZzZXQpIHx8IDAsIGlpID0gMDtcblxuICAgIGJ1ZiA9IGJ1ZiB8fCBbXTtcbiAgICBzLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvWzAtOWEtZl17Mn0vZywgZnVuY3Rpb24ob2N0KSB7XG4gICAgICBpZiAoaWkgPCAxNikgeyAvLyBEb24ndCBvdmVyZmxvdyFcbiAgICAgICAgYnVmW2kgKyBpaSsrXSA9IF9oZXhUb0J5dGVbb2N0XTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFplcm8gb3V0IHJlbWFpbmluZyBieXRlcyBpZiBzdHJpbmcgd2FzIHNob3J0XG4gICAgd2hpbGUgKGlpIDwgMTYpIHtcbiAgICAgIGJ1ZltpICsgaWkrK10gPSAwO1xuICAgIH1cblxuICAgIHJldHVybiBidWY7XG4gIH1cblxuICAvLyAqKmB1bnBhcnNlKClgIC0gQ29udmVydCBVVUlEIGJ5dGUgYXJyYXkgKGFsYSBwYXJzZSgpKSBpbnRvIGEgc3RyaW5nKipcbiAgZnVuY3Rpb24gdW5wYXJzZShidWYsIG9mZnNldCkge1xuICAgIHZhciBpID0gb2Zmc2V0IHx8IDAsIGJ0aCA9IF9ieXRlVG9IZXg7XG4gICAgcmV0dXJuICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXTtcbiAgfVxuXG4gIC8vICoqYHYxKClgIC0gR2VuZXJhdGUgdGltZS1iYXNlZCBVVUlEKipcbiAgLy9cbiAgLy8gSW5zcGlyZWQgYnkgaHR0cHM6Ly9naXRodWIuY29tL0xpb3NLL1VVSUQuanNcbiAgLy8gYW5kIGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS91dWlkLmh0bWxcblxuICAvLyByYW5kb20gIydzIHdlIG5lZWQgdG8gaW5pdCBub2RlIGFuZCBjbG9ja3NlcVxuICB2YXIgX3NlZWRCeXRlcyA9IF9ybmcoKTtcblxuICAvLyBQZXIgNC41LCBjcmVhdGUgYW5kIDQ4LWJpdCBub2RlIGlkLCAoNDcgcmFuZG9tIGJpdHMgKyBtdWx0aWNhc3QgYml0ID0gMSlcbiAgdmFyIF9ub2RlSWQgPSBbXG4gICAgX3NlZWRCeXRlc1swXSB8IDB4MDEsXG4gICAgX3NlZWRCeXRlc1sxXSwgX3NlZWRCeXRlc1syXSwgX3NlZWRCeXRlc1szXSwgX3NlZWRCeXRlc1s0XSwgX3NlZWRCeXRlc1s1XVxuICBdO1xuXG4gIC8vIFBlciA0LjIuMiwgcmFuZG9taXplICgxNCBiaXQpIGNsb2Nrc2VxXG4gIHZhciBfY2xvY2tzZXEgPSAoX3NlZWRCeXRlc1s2XSA8PCA4IHwgX3NlZWRCeXRlc1s3XSkgJiAweDNmZmY7XG5cbiAgLy8gUHJldmlvdXMgdXVpZCBjcmVhdGlvbiB0aW1lXG4gIHZhciBfbGFzdE1TZWNzID0gMCwgX2xhc3ROU2VjcyA9IDA7XG5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9icm9vZmEvbm9kZS11dWlkIGZvciBBUEkgZGV0YWlsc1xuICBmdW5jdGlvbiB2MShvcHRpb25zLCBidWYsIG9mZnNldCkge1xuICAgIHZhciBpID0gYnVmICYmIG9mZnNldCB8fCAwO1xuICAgIHZhciBiID0gYnVmIHx8IFtdO1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgY2xvY2tzZXEgPSBvcHRpb25zLmNsb2Nrc2VxICE9IG51bGwgPyBvcHRpb25zLmNsb2Nrc2VxIDogX2Nsb2Nrc2VxO1xuXG4gICAgLy8gVVVJRCB0aW1lc3RhbXBzIGFyZSAxMDAgbmFuby1zZWNvbmQgdW5pdHMgc2luY2UgdGhlIEdyZWdvcmlhbiBlcG9jaCxcbiAgICAvLyAoMTU4Mi0xMC0xNSAwMDowMCkuICBKU051bWJlcnMgYXJlbid0IHByZWNpc2UgZW5vdWdoIGZvciB0aGlzLCBzb1xuICAgIC8vIHRpbWUgaXMgaGFuZGxlZCBpbnRlcm5hbGx5IGFzICdtc2VjcycgKGludGVnZXIgbWlsbGlzZWNvbmRzKSBhbmQgJ25zZWNzJ1xuICAgIC8vICgxMDAtbmFub3NlY29uZHMgb2Zmc2V0IGZyb20gbXNlY3MpIHNpbmNlIHVuaXggZXBvY2gsIDE5NzAtMDEtMDEgMDA6MDAuXG4gICAgdmFyIG1zZWNzID0gb3B0aW9ucy5tc2VjcyAhPSBudWxsID8gb3B0aW9ucy5tc2VjcyA6IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgLy8gUGVyIDQuMi4xLjIsIHVzZSBjb3VudCBvZiB1dWlkJ3MgZ2VuZXJhdGVkIGR1cmluZyB0aGUgY3VycmVudCBjbG9ja1xuICAgIC8vIGN5Y2xlIHRvIHNpbXVsYXRlIGhpZ2hlciByZXNvbHV0aW9uIGNsb2NrXG4gICAgdmFyIG5zZWNzID0gb3B0aW9ucy5uc2VjcyAhPSBudWxsID8gb3B0aW9ucy5uc2VjcyA6IF9sYXN0TlNlY3MgKyAxO1xuXG4gICAgLy8gVGltZSBzaW5jZSBsYXN0IHV1aWQgY3JlYXRpb24gKGluIG1zZWNzKVxuICAgIHZhciBkdCA9IChtc2VjcyAtIF9sYXN0TVNlY3MpICsgKG5zZWNzIC0gX2xhc3ROU2VjcykvMTAwMDA7XG5cbiAgICAvLyBQZXIgNC4yLjEuMiwgQnVtcCBjbG9ja3NlcSBvbiBjbG9jayByZWdyZXNzaW9uXG4gICAgaWYgKGR0IDwgMCAmJiBvcHRpb25zLmNsb2Nrc2VxID09IG51bGwpIHtcbiAgICAgIGNsb2Nrc2VxID0gY2xvY2tzZXEgKyAxICYgMHgzZmZmO1xuICAgIH1cblxuICAgIC8vIFJlc2V0IG5zZWNzIGlmIGNsb2NrIHJlZ3Jlc3NlcyAobmV3IGNsb2Nrc2VxKSBvciB3ZSd2ZSBtb3ZlZCBvbnRvIGEgbmV3XG4gICAgLy8gdGltZSBpbnRlcnZhbFxuICAgIGlmICgoZHQgPCAwIHx8IG1zZWNzID4gX2xhc3RNU2VjcykgJiYgb3B0aW9ucy5uc2VjcyA9PSBudWxsKSB7XG4gICAgICBuc2VjcyA9IDA7XG4gICAgfVxuXG4gICAgLy8gUGVyIDQuMi4xLjIgVGhyb3cgZXJyb3IgaWYgdG9vIG1hbnkgdXVpZHMgYXJlIHJlcXVlc3RlZFxuICAgIGlmIChuc2VjcyA+PSAxMDAwMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1dWlkLnYxKCk6IENhblxcJ3QgY3JlYXRlIG1vcmUgdGhhbiAxME0gdXVpZHMvc2VjJyk7XG4gICAgfVxuXG4gICAgX2xhc3RNU2VjcyA9IG1zZWNzO1xuICAgIF9sYXN0TlNlY3MgPSBuc2VjcztcbiAgICBfY2xvY2tzZXEgPSBjbG9ja3NlcTtcblxuICAgIC8vIFBlciA0LjEuNCAtIENvbnZlcnQgZnJvbSB1bml4IGVwb2NoIHRvIEdyZWdvcmlhbiBlcG9jaFxuICAgIG1zZWNzICs9IDEyMjE5MjkyODAwMDAwO1xuXG4gICAgLy8gYHRpbWVfbG93YFxuICAgIHZhciB0bCA9ICgobXNlY3MgJiAweGZmZmZmZmYpICogMTAwMDAgKyBuc2VjcykgJSAweDEwMDAwMDAwMDtcbiAgICBiW2krK10gPSB0bCA+Pj4gMjQgJiAweGZmO1xuICAgIGJbaSsrXSA9IHRsID4+PiAxNiAmIDB4ZmY7XG4gICAgYltpKytdID0gdGwgPj4+IDggJiAweGZmO1xuICAgIGJbaSsrXSA9IHRsICYgMHhmZjtcblxuICAgIC8vIGB0aW1lX21pZGBcbiAgICB2YXIgdG1oID0gKG1zZWNzIC8gMHgxMDAwMDAwMDAgKiAxMDAwMCkgJiAweGZmZmZmZmY7XG4gICAgYltpKytdID0gdG1oID4+PiA4ICYgMHhmZjtcbiAgICBiW2krK10gPSB0bWggJiAweGZmO1xuXG4gICAgLy8gYHRpbWVfaGlnaF9hbmRfdmVyc2lvbmBcbiAgICBiW2krK10gPSB0bWggPj4+IDI0ICYgMHhmIHwgMHgxMDsgLy8gaW5jbHVkZSB2ZXJzaW9uXG4gICAgYltpKytdID0gdG1oID4+PiAxNiAmIDB4ZmY7XG5cbiAgICAvLyBgY2xvY2tfc2VxX2hpX2FuZF9yZXNlcnZlZGAgKFBlciA0LjIuMiAtIGluY2x1ZGUgdmFyaWFudClcbiAgICBiW2krK10gPSBjbG9ja3NlcSA+Pj4gOCB8IDB4ODA7XG5cbiAgICAvLyBgY2xvY2tfc2VxX2xvd2BcbiAgICBiW2krK10gPSBjbG9ja3NlcSAmIDB4ZmY7XG5cbiAgICAvLyBgbm9kZWBcbiAgICB2YXIgbm9kZSA9IG9wdGlvbnMubm9kZSB8fCBfbm9kZUlkO1xuICAgIGZvciAodmFyIG4gPSAwOyBuIDwgNjsgbisrKSB7XG4gICAgICBiW2kgKyBuXSA9IG5vZGVbbl07XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZiA/IGJ1ZiA6IHVucGFyc2UoYik7XG4gIH1cblxuICAvLyAqKmB2NCgpYCAtIEdlbmVyYXRlIHJhbmRvbSBVVUlEKipcblxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2Jyb29mYS9ub2RlLXV1aWQgZm9yIEFQSSBkZXRhaWxzXG4gIGZ1bmN0aW9uIHY0KG9wdGlvbnMsIGJ1Ziwgb2Zmc2V0KSB7XG4gICAgLy8gRGVwcmVjYXRlZCAtICdmb3JtYXQnIGFyZ3VtZW50LCBhcyBzdXBwb3J0ZWQgaW4gdjEuMlxuICAgIHZhciBpID0gYnVmICYmIG9mZnNldCB8fCAwO1xuXG4gICAgaWYgKHR5cGVvZihvcHRpb25zKSA9PSAnc3RyaW5nJykge1xuICAgICAgYnVmID0gb3B0aW9ucyA9PSAnYmluYXJ5JyA/IG5ldyBCdWZmZXJDbGFzcygxNikgOiBudWxsO1xuICAgICAgb3B0aW9ucyA9IG51bGw7XG4gICAgfVxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIHJuZHMgPSBvcHRpb25zLnJhbmRvbSB8fCAob3B0aW9ucy5ybmcgfHwgX3JuZykoKTtcblxuICAgIC8vIFBlciA0LjQsIHNldCBiaXRzIGZvciB2ZXJzaW9uIGFuZCBgY2xvY2tfc2VxX2hpX2FuZF9yZXNlcnZlZGBcbiAgICBybmRzWzZdID0gKHJuZHNbNl0gJiAweDBmKSB8IDB4NDA7XG4gICAgcm5kc1s4XSA9IChybmRzWzhdICYgMHgzZikgfCAweDgwO1xuXG4gICAgLy8gQ29weSBieXRlcyB0byBidWZmZXIsIGlmIHByb3ZpZGVkXG4gICAgaWYgKGJ1Zikge1xuICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IDE2OyBpaSsrKSB7XG4gICAgICAgIGJ1ZltpICsgaWldID0gcm5kc1tpaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZiB8fCB1bnBhcnNlKHJuZHMpO1xuICB9XG5cbiAgLy8gRXhwb3J0IHB1YmxpYyBBUElcbiAgdmFyIHV1aWQgPSB2NDtcbiAgdXVpZC52MSA9IHYxO1xuICB1dWlkLnY0ID0gdjQ7XG4gIHV1aWQucGFyc2UgPSBwYXJzZTtcbiAgdXVpZC51bnBhcnNlID0gdW5wYXJzZTtcbiAgdXVpZC5CdWZmZXJDbGFzcyA9IEJ1ZmZlckNsYXNzO1xuXG4gIGlmICh0eXBlb2YobW9kdWxlKSAhPSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgIC8vIFB1Ymxpc2ggYXMgbm9kZS5qcyBtb2R1bGVcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHV1aWQ7XG4gIH0gZWxzZSAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIFB1Ymxpc2ggYXMgQU1EIG1vZHVsZVxuICAgIGRlZmluZShmdW5jdGlvbigpIHtyZXR1cm4gdXVpZDt9KTtcbiBcblxuICB9IGVsc2Uge1xuICAgIC8vIFB1Ymxpc2ggYXMgZ2xvYmFsIChpbiBicm93c2VycylcbiAgICB2YXIgX3ByZXZpb3VzUm9vdCA9IF9nbG9iYWwudXVpZDtcblxuICAgIC8vICoqYG5vQ29uZmxpY3QoKWAgLSAoYnJvd3NlciBvbmx5KSB0byByZXNldCBnbG9iYWwgJ3V1aWQnIHZhcioqXG4gICAgdXVpZC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICBfZ2xvYmFsLnV1aWQgPSBfcHJldmlvdXNSb290O1xuICAgICAgcmV0dXJuIHV1aWQ7XG4gICAgfTtcblxuICAgIF9nbG9iYWwudXVpZCA9IHV1aWQ7XG4gIH1cbn0pLmNhbGwodGhpcyk7XG4iLCIvKipcbiAqIE1lcmdlIG9iamVjdCBiIHdpdGggb2JqZWN0IGEuXG4gKlxuICogICAgIHZhciBhID0geyBmb286ICdiYXInIH1cbiAqICAgICAgICwgYiA9IHsgYmFyOiAnYmF6JyB9O1xuICpcbiAqICAgICBtZXJnZShhLCBiKTtcbiAqICAgICAvLyA9PiB7IGZvbzogJ2JhcicsIGJhcjogJ2JheicgfVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhLCBiKXtcbiAgaWYgKGEgJiYgYikge1xuICAgIGZvciAodmFyIGtleSBpbiBiKSB7XG4gICAgICBhW2tleV0gPSBiW2tleV07XG4gICAgfVxuICB9XG4gIHJldHVybiBhO1xufTtcbiIsInZhciB0b3VjaHkgPSByZXF1aXJlKCcuL3RvdWNoeS5qcycpXG4sICAgdXVpZCA9IHJlcXVpcmUoJ25vZGUtdXVpZCcpXG4sICAgbWVyZ2UgPSByZXF1aXJlKCd1dGlscy1tZXJnZScpXG47XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG5cbiAgaWYod2luZG93Ll90b3VjaCkgcmV0dXJuIHdpbmRvdy5fdG91Y2g7XG5cbiAgZWxzZSByZXR1cm4gbmV3IHRvdWNoKClcblxufSgpKTtcblxuZnVuY3Rpb24gdG91Y2goKXtcblxuICB3aW5kb3cuX3RvdWNoID0gdGhpcztcblxuICB0aGlzLmVsZW1lbnRzID0gW107XG5cbiAgdGhpcy50b3VjaHkgPSB0b3VjaHkod2luZG93LCB0b3VjaHRlc3QpO1xuXG59O1xuXG50b3VjaC5wcm90b3R5cGUuc3RhcnQgPSB0b3VjaC5wcm90b3R5cGUubGlzdGVuID0gZnVuY3Rpb24oZWwpe1xuXG4gICAgaWYoIWVsLnRvdWNoX2lkKSBlbC50b3VjaF9pZCA9ICgnZnVuY3Rpb24nID09IHR5cGVvZiB1dWlkLnYxKSA/IHV1aWQudjEoKSA6IHV1aWQoKTtcblxuICAgIHRoaXMuZWxlbWVudHMucHVzaChlbCk7XG5cbiAgICBlbC50b3VjaCA9IDE7XG5cblx0XHRyZXR1cm4gZWxcblxufTtcblxudG91Y2gucHJvdG90eXBlLnJlZ2lzdGVyID0gZnVuY3Rpb24oZWwpe1xuXG4gICAgaWYoIWVsLnRvdWNoX2lkKSBlbC50b3VjaF9pZCA9IHV1aWQudjEoKTtcblxuICAgIHRoaXMuZWxlbWVudHMucHVzaChlbCk7XG5cbiAgICBlbC50b3VjaCA9IDA7IC8vIG5lZWRzIHRvIGJlIHN0YXJ0ZWRcblxuXHRcdHJldHVybiBlbFxuXG59O1xuXG5cbmZ1bmN0aW9uIHRvdWNodGVzdChoYW5kLCBmaW5nZXIpe1xuXHRcblx0dmFyIGxhc3RQb2ludCA9IFtdLCBhbGxQb2ludHMgPSBbXTtcblxuICB2YXIgbGFzdE9mZnNldFBvaW50ID0gW10sIGFsbE9mZnNldFBvaW50cyA9IFtdO1xuXG4gIGZpbmdlci5vbignc3RhcnQnLCBmdW5jdGlvbihwb2ludCl7XG5cdFxuXHRcdHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChwb2ludC54IC0gd2luZG93LnNjcm9sbFgsIHBvaW50LnkgLSB3aW5kb3cuc2Nyb2xsWSk7XG4gICAgXG4gICAgdmFyIGVsID0gc2VhcmNoKGVsZW1lbnQpO1xuXG4gICAgaWYoZWwpe1xuICAgICAgaWYoIXBvaW50Lm9mZnNldFgpe1xuICAgICAgICBwb2ludC5vZmZzZXRYID0gcG9pbnQueCAtIHBvaW50LmUudGFyZ2V0Lm9mZnNldExlZnRcbiAgICAgICAgcG9pbnQub2Zmc2V0WSA9IHBvaW50LnkgLSBwb2ludC5lLnRhcmdldC5vZmZzZXRUb3BcbiAgICAgIH1cbiAgICAgIG1lcmdlKHBvaW50LCBwb2ludC5lKVxuXG5cdFx0ICBcbiAgICAgIGxhc3RQb2ludFswXSA9IHBvaW50LnhcbiAgICAgIGxhc3RQb2ludFsxXSA9IHBvaW50LnlcbiAgICAgIGxhc3RQb2ludFsyXSA9IHBvaW50LnRpbWVcblx0XHQgIFxuICAgICAgbGFzdE9mZnNldFBvaW50WzBdID0gcG9pbnQub2Zmc2V0WFxuICAgICAgbGFzdE9mZnNldFBvaW50WzFdID0gcG9pbnQub2Zmc2V0WVxuXG5cdFx0ICBhbGxQb2ludHMucHVzaChsYXN0UG9pbnQuc2xpY2UoMCkpXG4gICAgICBhbGxPZmZzZXRQb2ludHMucHVzaChsYXN0T2Zmc2V0UG9pbnQuc2xpY2UoMCkpXG5cbiAgICAgIHRoaXMuaXMgPSB0cnVlO1xuXG4gICAgICB0aGlzLmVsID0gZWw7XG5cbiAgICAgIHRoaXMuZXZlbnQuaWQgPSB0aGlzLmlkO1xuXG4gICAgICB2YXIgZXZ0ID0gbmV3IEN1c3RvbUV2ZW50KCd0b3VjaGRvd24nLCB7IGNhbmNlbGFibGU6IHRydWUsIGJ1YmJsZXM6IGZhbHNlLCBkZXRhaWwgOiBwb2ludH0pO1xuICAgICAgXG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KGV2dCk7XG5cbiAgICB9XG5cbiAgfSk7XG4gXG4gIGZpbmdlci5vbignbW92ZScsIGZ1bmN0aW9uKHBvaW50KXtcblxuICAgIGlmKHRoaXMuaXMpe1xuICAgXG4gICAgICBpZighcG9pbnQub2Zmc2V0WCl7XG4gICAgICAgIHBvaW50Lm9mZnNldFggPSBwb2ludC54IC0gcG9pbnQuZS50YXJnZXQub2Zmc2V0TGVmdFxuICAgICAgICBwb2ludC5vZmZzZXRZID0gcG9pbnQueSAtIHBvaW50LmUudGFyZ2V0Lm9mZnNldFRvcFxuICAgICAgfVxuXG4gICAgICBtZXJnZShwb2ludCwgcG9pbnQuZSlcbiAgICAgIC8qXG4gICAgICAgIGlmKCFwb2ludC5vZmZzZXRYKXtcbiAgICAgICAgcG9pbnQub2Zmc2V0WCA9IHBvaW50LnggLSBwb2ludC5lWzBdLnRhcmdldC5vZmZzZXRMZWZ0XG4gICAgICAgIHBvaW50Lm9mZnNldFkgPSBwb2ludC55IC0gcG9pbnQuZVswXS50YXJnZXQub2Zmc2V0VG9wXG4gICAgICB9XG4gICAgICAqL1xuXHRcbiAgICAgIHZhciBldnQgPSBuZXcgQ3VzdG9tRXZlbnQoJ2RlbHRhdmVjdG9yJywgeyBjYW5jZWxhYmxlOiB0cnVlLCBidWJibGVzOiBmYWxzZSwgZGV0YWlsIDogcG9pbnR9KTtcblxuXHRcdFx0ZXZ0LmRldGFpbC5kZWx0YSA9IFtwb2ludC54IC0gbGFzdFBvaW50WzBdLCBwb2ludC55IC0gbGFzdFBvaW50WzFdXTtcblxuICAgICAgZXZ0LmRldGFpbC5hbmdsZSA9IE1hdGguYXRhbjIoZXZ0LmRldGFpbC5kZWx0YVswXSwgZXZ0LmRldGFpbC5kZWx0YVsxXSlcblxuXHRcdFx0ZXZ0LmRldGFpbC52ZWN0b3IgPSBbcG9pbnQueCwgcG9pbnQueV07XG5cblx0XHRcdGV2dC5kZXRhaWwuYWxsUG9pbnRzID0gYWxsUG9pbnRzO1xuICAgICAgXG4gICAgICBldnQuZGV0YWlsLmxhc3RPZmZzZXRQb2ludCA9IGxhc3RPZmZzZXRQb2ludC5zbGljZSgwKVxuXG5cdFx0XHRldnQuZGV0YWlsLmxhc3RQb2ludCA9IGxhc3RQb2ludC5zcGxpY2UoMClcbiAgICAgIFxuICAgICAgZXZ0LmRldGFpbC5hbGxPZmZzZXRQb2ludHMgPSBhbGxPZmZzZXRQb2ludHNcblxuICAgICAgbGFzdFBvaW50WzBdID0gcG9pbnQueFxuICAgICAgbGFzdFBvaW50WzFdID0gcG9pbnQueVxuICAgICAgbGFzdFBvaW50WzJdID0gcG9pbnQudGltZVxuXHRcdCAgXG4gICAgICBsYXN0T2Zmc2V0UG9pbnRbMF0gPSBwb2ludC5vZmZzZXRYXG4gICAgICBsYXN0T2Zmc2V0UG9pbnRbMV0gPSBwb2ludC5vZmZzZXRZXG5cblx0XHQgIGFsbFBvaW50cy5wdXNoKGxhc3RQb2ludC5zbGljZSgwKSlcbiAgICAgIGFsbE9mZnNldFBvaW50cy5wdXNoKGxhc3RPZmZzZXRQb2ludC5zbGljZSgwKSlcblx0XHRcbiAgICAgIHRoaXMuZWwuZGlzcGF0Y2hFdmVudChldnQpO1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIGZpbmdlci5vbignZW5kJywgZnVuY3Rpb24ocG9pbnQpe1xuIFxuICAgIGlmKHRoaXMuaXMpe1xuXG4gICAgICBcbiAgICAgIGlmKCFwb2ludC5vZmZzZXRYKXtcbiAgICAgICAgcG9pbnQub2Zmc2V0WCA9IHBvaW50LnggLSBwb2ludC5lLnRhcmdldC5vZmZzZXRMZWZ0XG4gICAgICAgIHBvaW50Lm9mZnNldFkgPSBwb2ludC55IC0gcG9pbnQuZS50YXJnZXQub2Zmc2V0VG9wXG4gICAgICB9XG4gICAgICBtZXJnZShwb2ludCwgcG9pbnQuZSlcbi8qXG4gICAgICBpZighcG9pbnQub2Zmc2V0WCl7XG4gICAgICAgIHBvaW50Lm9mZnNldFggPSBwb2ludC54IC0gcG9pbnQuZVswXS50YXJnZXQub2Zmc2V0TGVmdFxuICAgICAgICBwb2ludC5vZmZzZXRZID0gcG9pbnQueSAtIHBvaW50LmVbMF0udGFyZ2V0Lm9mZnNldFRvcFxuICAgICAgfVxuKi9cbiAgICAgIHZhciBldnQgPSBuZXcgQ3VzdG9tRXZlbnQoJ2xpZnRvZmYnLCB7IGNhbmNlbGFibGU6IHRydWUsIGJ1YmJsZXM6IGZhbHNlLCBkZXRhaWwgOiBwb2ludH0pO1xuXG5cdFx0XHRldnQuZGV0YWlsLmRlbHRhID0gW3BvaW50LnggLSBsYXN0UG9pbnRbMF0sIHBvaW50LnkgLSBsYXN0UG9pbnRbMV1dO1xuXG4gICAgICBldnQuZGV0YWlsLmFuZ2xlID0gTWF0aC5hdGFuMihldnQuZGV0YWlsLmRlbHRhWzBdLCBldnQuZGV0YWlsLmRlbHRhWzFdKVxuXG4gICAgICBldnQuZGV0YWlsLnZlY3RvciA9IFtwb2ludC54LCBwb2ludC55XTtcblxuXHRcdFx0ZXZ0LmRldGFpbC5hbGxQb2ludHMgPSBhbGxQb2ludHM7XG5cdFx0XG5cdFx0XHRldnQuZGV0YWlsLmxhc3RQb2ludCA9IGxhc3RQb2ludC5zcGxpY2UoMClcblx0XHRcbiAgICAgIGV2dC5kZXRhaWwuYWxsT2Zmc2V0UG9pbnRzID0gYWxsT2Zmc2V0UG9pbnRzXG5cbiAgICAgIGV2dC5kZXRhaWwubGFzdE9mZnNldFBvaW50ID0gbGFzdE9mZnNldFBvaW50LnNsaWNlKDApXG5cbiAgICAgIGxhc3RQb2ludFswXSA9IHBvaW50LnhcbiAgICAgIGxhc3RQb2ludFsxXSA9IHBvaW50LnlcbiAgICAgIGxhc3RQb2ludFsyXSA9IHBvaW50LnRpbWVcblx0XHQgIFxuICAgICAgbGFzdE9mZnNldFBvaW50WzBdID0gcG9pbnQub2Zmc2V0WFxuICAgICAgbGFzdE9mZnNldFBvaW50WzFdID0gcG9pbnQub2Zmc2V0WVxuXG5cdFx0ICBhbGxQb2ludHMucHVzaChsYXN0UG9pbnQuc2xpY2UoMCkpXG4gICAgICBhbGxPZmZzZXRQb2ludHMucHVzaChsYXN0T2Zmc2V0UG9pbnQuc2xpY2UoMCkpXG5cdFx0XG4gICAgICB0aGlzLmVsLmRpc3BhdGNoRXZlbnQoZXZ0KTtcblxuICAgIH1cblxuICB9KTtcblxufTtcblxuZnVuY3Rpb24gc2VhcmNoKGVsKXtcblxuICByZXR1cm4gc2NhbihlbClcblxuICBmdW5jdGlvbiBzY2FuKGVsKXtcblxuICAgIGlmKCFlbCkgcmV0dXJuIGZhbHNlO1xuICBcbiAgICB2YXIgeCA9IHdpbmRvdy5fdG91Y2guZWxlbWVudHMucmVkdWNlKGZ1bmN0aW9uKHZhbCwgaSl7XHRcblxuICAgICAgaWYoaS50b3VjaF9pZCA9PSBlbC50b3VjaF9pZCAmJiBpLnRvdWNoKXtcblxuICAgICAgICB2YWwgPSBpXG5cbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB2YWxcblxuICAgIH0sIGZhbHNlKVxuXG4gICAgcmV0dXJuIHggfHwgc2NhbihlbC5wYXJlbnRFbGVtZW50KVxuXG4gIH1cblxufTtcblxuXG50b3VjaC5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbihlbCl7XG5cbiAgZWwudG91Y2ggPSAwXG5cbiAgcmV0dXJuIGVsXG5cbn07XG5cbnRvdWNoLnByb3RvdHlwZS5yZXN1bWUgPSBmdW5jdGlvbihlbCl7XG5cbiAgZWwudG91Y2ggPSAxXG5cblx0cmV0dXJuIGVsXG5cbn07XG5cbnRvdWNoLnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbihlbCl7XG5cbiAgZGVsZXRlIGVsLnRvdWNoXG5cbiAgZGVsZXRlIGVsLnRvdWNoX2lkXG5cblx0cmV0dXJuIGVsXG5cbn07XG5cbnRvdWNoLnByb3RvdHlwZS5oYW5kbGVNb3VzZSA9IGZ1bmN0aW9uKHgpe1xuXG4gIGlmKE1vZGVybml6cikgTW9kZXJuaXpyLnRvdWNoID0gdHJ1ZTtcblxuICB0aGlzLnRvdWNoeS5oYW5kbGVNb3VzZSh4KTtcblxufTtcblxuXG4iLCIvKiBNb2Rlcm5penIgMi42LjIgKEN1c3RvbSBCdWlsZCkgfCBNSVQgJiBCU0RcbiAqIEJ1aWxkOiBodHRwOi8vbW9kZXJuaXpyLmNvbS9kb3dubG9hZC8jLXRvdWNoLXRlc3RzdHlsZXMtcHJlZml4ZXNcbiAqL1xudmFyIE1vZGVybml6cj1mdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gdihhKXtpLmNzc1RleHQ9YX1mdW5jdGlvbiB3KGEsYil7cmV0dXJuIHYobC5qb2luKGErXCI7XCIpKyhifHxcIlwiKSl9ZnVuY3Rpb24geChhLGIpe3JldHVybiB0eXBlb2YgYT09PWJ9ZnVuY3Rpb24geShhLGIpe3JldHVybiEhfihcIlwiK2EpLmluZGV4T2YoYil9ZnVuY3Rpb24geihhLGIsZCl7Zm9yKHZhciBlIGluIGEpe3ZhciBmPWJbYVtlXV07aWYoZiE9PWMpcmV0dXJuIGQ9PT0hMT9hW2VdOngoZixcImZ1bmN0aW9uXCIpP2YuYmluZChkfHxiKTpmfXJldHVybiExfXZhciBkPVwiMi42LjJcIixlPXt9LGY9Yi5kb2N1bWVudEVsZW1lbnQsZz1cIm1vZGVybml6clwiLGg9Yi5jcmVhdGVFbGVtZW50KGcpLGk9aC5zdHlsZSxqLGs9e30udG9TdHJpbmcsbD1cIiAtd2Via2l0LSAtbW96LSAtby0gLW1zLSBcIi5zcGxpdChcIiBcIiksbT17fSxuPXt9LG89e30scD1bXSxxPXAuc2xpY2UscixzPWZ1bmN0aW9uKGEsYyxkLGUpe3ZhciBoLGksaixrLGw9Yi5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLG09Yi5ib2R5LG49bXx8Yi5jcmVhdGVFbGVtZW50KFwiYm9keVwiKTtpZihwYXJzZUludChkLDEwKSl3aGlsZShkLS0paj1iLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksai5pZD1lP2VbZF06ZysoZCsxKSxsLmFwcGVuZENoaWxkKGopO3JldHVybiBoPVtcIiYjMTczO1wiLCc8c3R5bGUgaWQ9XCJzJyxnLCdcIj4nLGEsXCI8L3N0eWxlPlwiXS5qb2luKFwiXCIpLGwuaWQ9ZywobT9sOm4pLmlubmVySFRNTCs9aCxuLmFwcGVuZENoaWxkKGwpLG18fChuLnN0eWxlLmJhY2tncm91bmQ9XCJcIixuLnN0eWxlLm92ZXJmbG93PVwiaGlkZGVuXCIsaz1mLnN0eWxlLm92ZXJmbG93LGYuc3R5bGUub3ZlcmZsb3c9XCJoaWRkZW5cIixmLmFwcGVuZENoaWxkKG4pKSxpPWMobCxhKSxtP2wucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChsKToobi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG4pLGYuc3R5bGUub3ZlcmZsb3c9ayksISFpfSx0PXt9Lmhhc093blByb3BlcnR5LHU7IXgodCxcInVuZGVmaW5lZFwiKSYmIXgodC5jYWxsLFwidW5kZWZpbmVkXCIpP3U9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gdC5jYWxsKGEsYil9OnU9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYiBpbiBhJiZ4KGEuY29uc3RydWN0b3IucHJvdG90eXBlW2JdLFwidW5kZWZpbmVkXCIpfSxGdW5jdGlvbi5wcm90b3R5cGUuYmluZHx8KEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGIpe3ZhciBjPXRoaXM7aWYodHlwZW9mIGMhPVwiZnVuY3Rpb25cIil0aHJvdyBuZXcgVHlwZUVycm9yO3ZhciBkPXEuY2FsbChhcmd1bWVudHMsMSksZT1mdW5jdGlvbigpe2lmKHRoaXMgaW5zdGFuY2VvZiBlKXt2YXIgYT1mdW5jdGlvbigpe307YS5wcm90b3R5cGU9Yy5wcm90b3R5cGU7dmFyIGY9bmV3IGEsZz1jLmFwcGx5KGYsZC5jb25jYXQocS5jYWxsKGFyZ3VtZW50cykpKTtyZXR1cm4gT2JqZWN0KGcpPT09Zz9nOmZ9cmV0dXJuIGMuYXBwbHkoYixkLmNvbmNhdChxLmNhbGwoYXJndW1lbnRzKSkpfTtyZXR1cm4gZX0pLG0udG91Y2g9ZnVuY3Rpb24oKXt2YXIgYztyZXR1cm5cIm9udG91Y2hzdGFydFwiaW4gYXx8YS5Eb2N1bWVudFRvdWNoJiZiIGluc3RhbmNlb2YgRG9jdW1lbnRUb3VjaD9jPSEwOnMoW1wiQG1lZGlhIChcIixsLmpvaW4oXCJ0b3VjaC1lbmFibGVkKSwoXCIpLGcsXCIpXCIsXCJ7I21vZGVybml6cnt0b3A6OXB4O3Bvc2l0aW9uOmFic29sdXRlfX1cIl0uam9pbihcIlwiKSxmdW5jdGlvbihhKXtjPWEub2Zmc2V0VG9wPT09OX0pLGN9O2Zvcih2YXIgQSBpbiBtKXUobSxBKSYmKHI9QS50b0xvd2VyQ2FzZSgpLGVbcl09bVtBXSgpLHAucHVzaCgoZVtyXT9cIlwiOlwibm8tXCIpK3IpKTtyZXR1cm4gZS5hZGRUZXN0PWZ1bmN0aW9uKGEsYil7aWYodHlwZW9mIGE9PVwib2JqZWN0XCIpZm9yKHZhciBkIGluIGEpdShhLGQpJiZlLmFkZFRlc3QoZCxhW2RdKTtlbHNle2E9YS50b0xvd2VyQ2FzZSgpO2lmKGVbYV0hPT1jKXJldHVybiBlO2I9dHlwZW9mIGI9PVwiZnVuY3Rpb25cIj9iKCk6Yix0eXBlb2YgZW5hYmxlQ2xhc3NlcyE9XCJ1bmRlZmluZWRcIiYmZW5hYmxlQ2xhc3NlcyYmKGYuY2xhc3NOYW1lKz1cIiBcIisoYj9cIlwiOlwibm8tXCIpK2EpLGVbYV09Yn1yZXR1cm4gZX0sdihcIlwiKSxoPWo9bnVsbCxlLl92ZXJzaW9uPWQsZS5fcHJlZml4ZXM9bCxlLnRlc3RTdHlsZXM9cyxlfSh3aW5kb3csd2luZG93LmRvY3VtZW50KTtcblxuLypcblx0VG91Y2h5LmpzXG5cdFNvY2tldC1zdHlsZSBmaW5nZXIgbWFuYWdlbWVudCBmb3IgdG91Y2ggZXZlbnRzXG5cblx0SmFpcmFqIFNldGhpXG5cdGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9cbiovXG5cblxuXG4vKiBNYWtlIHN1cmUgSSBjYW4gaXRlcmVhdGUgdGhyb3VnaCBhcnJheXMgKi9cbnZhciBmb3JFYWNoID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChBcnJheS5wcm90b3R5cGUuZm9yRWFjaCkge1xuXHRyZXR1cm4gZnVuY3Rpb24gKGFyciwgY2FsbGJhY2ssIHNlbGYpIHtcblx0ICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoYXJyLCBjYWxsYmFjaywgc2VsZik7XG5cdH07XG4gICAgfVxuXG4gICAgZWxzZSB7XG5cdHJldHVybiBmdW5jdGlvbiAoYXJyLCBjYWxsYmFjaywgc2VsZikge1xuXHQgICAgZm9yICh2YXIgaT0wLCBsZW49YXJyLmxlbmd0aDsgaTxsZW47IGkrKykge1xuXHRcdGlmIChpIGluIGFycikge1xuXHRcdCAgICBjYWxsYmFjay5jYWxsKHNlbGYsIGFycltpXSwgaSwgYXJyKTtcblx0XHR9XG5cdCAgICB9XG5cdH07XG4gICAgfVxufSgpO1xuXG4vKiBNYWtlIHN1cmUgSSBjYW4gc2VhcmNoIHRocm91Z2ggYXJyYXlzICovXG52YXIgaW5kZXhPZiA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChhcnIsIGl0ZW0sIHN0YXJ0SW5kZXgpIHtcblx0ICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGFyciwgaXRlbSwgc3RhcnRJbmRleCk7XG5cdH07XG4gICAgfVxuXG4gICAgZWxzZSB7XG5cdHJldHVybiBmdW5jdGlvbiAoYXJyLCBpdGVtLCBzdGFydEluZGV4KSB7XG5cdCAgICBmb3IgKHZhciBpPXN0YXJ0SW5kZXggfHwgMCwgbGVuPWFyci5sZW5ndGg7IGk8bGVuOyBpKyspIHtcblx0XHRpZiAoKGkgaW4gYXJyKSAmJiAoYXJyW2ldID09PSBpdGVtKSkge1xuXHRcdCAgICByZXR1cm4gaTtcblx0XHR9XG5cdCAgICB9XG5cblx0ICAgIHJldHVybiAtMTtcblx0fTtcbiAgICB9XG59KCk7XG5cbi8qIE1ha2Ugc3VyZSBJIGNhbiBtYXAgYXJyYXlzICovXG52YXIgbWFwID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChBcnJheS5wcm90b3R5cGUubWFwKSB7XG5cdHJldHVybiBmdW5jdGlvbiAoYXJyLCBjYWxsYmFjaywgc2VsZikge1xuXHQgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChhcnIsIGNhbGxiYWNrLCBzZWxmKTtcblx0fTtcbiAgICB9XG5cbiAgICBlbHNlIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChhcnIsIGNhbGxiYWNrLCBzZWxmKSB7XG5cdCAgICB2YXIgbGVuID0gYXJyLmxlbmd0aCxcblx0ICAgIG1hcEFyciA9IG5ldyBBcnJheShsZW4pO1xuXG5cdCAgICBmb3IgKHZhciBpPTA7IGk8bGVuOyBpKyspIHtcblx0XHRpZiAoaSBpbiBhcnIpIHtcblx0XHQgICAgbWFwQXJyW2ldID0gY2FsbGJhY2suY2FsbChzZWxmLCBhcnJbaV0sIGksIGFycik7XG5cdFx0fVxuXHQgICAgfVxuXG5cdCAgICByZXR1cm4gbWFwQXJyO1xuXHR9O1xuICAgIH1cbn0oKTtcblxuLyogTWFrZSBzdXJlIEkgY2FuIGZpbHRlciBhcnJheXMgKi9cbnZhciBmaWx0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKEFycmF5LnByb3RvdHlwZS5maWx0ZXIpIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChhcnIsIGZ1bmMsIHNlbGYpIHtcblx0ICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuZmlsdGVyLmNhbGwoYXJyLCBmdW5jLCBzZWxmKTtcblx0fTtcbiAgICB9XG5cbiAgICBlbHNlIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChhcnIsIGZ1bmMsIHNlbGYpIHtcblx0ICAgIHZhciBmaWx0ZXJBcnIgPSBbXTtcblxuXHQgICAgZm9yICh2YXIgdmFsLCBpPTAsIGxlbj1hcnIubGVuZ3RoOyBpPGxlbjsgaSsrKSB7XG5cdFx0dmFsID0gYXJyW2ldO1xuXG5cdFx0aWYgKChpIGluIGFycikgJiYgZnVuYy5jYWxsKHNlbGYsIHZhbCwgaSwgYXJyKSkge1xuXHRcdCAgICBmaWx0ZXJBcnIucHVzaCh2YWwpO1xuXHRcdH1cblx0ICAgIH1cblxuXHQgICAgcmV0dXJuIGZpbHRlckFycjtcblx0fTtcbiAgICB9XG59KCk7XG5cbi8qIEJpbmQgZXZlbnQgbGlzdGVuZXIgdG8gZWxlbWVudCAqL1xudmFyIGJvdW5kRXZlbnRzID0ge307XG5cbmZ1bmN0aW9uIGJpbmQgKGVsZW0sIGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICBpZiAoZWxlbS5hZGRFdmVudExpc3RlbmVyKSB7XG5cdGVsZW0uYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgZWxzZSBpZiAoZWxlbS5hdHRhY2hFdmVudCkge1xuXHR2YXIgZUlEID0gZWxlbS5hdHRhY2hFdmVudCgnb24nK2V2ZW50TmFtZSwgY2FsbGJhY2spO1xuXHRib3VuZEV2ZW50c1tlSURdID0geyBuYW1lOiBldmVudE5hbWUsIGNhbGxiYWNrOiBjYWxsYmFjayB9O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdW5iaW5kIChlbGVtLCBldmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgaWYgKGVsZW0ucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuXHRlbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgIH1cblxuICAgIGVsc2UgaWYgKGVsZW0uZGV0YWNoRXZlbnQpIHtcblx0Zm9yICh2YXIgZUlEIGluIGJvdW5kRXZlbnRzKSB7XG5cdCAgICBpZiAoKGJvdW5kRXZlbnRzW2VJRF0ubmFtZSA9PT0gZXZlbnROYW1lKSAmJlxuXHRcdChib3VuZEV2ZW50c1tlSURdLmNhbGxiYWNrID09PSBjYWxsYmFjaykpIHtcblx0XHRlbGVtLmRldGFjaEV2ZW50KGVJRCk7XG5cdFx0ZGVsZXRlIGJvdW5kRXZlbnRzW2VJRF07XG5cdCAgICB9XG5cdH1cbiAgICB9XG59XG5cbi8qIFNpbXBsZSBpbmhlcml0YW5jZSAqL1xuZnVuY3Rpb24gaW5oZXJpdHNGcm9tIChmdW5jLCBwYXJlbnQpIHtcbiAgICB2YXIgcHJvdG8gPSBmdW5jLnByb3RvdHlwZSxcbiAgICBzdXBlclByb3RvID0gcGFyZW50LnByb3RvdHlwZSxcbiAgICBvbGRTdXBlcjtcblxuICAgIGZvciAodmFyIHByb3AgaW4gc3VwZXJQcm90bykge1xuXHRwcm90b1twcm9wXSA9IHN1cGVyUHJvdG9bcHJvcF07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3VwZXJNZXRob2QgKG5hbWUpIHtcblx0dmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG5cdGlmICggc3VwZXJQcm90b1tuYW1lXSApIHtcblx0ICAgIHJldHVybiBzdXBlclByb3RvW25hbWVdLmFwcGx5KHRoaXMsIGFyZ3MpO1xuXHR9XG4gICAgfVxuXG4gICAgaWYgKHByb3RvLl9zdXBlcikge1xuXHRvbGRTdXBlciA9IHByb3RvLl9zdXBlcjtcblxuXHRwcm90by5fc3VwZXIgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICBvbGRTdXBlci5jYWxsKHRoaXMsIGFyZ3VtZW50cyk7XG5cdCAgICBzdXBlck1ldGhvZC5jYWxsKHRoaXMsIGFyZ3VtZW50cyk7XG5cdH07XG4gICAgfVxuXG4gICAgZWxzZSB7XG5cdHByb3RvLl9zdXBlciA9IHN1cGVyTWV0aG9kO1xuICAgIH1cbn1cblxuXG5cbi8qIEV2ZW50IGJ1cyB0byBoYW5kbGUgZmluZ2VyIGV2ZW50IGxpc3RlbmVycyAqL1xuZnVuY3Rpb24gRXZlbnRCdXMgKCkge1xuICAgIHRoaXMub25FdmVudHMgPSB7fTtcbiAgICB0aGlzLm9uY2VFdmVudHMgPSB7fTtcbn1cblxuLyogQXR0YWNoIGEgaGFuZGxlciB0byBsaXN0ZW4gZm9yIGFuIGV2ZW50ICovXG5FdmVudEJ1cy5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2spIHtcbiAgICBpZiAoICFjYWxsYmFjayApIHtcblx0cmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChuYW1lIGluIHRoaXMub25FdmVudHMpIHtcblx0dmFyIGluZGV4ID0gaW5kZXhPZih0aGlzLm9uRXZlbnRzW25hbWVdLCBjYWxsYmFjayk7XG5cblx0aWYgKGluZGV4ICE9IC0xKSB7XG5cdCAgICByZXR1cm47XG5cdH1cbiAgICB9XG5cbiAgICBlbHNlIHtcblx0dGhpcy5vbkV2ZW50c1tuYW1lXSA9IFtdO1xuICAgIH1cblxuICAgIGlmIChuYW1lIGluIHRoaXMub25jZUV2ZW50cykge1xuXHR2YXIgaW5kZXggPSBpbmRleE9mKHRoaXMub25jZUV2ZW50c1tuYW1lXSwgY2FsbGJhY2spO1xuXG5cdGlmIChpbmRleCAhPSAtMSkge1xuXHQgICAgdGhpcy5vbmNlRXZlbnRzLnNwbGljZShpbmRleCwgMSk7XG5cdH1cbiAgICB9XG5cbiAgICB0aGlzLm9uRXZlbnRzW25hbWVdLnB1c2goY2FsbGJhY2spO1xufTtcblxuLyogQXR0YWNoIGEgb25lLXRpbWUtdXNlIGhhbmRsZXIgdG8gbGlzdGVuIGZvciBhbiBldmVudCAqL1xuRXZlbnRCdXMucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2spIHtcbiAgICBpZiAoICFjYWxsYmFjayApIHtcblx0cmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChuYW1lIGluIHRoaXMub25jZUV2ZW50cykge1xuXHR2YXIgaW5kZXggPSBpbmRleE9mKHRoaXMub25jZUV2ZW50c1tuYW1lXSwgY2FsbGJhY2spO1xuXG5cdGlmIChpbmRleCAhPSAtMSkge1xuXHQgICAgcmV0dXJuO1xuXHR9XG4gICAgfVxuXG4gICAgZWxzZSB7XG5cdHRoaXMub25jZUV2ZW50c1tuYW1lXSA9IFtdO1xuICAgIH1cblxuICAgIGlmIChuYW1lIGluIHRoaXMub25FdmVudHMpIHtcblx0dmFyIGluZGV4ID0gaW5kZXhPZih0aGlzLm9uRXZlbnRzW25hbWVdLCBjYWxsYmFjayk7XG5cblx0aWYgKGluZGV4ICE9IC0xKSB7XG5cdCAgICB0aGlzLm9uRXZlbnRzLnNwbGljZShpbmRleCwgMSk7XG5cdH1cbiAgICB9XG5cbiAgICB0aGlzLm9uY2VFdmVudHNbbmFtZV0ucHVzaChjYWxsYmFjayk7XG59O1xuXG4vKiBEZXRhY2ggYSBoYW5kbGVyIGZyb20gbGlzdGVuaW5nIGZvciBhbiBldmVudCAqL1xuRXZlbnRCdXMucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uIChuYW1lLCBjYWxsYmFjaykge1xuICAgIGlmICggIWNhbGxiYWNrICkge1xuXHRyZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5hbWUgaW4gdGhpcy5vbkV2ZW50cykge1xuXHR2YXIgaW5kZXggPSBpbmRleE9mKHRoaXMub25FdmVudHNbbmFtZV0sIGNhbGxiYWNrKTtcblxuXHRpZiAoaW5kZXggIT0gLTEpIHtcblx0ICAgIHRoaXMub25FdmVudHMuc3BsaWNlKGluZGV4LCAxKTtcblx0ICAgIHJldHVybjtcblx0fVxuICAgIH1cblxuICAgIGlmIChuYW1lIGluIHRoaXMub25jZUV2ZW50cykge1xuXHR2YXIgaW5kZXggPSBpbmRleE9mKHRoaXMub25jZUV2ZW50c1tuYW1lXSwgY2FsbGJhY2spO1xuXG5cdGlmIChpbmRleCAhPSAtMSkge1xuXHQgICAgdGhpcy5vbmNlRXZlbnRzLnNwbGljZShpbmRleCwgMSk7XG5cdCAgICByZXR1cm47XG5cdH1cbiAgICB9XG59O1xuXG4vKiBGaXJlIGFuIGV2ZW50LCB0cmlnZ2VyaW5nIGFsbCBoYW5kbGVycyAqL1xuRXZlbnRCdXMucHJvdG90eXBlLnRyaWdnZXIgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICBjYWxsYmFja3MgPSAodGhpcy5vbkV2ZW50c1tuYW1lXSB8fCBbXSkuY29uY2F0KHRoaXMub25jZUV2ZW50c1tuYW1lXSB8fCBbXSksXG4gICAgY2FsbGJhY2s7XG5cbiAgICB3aGlsZSAoY2FsbGJhY2sgPSBjYWxsYmFja3Muc2hpZnQoKSkge1xuXHRjYWxsYmFjay5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG59O1xuXG5cblxuLyogT2JqZWN0IHRvIG1hbmFnZSBhIHNpbmdsZS1maW5nZXIgaW50ZXJhY3Rpb25zICovXG5mdW5jdGlvbiBGaW5nZXIgKGlkLCBlKSB7XG4gICAgdGhpcy5fc3VwZXIoJ2NvbnN0cnVjdG9yJyk7XG4gICAgdGhpcy5pZCAgICAgICAgPSBpZDtcbiAgICB0aGlzLmxhc3RQb2ludCA9IG51bGw7XG4gICAgdGhpcy5ldmVudCA9IGU7XG59XG5pbmhlcml0c0Zyb20oRmluZ2VyLCBFdmVudEJ1cyk7XG5cblxuXG4vKiBPYmplY3QgdG8gbWFuYWdlIG11bHRpcGxlLWZpbmdlciBpbnRlcmFjdGlvbnMgKi9cbmZ1bmN0aW9uIEhhbmQgKGlkcykge1xuICAgIHRoaXMuX3N1cGVyKCdjb25zdHJ1Y3RvcicpO1xuXG4gICAgdGhpcy5maW5nZXJzID0gIWlkcyA/IFtdIDogbWFwKGlkcywgZnVuY3Rpb24gKGlkKSB7XG5cdHJldHVybiBuZXcgRmluZ2VyKGlkKTtcbiAgICB9KTtcbn1cbmluaGVyaXRzRnJvbShIYW5kLCBFdmVudEJ1cyk7XG5cbi8qIEdldCBmaW5nZXIgYnkgaWQgKi9cbkhhbmQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChpZCkge1xuICAgIHZhciBmb3VuZEZpbmdlcjtcblxuICAgIGZvckVhY2godGhpcy5maW5nZXJzLCBmdW5jdGlvbiAoZmluZ2VyKSB7XG5cdGlmIChmaW5nZXIuaWQgPT0gaWQpIHtcblx0ICAgIGZvdW5kRmluZ2VyID0gZmluZ2VyO1xuXHR9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZm91bmRGaW5nZXI7XG59O1xuXG5cblxuLyogQ29udmVydCBET00gdG91Y2ggZXZlbnQgb2JqZWN0IHRvIHNpbXBsZSBkaWN0aW9uYXJ5IHN0eWxlIG9iamVjdCAqL1xuZnVuY3Rpb24gZG9tVG91Y2hUb09iaiAodG91Y2hlcywgdGltZSwgZSkge1xuICAgIHJldHVybiBtYXAodG91Y2hlcywgZnVuY3Rpb24gKHRvdWNoKSB7XG5cdHJldHVybiB7XG5cdCAgICBlOiB0b3VjaGVzLFxuXHQgICAgaWQ6IHRvdWNoLmlkZW50aWZpZXIsXG5cdCAgICB4OiB0b3VjaC5wYWdlWCxcblx0ICAgIHk6IHRvdWNoLnBhZ2VZLFxuXHQgICAgdGltZTogdGltZVxuXHR9O1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBkb21Nb3VzZVRvT2JqIChtb3VzZUV2ZW50LCBtb3VzZUlEKSB7XG4gICAgcmV0dXJuIFt7XG5cdGU6IG1vdXNlRXZlbnQsXG5cdGlkOiBtb3VzZUlELFxuXHR4OiBtb3VzZUV2ZW50LnBhZ2VYLFxuXHR5OiBtb3VzZUV2ZW50LnBhZ2VZLFxuXHR0aW1lOiBtb3VzZUV2ZW50LnRpbWVTdGFtcFxuICAgIH1dO1xufVxuXG5cblxuLyogQ29udHJvbGxlciBvYmplY3QgdG8gaGFuZGxlIFRvdWNoeSBpbnRlcmFjdGlvbnMgb24gYW4gZWxlbWVudCAqL1xuZnVuY3Rpb24gVG91Y2hDb250cm9sbGVyIChlbGVtLCBoYW5kbGVNb3VzZSwgc2V0dGluZ3MpIHtcbiAgICBpZiAodHlwZW9mIHNldHRpbmdzID09ICd1bmRlZmluZWQnKSB7XG5cdHNldHRpbmdzID0gaGFuZGxlTW91c2U7XG5cdGhhbmRsZU1vdXNlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzZXR0aW5ncyA9PSAnZnVuY3Rpb24nKSB7XG5cdHNldHRpbmdzID0geyBhbnk6IHNldHRpbmdzIH07XG4gICAgfVxuXG4gICAgZm9yICh2YXIgbmFtZSBpbiBwbHVnaW5zKSB7XG5cdGlmIChuYW1lIGluIHNldHRpbmdzKSB7XG5cdCAgICB2YXIgdXBkYXRlcyA9IHBsdWdpbnNbbmFtZV0oZWxlbSwgc2V0dGluZ3NbbmFtZV0pO1xuXG5cdCAgICBpZiAodHlwZW9mIHVwZGF0ZXMgPT0gJ2Z1bmN0aW9uJykge1xuXHRcdHVwZGF0ZXMgPSB7IGFueTogdXBkYXRlcyB9O1xuXHQgICAgfVxuXG5cdCAgICBmb3IgKHZhciBoYW5kbGVyVHlwZSBpbiB1cGRhdGVzKSB7XG5cdFx0aWYgKGhhbmRsZXJUeXBlIGluIHNldHRpbmdzKSB7XG5cdFx0ICAgIHNldHRpbmdzW2hhbmRsZXJUeXBlXSA9IChmdW5jdGlvbiAoaGFuZGxlcjEsIGhhbmRsZXIyKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdFx0ICAgIGhhbmRsZXIxLmNhbGwodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdCAgICBoYW5kbGVyMi5jYWxsKHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHR9O1xuXHRcdCAgICB9KShzZXR0aW5nc1toYW5kbGVyVHlwZV0sIHVwZGF0ZXNbaGFuZGxlclR5cGVdKTtcblx0XHR9XG5cblx0XHRlbHNlIHtcblx0XHQgICAgc2V0dGluZ3NbaGFuZGxlclR5cGVdID0gdXBkYXRlc1toYW5kbGVyVHlwZV07XG5cdFx0fVxuXHQgICAgfVxuXHR9XG4gICAgfVxuXG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgdGhpcy5lbGVtID0gZWxlbTtcbiAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3MgfHwge307XG4gICAgdGhpcy5tYWluSGFuZCA9IG5ldyBIYW5kKCk7XG4gICAgdGhpcy5tdWx0aUhhbmQgPSBudWxsO1xuICAgIHRoaXMubW91c2VJRCA9IG51bGw7XG5cbiAgICB0aGlzLnN0YXJ0KCk7XG59O1xuXG4vKiBTdGFydCB3YXRjaGluZyBlbGVtZW50IGZvciB0b3VjaCBldmVudHMgKi9cblRvdWNoQ29udHJvbGxlci5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICBpZiAodGhpcy5ydW5uaW5nKSB7XG4gICAgXHRyZXR1cm47XG4gICAgfVxuICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgaWYoTW9kZXJuaXpyLnRvdWNoKXtcblx0YmluZCh0aGlzLmVsZW0sICd0b3VjaHN0YXJ0JywgdGhpcy50b3VjaHN0YXJ0KCkgKTtcblx0YmluZCh0aGlzLmVsZW0sICd0b3VjaG1vdmUnICwgdGhpcy50b3VjaG1vdmUoKSAgKTtcblx0YmluZCh0aGlzLmVsZW0sICd0b3VjaGVuZCcgICwgdGhpcy50b3VjaGVuZCgpICAgKTtcdFxuXHRiaW5kKHdpbmRvdywgJ3RvdWNobW92ZScsIGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKX0pO1xuICAgIH1cbiAgICBlbHNle1xuXHRiaW5kKHRoaXMuZWxlbSwgJ21vdXNlZG93bicgLCB0aGlzLm1vdXNlZG93bigpICk7XG5cdGJpbmQodGhpcy5lbGVtLCAnbW91c2V1cCcgICAsIHRoaXMubW91c2V1cCgpICAgKTtcblx0YmluZCh0aGlzLmVsZW0sICdtb3VzZW1vdmUnICwgdGhpcy5tb3VzZW1vdmUoKSApO1x0XG4gICAgfVxufTtcblxuVG91Y2hDb250cm9sbGVyLnByb3RvdHlwZS5oYW5kbGVNb3VzZSA9IGZ1bmN0aW9uKHgpe1xuXG4gIGlmKHgpe1xuICAgIGJpbmQodGhpcy5lbGVtLCAnbW91c2Vkb3duJyAsIHRoaXMubW91c2Vkb3duKCkgKTtcbiAgICBiaW5kKHRoaXMuZWxlbSwgJ21vdXNldXAnICAgLCB0aGlzLm1vdXNldXAoKSAgICk7XG4gICAgYmluZCh0aGlzLmVsZW0sICdtb3VzZW1vdmUnICwgdGhpcy5tb3VzZW1vdmUoKSApO1xuICB9XG5cbiAgZWxzZXtcbiAgICB1bmJpbmQodGhpcy5lbGVtLCAnbW91c2Vkb3duJyAsIHRoaXMubW91c2Vkb3duKCkgKTtcbiAgICB1bmJpbmQodGhpcy5lbGVtLCAnbW91c2V1cCcgICAsIHRoaXMubW91c2V1cCgpICAgKTtcbiAgICB1bmJpbmQodGhpcy5lbGVtLCAnbW91c2Vtb3ZlJyAsIHRoaXMubW91c2Vtb3ZlKCkgKTtcbiAgfSBcbn1cblxuLyogU3RvcCB3YXRjaGluZyBlbGVtZW50IGZvciB0b3VjaCBldmVudHMgKi9cblRvdWNoQ29udHJvbGxlci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoICF0aGlzLnJ1bm5pbmcgKSB7XG5cdHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG5cbiAgICB1bmJpbmQodGhpcy5lbGVtLCAndG91Y2hzdGFydCcsIHRoaXMudG91Y2hzdGFydCgpICk7XG4gICAgdW5iaW5kKHRoaXMuZWxlbSwgJ3RvdWNobW92ZScgLCB0aGlzLnRvdWNobW92ZSgpICApO1xuICAgIHVuYmluZCh0aGlzLmVsZW0sICd0b3VjaGVuZCcgICwgdGhpcy50b3VjaGVuZCgpICAgKTtcblxuICAgIHVuYmluZCh0aGlzLmVsZW0sICdtb3VzZWRvd24nICwgdGhpcy5tb3VzZWRvd24oKSApO1xuICAgIHVuYmluZCh0aGlzLmVsZW0sICdtb3VzZXVwJyAgICwgdGhpcy5tb3VzZXVwKCkgICApO1xuICAgIHVuYmluZCh0aGlzLmVsZW0sICdtb3VzZW1vdmUnICwgdGhpcy5tb3VzZW1vdmUoKSApO1xufTtcblxuLyogUmV0dXJuIGEgaGFuZGxlciBmb3IgRE9NIHRvdWNoc3RhcnQgZXZlbnQgKi9cblRvdWNoQ29udHJvbGxlci5wcm90b3R5cGUudG91Y2hzdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoICF0aGlzLl90b3VjaHN0YXJ0ICkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cdHRoaXMuX3RvdWNoc3RhcnQgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgY29uc29sZS5sb2coZSlcbiAgICAgIHZhciB0b3VjaGVzID0gZG9tVG91Y2hUb09iaihlLnRvdWNoZXMsIGUudGltZVN0YW1wKSxcblx0ICAgIGNoYW5nZWRUb3VjaGVzID0gZG9tVG91Y2hUb09iaihlLmNoYW5nZWRUb3VjaGVzLCBlLnRpbWVTdGFtcCwgZSk7XG5cblx0ICAgIHNlbGYubWFpbkhhbmRTdGFydChjaGFuZ2VkVG91Y2hlcyk7XG5cdCAgICBzZWxmLm11bHRpSGFuZFN0YXJ0KGNoYW5nZWRUb3VjaGVzLCB0b3VjaGVzKTtcblx0fTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fdG91Y2hzdGFydDtcbn07XG5cbi8qIFJldHVybiBhIGhhbmRsZXIgZm9yIERPTSB0b3VjaG1vdmUgZXZlbnQgKi9cblRvdWNoQ29udHJvbGxlci5wcm90b3R5cGUudG91Y2htb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICggIXRoaXMuX3RvdWNobW92ZSApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXHR0aGlzLl90b3VjaG1vdmUgPSBmdW5jdGlvbiAoZSkge1xuXHQgICAgdmFyIHRvdWNoZXMgPSBkb21Ub3VjaFRvT2JqKGUudG91Y2hlcywgZS50aW1lU3RhbXApLFxuXHQgICAgY2hhbmdlZFRvdWNoZXMgPSBkb21Ub3VjaFRvT2JqKGUuY2hhbmdlZFRvdWNoZXMsIGUudGltZVN0YW1wKTtcblxuXHQgICAgc2VsZi5tYWluSGFuZE1vdmUoY2hhbmdlZFRvdWNoZXMpO1xuXHQgICAgc2VsZi5tdWx0aUhhbmRNb3ZlKGNoYW5nZWRUb3VjaGVzLCB0b3VjaGVzKTtcblx0fTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fdG91Y2htb3ZlO1xufTtcblxuLyogUmV0dXJuIGEgaGFuZGxlciBmb3IgRE9NIHRvdWNoZW5kIGV2ZW50ICovXG5Ub3VjaENvbnRyb2xsZXIucHJvdG90eXBlLnRvdWNoZW5kID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICggIXRoaXMuX3RvdWNoZW5kICkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cdHRoaXMuX3RvdWNoZW5kID0gZnVuY3Rpb24gKGUpIHtcblx0ICAgIHZhciB0b3VjaGVzID0gZG9tVG91Y2hUb09iaihlLnRvdWNoZXMsIGUudGltZVN0YW1wKSxcblx0ICAgIGNoYW5nZWRUb3VjaGVzID0gZG9tVG91Y2hUb09iaihlLmNoYW5nZWRUb3VjaGVzLCBlLnRpbWVTdGFtcCk7XG5cblx0ICAgIHNlbGYubWFpbkhhbmRFbmQoY2hhbmdlZFRvdWNoZXMpO1xuXHQgICAgc2VsZi5tdWx0aUhhbmRFbmQoY2hhbmdlZFRvdWNoZXMsIHRvdWNoZXMpO1xuXHR9O1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl90b3VjaGVuZDtcbn07XG5cbi8qIFJldHVybiBhIGhhbmRsZXIgZm9yIERPTSBtb3VzZWRvd24gZXZlbnQgKi9cblRvdWNoQ29udHJvbGxlci5wcm90b3R5cGUubW91c2Vkb3duID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICggIXRoaXMuX21vdXNlZG93biApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXHR0aGlzLl9tb3VzZWRvd24gPSBmdW5jdGlvbiAoZSkge1xuXHQgICAgdmFyIHRvdWNoZXM7XG5cblx0ICAgIGlmICggc2VsZi5tb3VzZUlEICkge1xuXHRcdHRvdWNoZXMgPSBkb21Nb3VzZVRvT2JqKGUsIHNlbGYubW91c2VJRCk7XG5cdFx0c2VsZi5tYWluSGFuZEVuZCh0b3VjaGVzKTtcblx0XHRzZWxmLm11bHRpSGFuZEVuZCh0b3VjaGVzLCB0b3VjaGVzKTtcblx0XHRzZWxmLm1vdXNlSUQgPSBudWxsO1xuXHQgICAgfVxuXG5cdCAgICBzZWxmLm1vdXNlSUQgPSBNYXRoLnJhbmRvbSgpICsgJyc7XG5cblx0ICAgIHRvdWNoZXMgPSBkb21Nb3VzZVRvT2JqKGUsIHNlbGYubW91c2VJRCk7XG5cdCAgICBzZWxmLm1haW5IYW5kU3RhcnQodG91Y2hlcyk7XG5cdCAgICBzZWxmLm11bHRpSGFuZFN0YXJ0KHRvdWNoZXMsIHRvdWNoZXMpO1xuXHR9O1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9tb3VzZWRvd247XG59O1xuXG4vKiBSZXR1cm4gYSBoYW5kbGVyIGZvciBET00gbW91c2V1cCBldmVudCAqL1xuVG91Y2hDb250cm9sbGVyLnByb3RvdHlwZS5tb3VzZXVwID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICggIXRoaXMuX21vdXNldXAgKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblx0dGhpcy5fbW91c2V1cCA9IGZ1bmN0aW9uIChlKSB7XG5cdCAgICB2YXIgdG91Y2hlcztcblxuXHQgICAgaWYgKCBzZWxmLm1vdXNlSUQgKSB7XG5cdFx0dG91Y2hlcyA9IGRvbU1vdXNlVG9PYmooZSwgc2VsZi5tb3VzZUlEKTtcblx0XHRzZWxmLm1haW5IYW5kRW5kKHRvdWNoZXMpO1xuXHRcdHNlbGYubXVsdGlIYW5kRW5kKHRvdWNoZXMsIHRvdWNoZXMpO1xuXHRcdHNlbGYubW91c2VJRCA9IG51bGw7XG5cdCAgICB9XG5cdH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX21vdXNldXA7XG59O1xuXG4vKiBSZXR1cm4gYSBoYW5kbGVyIGZvciBET00gbW91c2Vtb3ZlIGV2ZW50ICovXG5Ub3VjaENvbnRyb2xsZXIucHJvdG90eXBlLm1vdXNlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoICF0aGlzLl9tb3VzZW1vdmUgKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblx0dGhpcy5fbW91c2Vtb3ZlID0gZnVuY3Rpb24gKGUpIHtcblx0ICAgIHZhciB0b3VjaGVzO1xuXG5cdCAgICBpZiAoIHNlbGYubW91c2VJRCApIHtcblx0XHR0b3VjaGVzID0gZG9tTW91c2VUb09iaihlLCBzZWxmLm1vdXNlSUQpO1xuXHRcdHNlbGYubWFpbkhhbmRNb3ZlKHRvdWNoZXMpO1xuXHRcdHNlbGYubXVsdGlIYW5kTW92ZSh0b3VjaGVzLCB0b3VjaGVzKTtcblx0ICAgIH1cblx0fTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbW91c2Vtb3ZlO1xufTtcblxuLyogSGFuZGxlIHRoZSBzdGFydCBvZiBhbiBpbmRpdmlkdWFsIGZpbmdlciBpbnRlcmFjdGlvbiAqL1xuVG91Y2hDb250cm9sbGVyLnByb3RvdHlwZS5tYWluSGFuZFN0YXJ0ID0gZnVuY3Rpb24gKGNoYW5nZWRUb3VjaGVzKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIG5ld0ZpbmdlcnMgPSBbXTtcblxuICAgIGZvckVhY2goY2hhbmdlZFRvdWNoZXMsIGZ1bmN0aW9uICh0b3VjaCkge1xuXHR2YXIgZmluZ2VyID0gbmV3IEZpbmdlcih0b3VjaC5pZCwgdG91Y2guZSk7XG5cdGZpbmdlci5sYXN0UG9pbnQgPSB0b3VjaDtcblx0bmV3RmluZ2Vycy5wdXNoKFsgZmluZ2VyLCB0b3VjaCBdKTtcblx0c2VsZi5tYWluSGFuZC5maW5nZXJzLnB1c2goZmluZ2VyKTtcbiAgICB9KTtcblxuICAgIGZvckVhY2gobmV3RmluZ2VycywgZnVuY3Rpb24gKGRhdGEpIHtcblx0c2VsZi5zZXR0aW5ncy5hbnkgJiYgc2VsZi5zZXR0aW5ncy5hbnkuY2FsbChzZWxmLCBzZWxmLm1haW5IYW5kLCBkYXRhWzBdKTtcblx0ZGF0YVswXS50cmlnZ2VyKCdzdGFydCcsIGRhdGFbMV0pO1xuICAgIH0pO1xuXG4gICAgc2VsZi5tYWluSGFuZC50cmlnZ2VyKCdzdGFydCcsIGNoYW5nZWRUb3VjaGVzKTtcbn07XG5cbi8qIEhhbmRsZSB0aGUgbW92ZW1lbnQgb2YgYW4gaW5kaXZpZHVhbCBmaW5nZXIgaW50ZXJhY3Rpb24gKi9cblRvdWNoQ29udHJvbGxlci5wcm90b3R5cGUubWFpbkhhbmRNb3ZlID0gZnVuY3Rpb24gKGNoYW5nZWRUb3VjaGVzKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIG1vdmVkRmluZ2VycyA9IFtdO1xuXG4gICAgZm9yRWFjaChjaGFuZ2VkVG91Y2hlcywgZnVuY3Rpb24gKHRvdWNoKSB7XG5cdHZhciBmaW5nZXIgPSBzZWxmLm1haW5IYW5kLmdldCh0b3VjaC5pZCk7XG5cblx0aWYgKCAhZmluZ2VyICkge1xuXHQgICAgcmV0dXJuO1xuXHR9XG5cblx0ZmluZ2VyLmxhc3RQb2ludCA9IHRvdWNoO1xuXHRtb3ZlZEZpbmdlcnMucHVzaChbIGZpbmdlciwgdG91Y2ggXSk7XG4gICAgfSk7XG5cbiAgICBmb3JFYWNoKG1vdmVkRmluZ2VycywgZnVuY3Rpb24gKGRhdGEpIHtcblx0ZGF0YVswXS50cmlnZ2VyKCdtb3ZlJywgZGF0YVsxXSk7XG4gICAgfSk7XG5cbiAgICBzZWxmLm1haW5IYW5kLnRyaWdnZXIoJ21vdmUnLCBjaGFuZ2VkVG91Y2hlcyk7XG59O1xuXG4vKiBIYW5kbGUgdGhlIGVuZCBvZiBhbiBpbmRpdmlkdWFsIGZpbmdlciBpbnRlcmFjdGlvbiAqL1xuVG91Y2hDb250cm9sbGVyLnByb3RvdHlwZS5tYWluSGFuZEVuZCA9IGZ1bmN0aW9uIChjaGFuZ2VkVG91Y2hlcykge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICBlbmRGaW5nZXJzID0gW107XG5cbiAgICBmb3JFYWNoKGNoYW5nZWRUb3VjaGVzLCBmdW5jdGlvbiAodG91Y2gpIHtcblx0dmFyIGZpbmdlciA9IHNlbGYubWFpbkhhbmQuZ2V0KHRvdWNoLmlkKSxcblx0aW5kZXg7XG5cblx0aWYgKCAhZmluZ2VyICkge1xuXHQgICAgcmV0dXJuO1xuXHR9XG5cblx0ZmluZ2VyLmxhc3RQb2ludCA9IHRvdWNoO1xuXHRlbmRGaW5nZXJzLnB1c2goWyBmaW5nZXIsIHRvdWNoIF0pO1xuXG5cdGluZGV4ID0gaW5kZXhPZihzZWxmLm1haW5IYW5kLmZpbmdlcnMsIGZpbmdlcik7XG5cdHNlbGYubWFpbkhhbmQuZmluZ2Vycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH0pO1xuXG4gICAgZm9yRWFjaChlbmRGaW5nZXJzLCBmdW5jdGlvbiAoZGF0YSkge1xuXHRkYXRhWzBdLnRyaWdnZXIoJ2VuZCcsIGRhdGFbMV0pO1xuICAgIH0pO1xuXG4gICAgc2VsZi5tYWluSGFuZC50cmlnZ2VyKCdlbmQnLCBjaGFuZ2VkVG91Y2hlcyk7XG59O1xuXG4vKiBIYW5kbGUgdGhlIHN0YXJ0IG9mIGEgbXVsdGktdG91Y2ggaW50ZXJhY3Rpb24gKi9cblRvdWNoQ29udHJvbGxlci5wcm90b3R5cGUubXVsdGlIYW5kU3RhcnQgPSBmdW5jdGlvbiAoY2hhbmdlZFRvdWNoZXMsIHRvdWNoZXMpIHtcbiAgICB0aGlzLm11bHRpSGFuZERlc3Ryb3koKTtcbiAgICB0aGlzLm11bHRpSGFuZFJlc3RhcnQodG91Y2hlcyk7XG59O1xuXG4vKiBIYW5kbGUgdGhlIG1vdmVtZW50IG9mIGEgbXVsdGktdG91Y2ggaW50ZXJhY3Rpb24gKi9cblRvdWNoQ29udHJvbGxlci5wcm90b3R5cGUubXVsdGlIYW5kTW92ZSA9IGZ1bmN0aW9uIChjaGFuZ2VkVG91Y2hlcywgdG91Y2hlcykge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICBtb3ZlZEZpbmdlcnMgPSBbXTtcblxuICAgIGZvckVhY2goY2hhbmdlZFRvdWNoZXMsIGZ1bmN0aW9uICh0b3VjaCkge1xuXHR2YXIgZmluZ2VyID0gc2VsZi5tdWx0aUhhbmQuZ2V0KHRvdWNoLmlkKTtcblxuXHRpZiggIWZpbmdlciApIHtcblx0ICAgIHJldHVybjtcblx0fVxuXG5cdGZpbmdlci5sYXN0UG9pbnQgPSB0b3VjaDtcblx0bW92ZWRGaW5nZXJzLnB1c2goWyBmaW5nZXIsIHRvdWNoIF0pO1xuICAgIH0pO1xuXG4gICAgZm9yRWFjaChtb3ZlZEZpbmdlcnMsIGZ1bmN0aW9uIChkYXRhKSB7XG5cdGRhdGFbMF0udHJpZ2dlcignbW92ZScsIGRhdGFbMV0pO1xuICAgIH0pO1xuXG4gICAgc2VsZi5tdWx0aUhhbmQudHJpZ2dlcignbW92ZScsIGNoYW5nZWRUb3VjaGVzKTtcbn07XG5cbi8qIEhhbmRsZSB0aGUgZW5kIG9mIGEgbXVsdGktdG91Y2ggaW50ZXJhY3Rpb24gKi9cblRvdWNoQ29udHJvbGxlci5wcm90b3R5cGUubXVsdGlIYW5kRW5kID0gZnVuY3Rpb24gKGNoYW5nZWRUb3VjaGVzLCB0b3VjaGVzKSB7XG4gICAgdGhpcy5tdWx0aUhhbmREZXN0cm95KCk7XG5cbiAgICB2YXIgcmVtYWluaW5nVG91Y2hlcyA9IGZpbHRlcih0b3VjaGVzLCBmdW5jdGlvbiAodG91Y2gpIHtcblx0dmFyIHVuQ2hhbmdlZCA9IHRydWU7XG5cblx0Zm9yRWFjaChjaGFuZ2VkVG91Y2hlcywgZnVuY3Rpb24gKGNoYW5nZWRUb3VjaCkge1xuXHQgICAgaWYgKGNoYW5nZWRUb3VjaC5pZCA9PSB0b3VjaC5pZCkge1xuXHRcdHVuQ2hhbmdlZCA9IGZhbHNlO1xuXHQgICAgfVxuXHR9KTtcblxuXHRyZXR1cm4gdW5DaGFuZ2VkO1xuICAgIH0pO1xuXG4gICAgdGhpcy5tdWx0aUhhbmRSZXN0YXJ0KHJlbWFpbmluZ1RvdWNoZXMpO1xufTtcblxuLyogQ3JlYXRlIGEgbmV3IGhhbmQgYmFzZWQgb24gdGhlIGN1cnJlbnQgdG91Y2hlcyBvbiB0aGUgc2NyZWVuICovXG5Ub3VjaENvbnRyb2xsZXIucHJvdG90eXBlLm11bHRpSGFuZFJlc3RhcnQgPSBmdW5jdGlvbiAodG91Y2hlcykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0b3VjaGVzLmxlbmd0aCA9PSAwKSB7XG5cdHJldHVybjtcbiAgICB9XG5cbiAgICBzZWxmLm11bHRpSGFuZCA9IG5ldyBIYW5kKCk7XG4gICAgdmFyIG5ld0ZpbmdlcnMgPSBbXTtcblxuICAgIGZvckVhY2godG91Y2hlcywgZnVuY3Rpb24gKHRvdWNoKSB7XG5cdHZhciBmaW5nZXIgPSBuZXcgRmluZ2VyKHRvdWNoLmlkKTtcblxuXHRmaW5nZXIubGFzdFBvaW50ID0gdG91Y2g7XG5cdG5ld0ZpbmdlcnMucHVzaChbIGZpbmdlciwgdG91Y2ggXSk7XG5cdHNlbGYubXVsdGlIYW5kLmZpbmdlcnMucHVzaChmaW5nZXIpO1xuICAgIH0pO1xuXG4gICAgdmFyIGZ1bmMgPSBzZWxmLnNldHRpbmdzWyB7XG5cdDE6ICdvbmUnLFxuXHQyOiAndHdvJyxcblx0MzogJ3RocmVlJyxcblx0NDogJ2ZvdXInLFxuXHQ1OiAnZml2ZSdcbiAgICB9WyBzZWxmLm11bHRpSGFuZC5maW5nZXJzLmxlbmd0aCBdIF07XG5cbiAgICBmdW5jICYmIGZ1bmMuYXBwbHkoc2VsZiwgWyBzZWxmLm11bHRpSGFuZCBdLmNvbmNhdCggc2VsZi5tdWx0aUhhbmQuZmluZ2VycyApKTtcblxuICAgIGZvckVhY2gobmV3RmluZ2VycywgZnVuY3Rpb24gKGRhdGEpIHtcblx0ZGF0YVswXS50cmlnZ2VyKCdzdGFydCcsIGRhdGFbMV0pO1xuICAgIH0pO1xuXG4gICAgc2VsZi5tdWx0aUhhbmQudHJpZ2dlcignc3RhcnQnLCB0b3VjaGVzKTtcbn07XG5cbi8qIERlc3Ryb3kgdGhlIGN1cnJlbnQgaGFuZCByZWdhcmRsZXNzIG9mIGZpbmdlcnMgb24gdGhlIHNjcmVlbiAqL1xuVG91Y2hDb250cm9sbGVyLnByb3RvdHlwZS5tdWx0aUhhbmREZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICggIXRoaXMubXVsdGlIYW5kICkge1xuXHRyZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHBvaW50cyA9IFtdO1xuXG4gICAgZm9yRWFjaCh0aGlzLm11bHRpSGFuZC5maW5nZXJzLCBmdW5jdGlvbiAoZmluZ2VyKSB7XG5cdHZhciBwb2ludCA9IGZpbmdlci5sYXN0UG9pbnQ7XG5cdHBvaW50cy5wdXNoKHBvaW50KTtcblx0ZmluZ2VyLnRyaWdnZXIoJ2VuZCcsIHBvaW50KTtcbiAgICB9KTtcblxuICAgIHRoaXMubXVsdGlIYW5kLnRyaWdnZXIoJ2VuZCcsIHBvaW50cyk7XG5cbiAgICB0aGlzLm11bHRpSGFuZCA9IG51bGw7XG59O1xuXG4vKiBTb2NrZXQtc3R5bGUgZmluZ2VyIG1hbmFnZW1lbnQgZm9yIG11bHRpLXRvdWNoIGV2ZW50cyAqL1xuZnVuY3Rpb24gVG91Y2h5IChlbGVtLCBoYW5kbGVNb3VzZSwgc2V0dGluZ3MpIHtcbiAgICByZXR1cm4gbmV3IFRvdWNoQ29udHJvbGxlcihlbGVtLCBoYW5kbGVNb3VzZSwgc2V0dGluZ3MpO1xufVxuXG4vKiBQbHVnaW4gc3VwcG9ydCBmb3IgY3VzdG9tIHRvdWNoIGhhbmRsaW5nICovXG52YXIgcGx1Z2lucyA9IHt9O1xuVG91Y2h5LnBsdWdpbiA9IGZ1bmN0aW9uIChuYW1lLCBjYWxsYmFjaykge1xuICAgIGlmIChuYW1lIGluIHBsdWdpbnMpIHtcblx0dGhyb3cgJ1RvdWNoeTogJyArIG5hbWUgKyAnIHBsdWdpbiBhbHJlYWR5IGRlZmluZWQnO1xuICAgIH1cblxuICAgIHBsdWdpbnNbbmFtZV0gPSBjYWxsYmFjaztcbn07XG5cblxuXG4vKiBQcmV2ZW50IHdpbmRvdyBtb3ZlbWVudCAoaU9TIGZpeCkgKi9cbnZhciBwcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uIChlKSB7IGUucHJldmVudERlZmF1bHQoKSB9O1xuXG5Ub3VjaHkuc3RvcFdpbmRvd0JvdW5jZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBiaW5kKHdpbmRvdywgJ3RvdWNobW92ZScsIHByZXZlbnREZWZhdWx0KTtcbn07XG5cblRvdWNoeS5zdGFydFdpbmRvd0JvdW5jZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB1bmJpbmQod2luZG93LCAndG91Y2htb3ZlJywgcHJldmVudERlZmF1bHQpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUb3VjaHk7XG4iLCJ2YXIgY2xvc2UgPSByZXF1aXJlKCdjbG9zZW5lc3MnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5vZGUsIHBvaW50cywgZm4pe1xuICBcbiAgaWYoIShBcnJheS5pc0FycmF5KHBvaW50cykpKXtcbiAgICBmbiA9IHBvaW50c1xuICAgIHBvaW50cyA9IG51bGxcbiAgfVxuXG4gIGlmKHBvaW50cyl7XG4gICAgcG9pbnRzID0gcG9pbnRzLm1hcChmdW5jdGlvbihlKXtcbiAgICAgIHZhciBzZWxmID0gZVxuICAgICAgZS51cGRhdGUgPSBmdW5jdGlvbigpe1xuICAgICAgICBzZWxmLmNsb3NlWCA9IGNsb3NlKHNlbGYueCwgc2VsZi5yYWRpdXMgKiAxMCB8fCAxMClcbiAgICAgICAgc2VsZi5jbG9zZVkgPSBjbG9zZShzZWxmLnksIHNlbGYucmFkaXVzICogMTAgfHwgMTApXG4gICAgICB9XG4gICAgICBlLnVwZGF0ZSgpXG4gICAgICByZXR1cm4gZVxuICAgIH0pXG4gIH1cblxuICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIG9uSG92ZXIsIHRydWUpXG5cbiAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIG9uRXhpdCwgdHJ1ZSlcblxuICB2YXIgbm9kZSA9IG5vZGU7XG5cbiAgdmFyIHBvc2l0aW9uID0gWzAsIDBdO1xuXG4gIGZ1bmN0aW9uIG1vdXNlTW92ZShldnQpe1xuXG4gICAgaWYocG9pbnRzKXtcbiAgICAgIHBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKHB0KSB7XG4gICAgICAgIHZhciB4LCB5XG4gICAgICAgIGlmKHB0LmhvdmVyKXtcbiAgICAgICAgICBpZighKHB0LmNsb3NlWCh4ID0gZXZ0Lm9mZnNldFgpICYmIHB0LmNsb3NlWSh5ID0gZXZ0Lm9mZnNldFkpKSl7XG4gICAgICAgICAgICBwdC5ob3ZlciA9IGZhbHNlXG4gICAgICAgICAgICBmbihldnQsIHB0LCBbeCwgeV0sIGZhbHNlLCB0cnVlKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZihwdC5jbG9zZVgoeCA9IGV2dC5vZmZzZXRYKSAmJiBwdC5jbG9zZVkoeSA9IGV2dC5vZmZzZXRZKSl7XG4gICAgICAgICAgcHQuaG92ZXIgPSB0cnVlXG4gICAgICAgICAgZm4oZXZ0LCBwdCwgW3gsIHldLCBmYWxzZSwgZmFsc2UpXG4gICAgICAgIH1cbiAgICAgIH0pICAgIFxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgcG9zaXRpb24gPSBmaW5kUG9zKGV2dC50YXJnZXQpO1xuXG4gICAgZm4oZXZ0LCBub2RlLCBwb3NpdGlvbiwgZmFsc2UsIGZhbHNlKVxuXG4gIH07XG5cbiAgZnVuY3Rpb24gb25FeGl0KGV2dCl7XG5cbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW91c2VNb3ZlLCB0cnVlKVxuICAgIFxuICAgIGlmKHBvaW50cyl7XG4gICAgICBwb2ludHMuZm9yRWFjaChmdW5jdGlvbihwdCkge1xuICAgICAgICB2YXIgeCwgeVxuICAgICAgICBpZihwdC5jbG9zZVgoeCA9IGV2dC5vZmZzZXRYKSAmJiBwdC5jbG9zZVkoeSA9IGV2dC5vZmZzZXRZKSl7XG4gICAgICAgICAgcHQuaG92ZXIgPSBmYWxzZVxuICAgICAgICAgIGZuKGV2dCwgcHQsIFt4LCB5XSwgZmFsc2UsIHRydWUpXG4gICAgICAgIH1cbiAgICAgIH0pICAgIFxuICAgICAgcmV0dXJuXG4gICAgfVxuXG5cbiAgICBwb3NpdGlvbiA9IGZpbmRQb3MoZXZ0LnRhcmdldCk7XG5cbiAgICBmbihldnQsIG5vZGUsIHBvc2l0aW9uLCBmYWxzZSwgdHJ1ZSlcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIG9uSG92ZXIoZXZ0KXtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZU1vdmUsIHRydWUpO1xuXG4gICAgaWYocG9pbnRzKXtcbiAgICAgIHBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKHB0KSB7XG4gICAgICAgIHZhciB4LCB5XG4gICAgICAgIGlmKHB0LmNsb3NlWCh4ID0gZXZ0Lm9mZnNldFgpICYmIHB0LmNsb3NlWSh5ID0gZXZ0Lm9mZnNldFkpKXtcbiAgICAgICAgICBwdC5ob3ZlciA9IHRydWVcbiAgICAgICAgICBmbihldnQsIHB0LCBbeCwgeV0sIHRydWUsIGZhbHNlKVxuICAgICAgICB9XG4gICAgICB9KSAgICBcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBcblxuICAgIHBvc2l0aW9uID0gZmluZFBvcyhldnQudGFyZ2V0KTtcblxuICAgIGZuKGV2dCwgbm9kZSwgcG9zaXRpb24sIHRydWUsIGZhbHNlKVxuXG4gIH07XG5cbiAgcmV0dXJuIHBvaW50c1xuXG59XG5cbmZ1bmN0aW9uIGZpbmRQb3Mob2JqKSB7XG4gIHZhciBjdXJsZWZ0ID0gMFxuICAsICAgY3VydG9wID0gMDtcblxuICBpZiAob2JqLm9mZnNldFBhcmVudCkge1xuXG4gICAgZG8ge1xuXG4gICAgICBjdXJsZWZ0ICs9IG9iai5vZmZzZXRMZWZ0O1xuXG4gICAgICBjdXJ0b3AgKz0gb2JqLm9mZnNldFRvcDtcblxuICAgIH0gXG5cbiAgICB3aGlsZSAob2JqID0gb2JqLm9mZnNldFBhcmVudCk7XG5cbiAgICByZXR1cm4gW2N1cmxlZnQsY3VydG9wXTtcblxuICB9O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obnVtLCBkaXN0KXtcblx0cmV0dXJuIGZ1bmN0aW9uKHZhbCl7XG5cdFx0cmV0dXJuIChNYXRoLmFicyhudW0gLSB2YWwpIDwgZGlzdClcblx0fVxufTsiXX0=
