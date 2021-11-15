(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var LOGGING = true
var log = LOGGING ? console.log.bind(console) : function(){}

// https://stackoverflow.com/questions/21797299/convert-base64-string-to-arraybuffer
function _base64ToArrayBuffer (base64) {
  var binary_string =  window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array( len );
  for (var i = 0; i < len; i++)        {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}
function toArrayBuffer (buf) {
  if (typeof buf === 'string')
    return _base64ToArrayBuffer(buf)
  if (!(buf instanceof ArrayBuffer))
    throw "Must provide a valid ArrayBuffer or base64-encoded string"
  return buf
}
function top4 (byte) {
  return (byte & 0b11110000) >> 4
}
function bot4 (byte) {
  return byte & 0b00001111
}

module.exports.constellation = function(canvas, buf){
  var draw = canvas.getContext('2d')
  var w = canvas.width
  var h = canvas.height
  var center = [w / 2, h / 2]
  var img = draw.getImageData(0,0,w,h)

  var arr = new Uint8Array(buf)//toArrayBuffer(buf)
  var ratio = Math.sqrt(arr.byteLength) / (w * h)
  var maxr = w / 2
  var maxz = w * 2
  draw.fillStyle = 'black'
  draw.fillRect(0,0,w,h)
  for(var x = 0; x < arr.length; x+=4){
    var a = arr[x] / 255 * 360
    var r = arr[x+1] / 255 * maxr
    var z = arr[x+2] / 255 
    var m = arr[x+3] / 255
    var coord = xy(a,r)
    console.log(coord[0], coord[1])
    //coord[0] = coord[0] - w / 2
    //coord[1] = coord[1] + h / 2
    draw.beginPath()
    draw.arc(coord[0], coord[1], m * 20, 0, Math.PI * 2, false)
    var grad = draw.createRadialGradient(coord[0], coord[1], m * 20, coord[0], coord[1], 0)
    grad.addColorStop(1, 'rgba(255, 255, 255,1)')
    grad.addColorStop(z, 'rgba(255, 255, 255,'+(1-z)+' )')
    grad.addColorStop(1-z, 'rgba(255, 255, 0, '+(z)+')')
    grad.addColorStop(0, 'rgba(255, 255, 0, '+(1)+')')

    draw.fillStyle = grad
    draw.fill()
    

  }

  function xy(a, r){
    var xx = center[0] + r * Math.cos(a)
    var yy = center[1] + r * Math.sin(a)
    return [xx, yy]
  }

}

module.exports.tryAngles = function(canvas, buf){
  var draw = canvas.getContext('2d')
  var w = canvas.width
  var h = canvas.height
  var center = [w / 2, h / 2]
  var img = draw.getImageData(0,0,w,h)
  
  var arr = new Uint8Array(buf)//toArrayBuffer(buf)
  var ratio = Math.sqrt(arr.byteLength) / (w * h)
  var gr = 1.618033
  var eyed = w / gr  
  var lex = (w - eyed) / 2
  var rex = lex + eyed
  var ley = 88
  var rey = 88
  var my = h - (h / gr) / 2
  for(var y = 0; y < h; ++y){
    for(var x = 0; x < w; ++x){
      var ld = distance([x,y], [lex, ley]) * 2
      var rd = distance([x,y], [rex, rey]) * 2
      var md = distance([x,y], [w / 2, my]) * 2
      var ald = angle([x,y], [lex, ley]) * (180 / Math.PI)
      var ard = angle([x,y], [rex, rey]) * (180 / Math.PI)
      var amd = angle([x,y], [w / 2, my]) * (180 / Math.PI)
      var tv = 360 - ald + ard + amd
      var i = (y * w + x) * 4
      var c = 0
      var amdr = amd * (Math.PI / 180)

      //if(i % 16 === 0) console.log(a)
      
      var v = arr[Math.floor(i * ratio)]

      img.data[i] =   Math.floor(((tv / 360)) * ld / 255 * (arr[Math.floor(i * ratio)] / 2))
      img.data[++i] =  Math.floor(((tv / 360)) *  rd / 255 * (arr[Math.floor(i * ratio)] / 2))
      img.data[++i] =  Math.floor((((Math.abs(tv / 360)))) *  md / 255 *(arr[Math.floor(i * ratio)] / 2))
      img.data[++i] = 255//Math.floor((d / 255) *  arr[Math.floor(i * ratio)])
      

    }
  }

  draw.putImageData(img, 0, 0)
 
  function fill(arr, ratio){
    var m = Math.floor(1 / ratio)
    var arr8 = new Uint8Array(arr)
    var narr = new ArrayBuffer(arr.byteLength * m)
    var narr8 = new Uint8Array(narr)
    for(var x = 0; x < narr.byteLength; x++){
      narr8[x] = arr8[x % arr.byteLength]
    }
    return narr8
  }

  function angle(p1, p2){
    var dx = p2[0] - p1[0]
    var dy = p2[1] - p1[1]
    return Math.atan2(dy, dx)
  }
  
  function distance(p1, p2){
    return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2))
  }
}

