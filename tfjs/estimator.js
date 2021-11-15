var tf = require('@tensorflow/tfjs')
var binome = require('binomial')
var normalize = require('normalize-time')

module.exports = approximator

function approximator(signal, sampleRate, degree, type){
  if(!type) type = Float32Array
  
}


function timeStack(sampleRate, length, degree, type){

  if(!type) type = Float32Array
  var duration = sampleRate * length
  if(!(duration === 1)){
    var nerm = normalize(0, duration)
    var t = new type(duration).map((e,i) => nerm(i / sampleRate))
  }
  else var t = new type(duration).map((e,i) => i / samplerate)
  
  var time = tf.tensor(t, [duration, 1])
  var ntime = tf.scalar(1).sub(time)

  var bi = Array(degree + 1).fill(0).map((e,i) => binome.get(degree, i))
  var one = tf.tensor([1], [1,1])
  var d = tf.scalar(degree) 
  var timestack = []
  for(var x = 0; x <= degree; x++){
    var sx = tf.scalar(x)
    var control_point = ntime.pow(d.sub(sx)) // lazy, o
    var cp = control_point.mul(time.pow(sx)) // not perfectly efficient because x = 0 & time.pow = 1 && x = degree & ntime.pow = 1
    if(x > 0 && x < degree) cp = cp.mul(tf.scalar(bi[x])) // else bi = 1
    ctrls.push(cp)
  }
  timestack = tf.concat(timestack, 1)
  return timestack
}

let a = tf.tensor([[1,2,3,4],[5,6,7,8]])
let b = tf.tensor([.5, .5,], [2,1])
a.print()
b.print()
console.log(a.transpose().shape)
a.transpose().matMul(b).print()
