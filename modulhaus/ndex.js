var fs = require('fs')
var Canvas = require('canvas')
var canvas = new Canvas(900, 600)
var Time = require('since-when')
var ndarray = require('ndarray')
var rules = require('./lib/rules.js')
var getCSS = require('./lib/getCSS')
var drawGrid = require('./lib/grid.js')
var squarejob = require('./lib/squarejob');
var w,h,draw,lifeSize,zom,data,data2, prev, next;
var anim = 0;
var mix = require('color-mix');
//var pxecho = require('../pxecho/index.js');
var frames = [];
//setTimeout(init, 555)
init()

function init(){
  w = 900
  h = 600
  lifeSize = 5 
//  var delay = pxecho(w * h * 4, Uint8ClampedArray)


  data = new Uint8ClampedArray(Math.ceil(w / lifeSize) * Math.ceil(h / lifeSize))
  data2 = new Uint8ClampedArray(Math.ceil(w / lifeSize) * Math.ceil(h / lifeSize))

  for(var x = 0; x < data.length; x++){
    data[x] = 0//Math.floor(Math.random() * 9);
    data2[x] = 0//Math.floor(Math.random() * 9)
  }

  prev = ndarray(data, [Math.ceil(w / lifeSize), Math.ceil(h / lifeSize)]);
  next = ndarray(data2, [Math.ceil(w / lifeSize), Math.ceil(h / lifeSize)]);
  draw = canvas.getContext('2d')
  
  draw.strokeStyle = rgba(255,255,255,1) 
  zoom = 1;
//  time.every(1e9 * .63,run)
//  play()

  var ad = prev.shape
//  prev.set(Math.floor(ad[0]/6 * 2),Math.floor(ad[1]/6 * 4),245)
  prev.set(Math.floor(ad[0]/6 * 3),Math.floor(ad[1]/6*2),245)
   record()
//  time.every(1e9 / 16, run)
  play(0)
 
var last = 0;
var ccc = 0;
function play(t){
    
    var canvas = new Canvas(900, 600)
    var draw = canvas.getContext('2d')
    draw.beginPath();
    squarejob(next, draw, lifeSize)
    var ws = fs.createWriteStream('./pngs/frame' + (t) + '.png')
    var ds = canvas.createPNGStream()
    ds.pipe(ws)
//    ds.on('data', function(chunk){console.log(chunk.toString());ws.write(chunk)})
    ds.on('error', function(err){ console.log(err)})
    ds.on('end', function(){
      next.data = frames.shift()
      if(!next.data){
        console.log('done')
        process.exit()
      }
      else {
        play(++t)
        console.log('frame %d saved', t)
      }
    })
}
var spin = 0;

function record(){
  var first = prev
  var second = next
  for(var x = 0; x <  1; x ++){
    rules(prev, next)
    frames.push(new Uint8ClampedArray(next.data))
    var z = prev
    prev = next
    next = z
  }

  data = new Uint8ClampedArray(Math.ceil(w / lifeSize) * Math.ceil(h / lifeSize))
  data2 = new Uint8ClampedArray(Math.ceil(w / lifeSize) * Math.ceil(h / lifeSize))

  for(var x = 0; x < data.length; x++){
    data[x] = 0//Math.floor(Math.random() * 9);
    data2[x] = 0//Math.floor(Math.random() * 9)
  }

  prev = ndarray(data, [Math.ceil(w / lifeSize), Math.ceil(h / lifeSize)]);
  next = ndarray(data2, [Math.ceil(w / lifeSize), Math.ceil(h / lifeSize)]);

}

function run(tock, interval){
//  prev.set(0,0,99)
//  prev.set(Math.floor(ad[0]/2),Math.floor(ad[1]/2),245)
//  prev.set(Math.floor(w / lifeSize), 0, 255)
//  ui.board.style['-webkit-transform'] = 'rotate('+(spin+=6)+'deg)'
//  ui.board.style['transform'] = 'rotate('+(spin++)+'deg)'

rules(prev, next)
  squarejob(next, draw, lifeSize)//*(Math.ceil(Math.random() * 3)))
/*  var data = draw.getImageData(0,0,w,h)
  var d = data.data, i = 0;
  var color;
  for(var x = 0, arr = [], arrb = []; x < w * h; x++){
    i = x * 4
    arr[0] = delay.read()
    arr[1] = delay.read()
    arr[2] = delay.read()
    arr[3] = delay.read()
    arrb[0] = d[i]
    arrb[1] = d[i + 1]
    arrb[2] = d[i + 2]
    arrb[3] = d[i + 3]
    if(arr[0]) {
      color = mix(arr, arrb)
//      console.log(arr, arrb, color)
      color.forEach(function(e){delay.write(e)})
      d[i] = color[0]
      d[i + 1] = color[1]
      d[i + 2] = color[2]
      d[i + 3] = color[3]
    }
    else arrb.forEach(function(e){delay.write(e)})
//    console.log(arr, arrb)

  }
  draw.putImageData(data, 0,0)
*/  var z = prev
  prev = next
  next = z
//  tock()
}

}

//ui.board.addEventListener('touchdown', springLife)
//ui.board.addEventListener('deltavector', springLife)
function rgba(){
  return 'rgba('+Array.prototype.join.call(arguments, ',')+')'
}
