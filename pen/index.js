var touchdown = require('../touchdown')
var trig = require('./trig')
var basic = require('./styles/basic')
var fountain = require('./styles/fountain')
var icanvas = require('./install-canvas')
var observable = require('observable')
var layers = undefined
var index = 0;

// the canvas of the context is not a layer
// it is the drawing board, and must always be on top
// it maybe  necessary to copy the top layer to the context canvas... 

module.exports = function(parent){
  var canvas = icanvas(parent, index--)
  var parentEl = observable();
  parentEl(layers)
  parentEl(function(v){
   // console.log(v)
  })
  touchdown.start(canvas)
  var ctx = window.ctx = canvas.getContext('2d')
  var pen = fountain(ctx)
  ctx.translate(0.5, 0.5)
  ctx.lineWidth = 30
//  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'black'//'rgba(222,22,228,1)'
  ctx.strokeStyle = 'black'//'rgba(222,22,228,1)' 

  ctx.lineJoin = 'round'
  canvas.addEventListener('touchdown', function(e){
    if(!layers){
      layers = []
      pen.down(e.detail)
    }
    else{
      var layer = icanvas(parent, index--)
      lctx = layer.getContext('2d')
      lctx.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      layers.push(layer)
      parentEl(layers)
      pen.down(e.detail)
    }
  })
  
  canvas.addEventListener('deltavector', function(e){pen.move(e.detail)})
  canvas.addEventListener('liftoff', function(e){
    pen.up(e.detail)
  })
}

