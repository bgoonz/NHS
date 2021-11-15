var oz = require('oscillators')
var waves = Object.keys(oz)
var $ = exports
const _p = 0
waves.forEach(function(e){
  $[e] = function(t, f, p){
    var tt = 1 / f / 2 * (1 - p)
    return oz[e](t + tt, f)
  }
})