module.exports.radiilines = function(canvas, buf){
  var draw = canvas.getContext('2d')
  var w = canvas.width
  var h = canvas.height
  var center = [w / 2, h / 2]
  var img = draw.getImageData(0,0,w,h)
  
  var arr = new Uint8Array(buf)//toArrayBuffer(buf)
  var ratio = Math.sqrt(arr.byteLength) / (w * h)
  var gr = 1.618033
  var eyed = w / gr  
  var lex = (w - eyed) / 2
  var rex = lex + eyed
  var ley = 88
  var rey = 88
  var my = h - (h / gr) / 2
  for(var y = 0; y < h; ++y){
    for(var x = 0; x < w; ++x){
      var ld = distance([x,y], [lex, ley]) * 2
      var rd = distance([x,y], [rex, rey]) * 2
      var md = distance([x,y], [w / 2, my]) * 2
      var ald = angle([x,y], [lex, ley]) * (180 / Math.PI)
      var ard = angle([x,y], [rex, rey]) * (180 / Math.PI)
      var amd = angle([x,y], [w / 2, my]) * (180 / Math.PI)
      var hyp = Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2))
      var i = (y * w + x) * 4
      var c = 0
      var td = ld + rd + md
      //if(i % 16 === 0) console.log(a)
      
      var v = arr[Math.floor(i * ratio)]

      img.data[i] =  255 - Math.floor(((td/ hyp )) *  (arr[Math.floor(i * ratio)] / 2))
      img.data[++i] = 255 -  Math.floor(((td / hyp )) *  (arr[Math.floor(i * ratio)] / 2))
      img.data[++i] = 255 - Math.floor(((td / hyp )) *  (arr[Math.floor(i * ratio)] / 2))
      img.data[++i] = 255//Math.floor((d / 255) *  arr[Math.floor(i * ratio)])
      

    }
  }

  draw.putImageData(img, 0, 0)
 
  function fill(arr, ratio){
    var m = Math.floor(1 / ratio)
    var arr8 = new Uint8Array(arr)
    var narr = new ArrayBuffer(arr.byteLength * m)
    var narr8 = new Uint8Array(narr)
    for(var x = 0; x < narr.byteLength; x++){
      narr8[x] = arr8[x % arr.byteLength]
    }
    return narr8
  }

  function angle(p1, p2){
    var dx = p2[0] - p1[0]
    var dy = p2[1] - p1[1]
    return Math.atan2(dy, dx)
  }
  
  function distance(p1, p2){
    return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2))
  }
}

module.exports.blockwork = function (canvas, buf) {
  buf = toArrayBuffer(buf)
  
  var context = canvas.getContext && canvas.getContext('2d'),
    width = canvas.width,
    height = canvas.height,
    bytes = new Uint8ClampedArray(buf)

  function renderPass (blockSize, alpha) {
    var i = 0
    function getUint () {
      if (i >= bytes.length) 
        i = 0
      return  bytes[i++]
    }

    var baseR = getUint()
    var baseG = getUint()
    var baseB = getUint()

    for (var y = 0; y < height; y += blockSize) {
      for (var x = 0; x < height; x += blockSize) {
        var r = ((baseR + baseR + getUint()) / 3)|0
        var g = ((baseG + baseG + getUint()) / 3)|0
        var b = ((baseB + baseB + getUint()) / 3)|0
        context.fillStyle = 'rgba('+r+','+g+','+b+','+alpha+')'
        context.fillRect(x, y, blockSize, blockSize)
      }
    }
  }

  renderPass(64, 1)
}

