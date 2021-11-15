var offsetter = require('../offsetter')
var trig = require('./trig')

var p2 = Math.PI / 2

module.exports = function(radius, center, pt){
  var offset = offsetter([window.innerWidth / 2, window.innerHeight / 2])
  var reset = offsetter([0 - (window.innerWidth / 2), (window.innerHeight / 2)])
//  var reset = offsetter([0, 0])
  center = offset(center)
  pt = offset(pt)
  var distance = trig.distance(center, pt)
  var dr = distance / radius

  var angle = Number(trig.angle(center, pt).toFixed(7))
  var x = center[0] + radius * Math.cos(angle)
  var y = center[1] + radius * Math.sin(angle)
  x = Number(x.toFixed(7))
  y = Number(y.toFixed(7))
  var a2t = angle + p2// (angle >= 0 ? - p2 : p2)// (p2 - (p2 * (1/dr)))
  var na2t = angle - p2 //(angle >= 0 ? - p2 : p2) // (p2 - (p2 * (1/dr)))
  a2t = Number(a2t.toFixed(7))
  na2t = Number(na2t.toFixed(7))
  var tangents = [[],[]]
//  center = reset(center)
  tangents[0][0] = center[0] + radius * Math.cos(a2t)
  tangents[0][1] = center[1] + radius * Math.sin(a2t)
  tangents[1][0] = center[0] + radius * Math.cos(na2t)
  tangents[1][1] = center[1] + radius * Math.sin(na2t)
  tangents[0] = reset(tangents[0])
  tangents[1] = reset(tangents[1])


  return {angle: angle, secant: [x, y], a2t: a2t, tangents: tangents}

  //console.log(angle, x, y, '/\n', a2t, ax, ay)

}
