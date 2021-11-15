var swtch = require('uxer/switch')

module.exports = function(p, cb){

 var center = dot(88,  'hsla(0, 66%, 40%, 1)', 'hsla(0, 77%, 50%, 1)')
 var o2 = dot(122, 'hsla(0, 55%, 60%, 1)', 'white', 'inline-flex')
 o2.appendChild(center)
 swtch(center, !Boolean(p.value), shoot) 
 
 function shoot(gate){
  cb(gate)
  window.requestAnimationFrame(function(){
    if(gate) o2.style['-webkit-filter'] = 'hue-rotate(130deg)'
    else o2.style['-webkit-filter'] = 'hue-rotate(0deg)'
  })
 }
 return o2

}


function dot(d, c, bg, dis){
  var circle = document.createElement('div')
  circle.style.width = circle.style.height = d + 'px'
  circle.style.border = 55 / Math.log(d*2) + 'px solid ' + c
  circle.style.backgroundColor = bg
  circle.style.boxSizing = 'border-box'
  circle.style.borderRadius = '50% 50%'
  circle.style.display = dis || 'inline'
  if(dis){
    circle.style.alignItems = 'center'
    circle.style.justifyContent = 'center'
  }
  return circle

}
