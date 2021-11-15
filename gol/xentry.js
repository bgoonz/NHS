var body = document.body
var ui = require('getids')(document.body)
var fs = require('fullscreen');
var touchdown = require('touchdown');
var Time = require('../since-when')
var ndarray = require('ndarray')
var rules = require('./lib/rules.js')
require('./lib/reqFrame')()
var getCSS = require('./lib/getCSS')

//var time = Time()
var w = window.innerWidth
var h = window.innerHeight
var draw = ui.board.getContext('2d')
var lifeSize = 45 
var zoom = 1;
ui.board.width = w
ui.board.height = h

draw.fillStyle = rgba(0,0,0,1) 
draw.fillRect(0,0,w,h)
var data = new Uint8ClampedArray(Math.ceil(w / lifeSize) * Math.ceil(h / lifeSize))
var data2 = new Uint8ClampedArray(Math.ceil(w / lifeSize) * Math.ceil(h / lifeSize))

for(var x = 0; x < data.length; x++){
  data[x] = 0;
  data2[x] = 0
}
var bits = ndarray(data, [Math.ceil(w / lifeSize), Math.ceil(h / lifeSize)]);
var next = ndarray(data2, [Math.ceil(w / lifeSize), Math.ceil(h / lifeSize)]);

var pixel = draw.getImageData(0,0,100,100)
//window.requestAnimationFrame(draw)
function draw(t){

  window.requestAnimationFrame(draw)
  
}

var anim = 0;
touchdown.start(ui.board);
touchdown.start(ui.step)
touchdown.start(ui.play)
touchdown.start(ui.stop)

ui.stop.addEventListener('touchdown', function(){
  window.cancelAnimationFrame(anim)
})
ui.play.addEventListener('touchdown', function(){
  play()
})
ui.step.addEventListener('click', run)

function play(){
  anim = window.requestAnimationFrame(play)
  run()
}
function run(evt){
  
  rules(bits, next)
  for(var i = 0; i < next.shape[0]; i++){
    for(var j = 0; j < next.shape[1]; j++){
      var n = next.get(i, j)
      gen(i * lifeSize, j * lifeSize, n - 10)
    }
  }
  var z = bits
  bits = next
  next = z

}

draw.strokeStyle = '#fff';
for(var x = 0; x < w; x+=lifeSize * zoom){
  draw.moveTo(x, 0)
  draw.lineTo(x, h)
}

for(var y = 0; y < h; y+= lifeSize * zoom){
  draw.moveTo(0, y)
  draw.lineTo(w, y)
}
draw.stroke()

ui.board.addEventListener('touchdown', springLife)
//ui.board.addEventListener('deltavector', springLife)
function gen(x, y, z){
  x -= x % lifeSize
  y -= y % lifeSize
  draw.strokeStyle = (z > 0) ? rgba(0,0,0,1) : rgba(255,255,255,1)
  draw.fillStyle = (z > 0) ? rgba(255,255,255,1) : rgba(0,0,0,1)
  draw.fillRect(x, y, lifeSize, lifeSize)
  draw.strokeRect(x, y, lifeSize, lifeSize)
}
function springLife(e){
  var x = e.detail.x, y = e.detail.y;
  x -= x % lifeSize
  y -= y % lifeSize
  x /= lifeSize
  y /= lifeSize
  var z = bits.get(x, y)
  if(z < 10) z = 10
  else z = 0
  bits.set(x, y, z)
  gen(e.detail.x, e.detail.y, z)
}

var screen = fs(document.body);

screen.on('attain', function(){
})

screen.on('error', function(e){console.log(e)})

document.body.addEventListener('click', function(){
//  screen.request()
})

function rgba(){
  return 'rgba('+Array.prototype.join.call(arguments, ',')+')'
}
