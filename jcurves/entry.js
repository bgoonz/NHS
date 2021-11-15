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

