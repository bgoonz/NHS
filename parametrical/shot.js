var swtch = require('uxer/shot')

module.exports = function(p, cb){

 var center = dot(44,  'hsla(0, 77%, 50%, 1)', 'hsla(0, 77%, 50%, 1)')
 var o1 = dot(88, 'hsla(0, 66%, 50%, 1)', 'white', 'flex')
 var o2 = dot(122, 'hsla(0, 55%, 60%, 1)', 'white', 'inline-flex')
 o1.appendChild(center)
 o2.appendChild(o1)
 var on = false
 swtch(o2, shoot)
 swtch(o1, shoot)
 swtch(center, shoot)
 
 function shoot(gate){
  on = !on
  cb(on)
  window.requestAnimationFrame(function(){
    if(on) o2.style['-webkit-filter'] = 'hue-rotate(130deg)'
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
  circle.style.display = dis || 'inline-block'
  if(dis){
    circle.style.alignItems = 'center'
    circle.style.justifyContent = 'center'
  }
  return circle

}
