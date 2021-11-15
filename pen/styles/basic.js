var trig = require('../trig')

module.exports = function(ctx, denit){

  return {
    down: touchdown,
    move: deltavector,
    up: liftoff 
  }
  
  function touchdown(evt){
    ctx.beginPath()
  }

  function deltavector(evt){
    if(trig.distance(evt.lastOffsetPoint, [evt.offsetX, evt.offsetY]) < 1) return
    else{
      ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height)
      ctx.moveTo(evt.allOffsetPoints[0][0], evt.allOffsetPoints[0][1])
      for(var x = 1; x < evt.allOffsetPoints.length; x++){
        ctx.lineTo(evt.allOffsetPoints[x][0], evt.allOffsetPoints[x][1])
      }
//      ctx.stroke()
    }
  }

  function liftoff(evt){
    ctx.stroke()
  }
}
