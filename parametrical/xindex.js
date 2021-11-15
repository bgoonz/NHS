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

function paramify(el){

  var dummy = document.createElement('div')
  dummy.innerHTML = controlBox
  cBox = dummy.firstChild
  el.appendChild(cBox)
  
  return function(params){
 
    var keys = Object.keys(params)

    var p = copyObject(params, {})

    keys.forEach(function(key, i){
      var val = params[key].value
      switch(params[key]['type']){
        case 'button':
        case 'switch':
          dummy.innerHTML = switcher;
          var box = dummy.firstChild
          cBox.appendChild(box);
          var knob = box.getElementsByClassName('switch')[0]
          knob.classList.add(val ? 'on' : 'off') 
          params[key].value = observe(params[key].value)
          //params[key](p[key]['value'])
          params[key].el = knob
          var d
          if(d = params[key].diameter){
            box.style.height = 
            box.style.width = d + 'px'
            box.style.margin = d / 10 + 'px'
          }
          Switch(knob, val)
          knob.addEventListener('liftoff', function(){
            knob.classList.remove('active') 
          }) 
          knob.addEventListener('touchdown', function(){
            knob.classList.add('active') 
          }) 
          knob.addEventListener('switch', function(evt){
            var gate = evt.detail
            knob.classList.remove((gate) ? 'off' : 'on') 
            knob.classList.add((gate) ? 'on' : 'off') 
            params[key].value(gate)
          })
        break;
        
        case 'dial':
        default:
          dummy.innerHTML = dial;
          var xdial = dummy.firstChild
          cBox.appendChild(xdial);
          var knob = xdial.getElementsByClassName('knob')[0]
          //params[key] = params[key].value
          params[key].value = observe(val)
          params[key].el = knob
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
            console.log(evt.detail.delta)
            var self = this;
            rqf(function(){
              self.style['-webkit-transform'] = 'rotateZ('+(self.spinDegree)+'deg)'  
          //    params[key].value(p[key].value)
            })
          })
        break;
      }



      cBox.appendChild(dummy.firstChild)    
    })
      
      return params

  }

}


function copyObject(a,b){

    for(var x in a){

      b[x] = a[x]

    }

    return b

}
