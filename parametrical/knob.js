var spin = require('../uxer/spinx')

module.exports = function(param, cb){
  if(param === undefined) param = function(){}
  if(typeof param === 'function'){
    cb = param
    param = {}
  }
  var knob = param.el || createKnob()
  if(param.style){
    for(var style in param.style){
      knob.style[style] = param.style[style]
    }
  }

    var amplitude = 0
    spin(knob, function(_delta, a){
    //console.log(_delta, a)
      //console.log(total * 180 / Math.PI)
      amplitude = amplitude + -_delta 
      cb(-_delta, amplitude / Math.PI / 2)
      ;(function(el, _delta){
        window.requestAnimationFrame(function(){
          el.style.transform = 'rotateZ('+ (2 * amplitude * 180 / Math.PI ) + 'deg)'
      })})(knob, _delta)
    })
    

  return knob

}

function createKnob(){
  var circle = document.createElement('div')
  circle.style.width = circle.style.height = '122px'
  circle.style.border = '13px solid black'
  circle.style.boxSizing = 'border-box'
  circle.style.borderTopColor = 'yellow'
  circle.style.borderRadius = '50% 50%'
  circle.style.display = 'inline-block'

  return circle

}
