var uuid = require('uuid').v4

var knob = require('./knob')
var xyify = require('./xy')
var button = require('./button')
var bpm = require('./bpm')
var shot = require('./shot')
var amod = require('./amod')
var eezy = require('./eezy')
var bezier = require('./bezier')

module.exports = parama 

function parama(pms, cb){

  
  if(!cb) cb = function(){}
  
  return paramaTheMapper(pms, cb)

  function paramaTheMapper(pms, cb){
    var state = {}
    var keys = Object.keys(pms)

    // map keys 
    var ui = keys.map(function(key,i){
      
      if(typeof pms[key] === 'number'){
        var val = pms[key]
        pms[key] = {name: key, value: val, type: 'dial'}
      }

      conf(pms[key], key)
      
      var e = pms[key]
      
      state[key] = e.value || null

      var el = undefined
      switch(e.type){
        case 'eezy':
        case 'adsr':
        case 'env':
          if(state[key] === 1) state[key] = e.value = [[0,0], [1/4, 1], [3/4, 1/2], [1,0]]
          el = eezy(e, function(curves){
            state[key] = curves
            cb(state[key], e.name || key)
          })
        break
        case 'amod':
          if(state[key] === 1) state[key] = e.value = [[0,0], [1/4, 1], [3/4, 1/2], [1,0]]
          el = amod(e, function(curves){
            state[key] = curves
            cb(state[key], e.name || key)
          })
        break
        case 'bezier':
          if(state[key] === 1) state[key] = e.value = [[0,0], [1/4, 1], [3/4, 1/2], [1,0]]
          el = bezier(e, function(curves){
            state[key] = curves
            cb(state[key], e.name || key)
          })
        break
        case 'shot':
          el = shot(e, function(_switch){
            state[key] = _switch ? e.true : e.false
            cb(state[key], e.name || key)
          })
          break
        case 'bpm':
          el = bpm(e, function(bpm, interval){
            state[key] = bpm
            cb(state[key], e.name || key)
          })
          break
        case 'button':
          el = button(e, function(_switch){
            state[key] = _switch ? e.true : e.false
            cb(state[key], e.name || key)
          })
        break
        case 'knob':
        case 'dial':
          var fn = e.step === false ? satoshi : stepper
          el = knob(e, function(d, a){
            state[key] = Math.max(e.min, Math.min(e.max, fn(d, a)))
            cb(state[key], e.name || key)
          })
          function stepper(d, a){
            return e.value + Math.floor(a * e.mag) * e.step
          }
          function satoshi(d, a){
            return state[key] + d / Math.PI / 2 *  e.mag          
          }
        break;
        case 'xy':
        case 'grid':
          state[key] = e.value || [0,0]
          el = xyify(e, function(xy){
            var xr = e.range[2] - e.range[0]
            var yr = e.range[3] - e.range[1]

            var x = (xy[0] - .5) * xr
            var y = (xy[1] - .5) * yr
            x = Math.max(e.range[0], Math.min(e.range[2], x))
            y = Math.max(e.range[1], Math.min(e.range[3], y))
            state[key][0] = x
            state[key][1] = y
            cb(state[key], e.name || key)
          }) 
        break
      }
      e['uuid'] = uuid()
//      Object.assign(el.dataset, e)
      return el
    })
    ui.state = state
    return ui
  }
  
}


function conf(p, key){
  if(!p.type) p.type = 'knob'
  if(p.value === undefined) p.value = null 
  if(!p.mag) p.mag = 1
  if(!p.max) p.max = Infinity
  if(!p.min) p.min = -Infinity
  if(!p.name) p.name = key //+ '_lamda'
  if(!p.step) p.step = false
  if(!p.true) p.true = true
  if(p.false === undefined) p.false =  false
}