module.exports.blockwild = function (canvas, buf, blockSize) {
  buf = toArrayBuffer(buf)
  blockSize = blockSize || 32
  
  var context = canvas.getContext && canvas.getContext('2d'),
    width = canvas.width,
    height = canvas.height,
    bytes = new Uint8ClampedArray(buf)

  var baseR = bytes[0]
  var baseG = bytes[1]
  var baseB = bytes[2]
  for (var i=3; i < bytes.length; i++) {
    var byte = bytes[i]
    var r = ((baseR + byte) / 2)|0
    var g = ((baseG + byte) / 2)|0
    var b = ((baseB + byte) / 2)|0
    context.fillStyle = 'rgb('+r+','+g+','+b+')'
    var x = (top4(byte)/16*(width - blockSize))|0
    var y = (bot4(byte)/16*(height - blockSize))|0
    context.fillRect(x, y, blockSize, blockSize)
  }
}

module.exports.wildegraph = function (canvas, buf, blockSize) {
  buf = toArrayBuffer(buf)
  blockSize = blockSize || 8
  
  var context = canvas.getContext && canvas.getContext('2d'),
    width = canvas.width,
    height = canvas.height,
    bytes = new Uint8ClampedArray(buf)

  var baseR = bytes[0]
  var baseG = bytes[1]
  var baseB = bytes[2]
  var lastWeight, lastX, lastY

  // pass 1: lines
  for (var i=3; i < bytes.length; i++) {
    var byte = bytes[i]
    var r = ((baseR + byte) / 2)|0
    var g = ((baseG + byte) / 2)|0
    var b = ((baseB + byte) / 2)|0
    var weight = (255-byte) / 64
    var size = blockSize * weight
    var sizeHalf = (size/2)|0
    var x = (top4(byte)/16*(width - size))|0
    var y = (bot4(byte)/16*(height - size))|0
    if (lastX !== undefined && lastY !== undefined) {
      context.strokeStyle = 'rgb('+r+','+g+','+b+')'
      context.lineWidth = Math.min(weight, lastWeight)
      context.beginPath()
      context.moveTo(lastX+sizeHalf, lastY+sizeHalf)
      context.lineTo(x+sizeHalf, y+sizeHalf)
      context.stroke()
    }
    context.fillStyle = 'rgb('+r+','+g+','+b+')'
    context.fillRect(x, y, size, size)
    lastX = x
    lastY = y
    lastWeight = weight
  }

  // pass 2: squares
  for (var i=3; i < bytes.length; i++) {
    var byte = bytes[i]
    var r = ((baseR + byte) / 2)|0
    var g = ((baseG + byte) / 2)|0
    var b = ((baseB + byte) / 2)|0
    var weight = (255-byte) / 64
    var size = blockSize * weight
    var x = (top4(byte)/16*(width - size))|0
    var y = (bot4(byte)/16*(height - size))|0
    context.fillStyle = 'rgb('+r+','+g+','+b+')'
    context.fillRect(x, y, size, size)
  }
}

},{}],2:[function(require,module,exports){
var pubkeyAvis = require('./index')

// generate public key
var pubkeyBuf = new ArrayBuffer(32)
var pubkeyUints = new Uint8Array(pubkeyBuf)
for (var i=0; i < 32; i++)
  pubkeyUints[i] = (Math.random() * 256)|0
console.log(pubkeyUints)

// render public key
var pubkeyBase64 = btoa(String.fromCharCode.apply(null, pubkeyUints))
pubkeyOutput.textContent = pubkeyBase64

// render algorithms
pubkeyAvis.constellation(constellationCanvas, pubkeyBuf)
pubkeyAvis.tryAngles(tryAnglesCanvas, pubkeyBuf)
pubkeyAvis.radiilines(radiilinesCanvas, pubkeyBuf)
pubkeyAvis.blockwork(blockworkCanvas, pubkeyBuf)
pubkeyAvis.blockwild(blockwildCanvas, pubkeyBuf)
pubkeyAvis.wildegraph(wildegraphCanvas, pubkeyBuf)

},{"./index":1}]},{},[2]);
