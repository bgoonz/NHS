var ms = [ 1, 2, -4, 1, 1, 6, 5, 1 ]

return function (t) {

  t+=.5  
  t *= 72*2/60
  var m = ms[Math.floor(t)%ms.length]
  var xm = Math.pow(2,m/12)
  var j = sin_(sin(2380),(t+.5)%16)
  var c = Math.pow((t%1<.5?(1-saw_(2,t))/2:(1+sin(4))/2),8)
  return c*j
    + tri_(tri_(100*xm + sin(1)/8,t%4)/4,t%1+2)*0.75
    * amod(1/2, 1/2, t, 2)

  function tri_ (x,t) { return Math.abs(1 - t % (1/x) * x * 2) * 2 - 1 }
  function tri (x) { return tri_(x,t) }
  function saw_ (x,t) { return t%(1/x)*x*2-1 }
  function saw (x) { return saw_(x,t) }
  function sin_ (x,t) { return Math.sin(2 * Math.PI * t * x) }
  function sin (x) { return sin_(x,t) }
  function sq_ (x,t) { return t*x % 1 < 0.5 ? -1 : 1 }
  function sq (x) { return sq_(x,t) }
  function clamp (x) { return Math.max(-1,Math.min(1,x)) }
  function amod(c, r, tt, f){return c + (r  * sin_(f, tt))}

}