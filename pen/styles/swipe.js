var trig = require('../trig')
var tangent = require('../softTangent')

module.exports = function(ctx, denit){

  var hold = true;
  var pt = [];
  var r = 1;
  var w = ctx.canvas.width
  var h = ctx.canvas.height
  var f;
  var lw = ctx.lineWidth
  return {
    down: touchdown,
    up: deltavector,
    move: liftoff 
  }
  
  function spill(){
    if(hold) f = window.requestAnimationFrame(spill)
    ctx.beginPath()
    ctx.clearRect(0,0,w,h)
    ctx.arc(pt[0], pt[1], r, 0, 2 * Math.PI, false);
    ctx.fill()
  }

  function touchdown(evt){
    r = lw = ctx.lineWidth
    pt[0] = evt.offsetX
    pt[1] = evt.offsetY
    hold = false//true
    window.requestAnimationFrame(spill)
  }

  function deltavector(evt){
    if(false && trig.distance(pt, [evt.offsetX, evt.offsetY]) < r) return
    else{
      hold = false
      window.cancelAnimationFrame(f)
//      ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height)
//      ctx.beginPath()
      var td = evt.allOffsetPoints.reduce(function(acc, e, i, l){
        if(l[i - 1]){
          acc[i] = acc[i - 1] + trig.distance(e, l[i-1]) 
          return acc
        }
        else return acc
       }, [0])
      var all = evt.allOffsetPoints
      var ttd = td[td.length - 1]
      var a, b, c, d, ar = r, br, cr, at, bt, ct;
      var last;
      ctx.beginPath()
      ctx.moveTo(evt.allOffsetPoints[0][0], evt.allOffsetPoints[0][1])
      ctx.lineWidth = 1
 //     ctx.arc(pt[0], pt[1], r+2, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
      for(var x = 0; x < all.length - 2; x++){
        a = a || all[0]
        b = b || all[x]
        c = c || all[x + 1]
        d = d || all[x + 2]
        ar = ar || r
        br = radius(r, td[x], ttd, ctx.lineWidth)
        cr = radius(r, td[x + 1], ttd, ctx.lineWidth)
//        at = tangent(ar, a, b).tangents
        bt = tangent(br, b, c).tangents
        ct = tangent(cr, c, d).tangents
        ctx.beginPath()
        ctx.moveTo(bt[0][0], bt[0][1])
        line(ctx,bt[0], ct[0])
        line(ctx,ct[0],ct[1])
        line(ctx,ct[1], bt[1])
        ctx.closePath()
        ctx.stroke()
//        ctx.fill()
        circle(ctx, b, br)
        a = b
        b = c
        c = all[x + 2] || c
        d = all[x + 3] || d
        last = bt[0]
//        ar = radius(r, td[x-1], ttd, ctx.lineWidth)
//        ctx.arc(evt.allOffsetPoints[x][0], evt.allOffsetPoints[x][1], (((r / 1.62) - ctx.lineWidth / 2) * (1 -(td[x]/ttd))) + (ctx.lineWidth/2) , Math.PI * 2, false )
//        ctx.arc(evt.offsetX, evt.offsetY, r * ((trig.distance(evt.allOffsetPoints.slice(-1)[0], pt) / td), Math.PI * 2, false)
//        ctx.fill()
      }
//      ctx.stroke()
    // r = ctx.lineWidth
    ctx.lineWidth = lw
    r = lw
    console.log(r, lw, ctx.lineWidth)
    }
  }

  function liftoff(evt){
    ctx.beginPath()
    ctx.arc(evt.offsetX, evt.offsetY, 1, Math.PI*2, false)
    ctx.fill()
    window.cancelAnimationFrame(f)
    hold = false
  }
}
function radius(r, td, ttd, w){
  return ((r) * (1-(td/ttd))) 
}
function circle(ctx, pt, r){
   ctx.moveTo(pt[0], pt[1])
   ctx.beginPath()
   ctx.arc(pt[0], pt[1], r, Math.PI * 2, false)
   ctx.stroke()
//   ctx.fill()
}
function line(ctx, from, to){
//  ctx.beginPath()
//  ctx.moveTo(from[0], from[1])
  ctx.lineTo(to[0], to[1])
//  ctx.arcTo(from[0], from[1], to[0], to[1], trig.distance(from, to) )
  ctx.lineJoin = 'round'
  return
}
