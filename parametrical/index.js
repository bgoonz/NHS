var observe = require('observable')

var spin = require('../uxer/spin')
var Switch = require('../uxer/switch')

var raf = require('./raf.js')

var appendCSS = require('./appendCSS')

var fs = require('fs')
var controlBox = fs.readFileSync(__dirname + '/public/controls.html', 'utf8')
var dial = fs.readFileSync(__dirname + '/public/dial.html', 'utf8')
var switcher = fs.readFileSync(__dirname + '/public/switch.html', 'utf8')
var css = fs.readFileSync(__dirname + '/public/controls.css', 'utf8')

appendCSS(css)

module.exports = paramify

function paramify(params, el){

  var dummy = document.createElement('div')
  dummy.innerHTML = controlBox
  cBox = dummy.firstChild
  console.log(el)
  el.appendChild(cBox)
  
  var keys = Object.keys(params)

  var p = copyObject(params, {})

  keys.forEach(function(key, i){
    switch(p[key]['type']){
      case 'switch':
        dummy.innerHTML = switcher;
        var xdial = dummy.firstChild
        cBox.appendChild(xdial);
        var h4 = xdial.getElementsByClassName('pname')[0]
        var input = xdial.getElementsByClassName('pvalue')[0]
        var knob = xdial.getElementsByClassName('switch')[0]
        h4.textContent = params[key].name
        input.value = input.textContent = p[key].value ? 'on' : 'off' 
        params[key] = observe()
        params[key](p[key]['value'])
        Switch(knob)
        knob.addEventListener('switch', function(evt){
          var gate = evt.detail
          input.value = input.textContent = gate ? 'on' : 'off' 
          params[key](gate)
        })
      break;
      
      case 'dial':
      default:
        dummy.innerHTML = dial;
        var xdial = dummy.firstChild
        cBox.appendChild(xdial);
        var h4 = xdial.getElementsByClassName('pname')[0]
        var input = xdial.getElementsByClassName('pvalue')[0]
        var knob = xdial.getElementsByClassName('knob')[0]
        h4.textContent = params[key].name
        input.textContent = params[key].value
        //params[key] = params[key].value
        params[key] = observe()
        params[key](p[key]['value'])
        spin(knob)
        knob.spinDegree = 0;
        var rqf = raf();
        var x;
        knob.addEventListener('spin', function(evt){
          x = p[key].value += ((evt.detail.delta / 360) * p[key].gain)
          window.getSelection().removeAllRanges()
          x = Math.min(p[key].max, x)
          x = Math.max(p[key].min, x)
          p[key].value = x
          this.spinDegree += evt.detail.delta
          var self = this;
          rqf(function(){
            self.style['-webkit-transform'] = 'rotateZ('+(self.spinDegree)+'deg)'  
            params[key](p[key].value)
            input.textContent = p[key].value.toFixed(3)
          })
        })
      break;
    }



    cBox.appendChild(dummy.firstChild)    
  })
    
    return params

}


function copyObject(a,b){

    for(var x in a){

      b[x] = a[x]

    }

    return b

}
