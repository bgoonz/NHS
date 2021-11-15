const tf = require('@tensorflow/tfjs')


testing = true

if(testing){
  window.tf = tf
  /*
  var s = 10 
  var eye = tf.eye(s).mul(tf.scalar(1))
  eye = eye.matMul(createRollMatrix(s, -1))
  eye.print()
  eye = tf.batchNormalization(eye,tf.zerosLike(eye), tf.onesLike(eye).mul(tf.tensor([1])))//.print()
  eye.print()
  var bb = orthoNormal({shape:[12,12], mean:1, dev:2}) 
  var bbb = orthoUniform({shape: [6, 12], min:-1, max:1})
  console.log(b)
  b.print()
  bb.print()
  bbb.print()
  let c = b.slice([0,0],1)
  let d = bb.slice([1,0], 1)
  let e = bbb.slice([2,0], 1)
  d.print()
  c.print()
  c.dot(d.transpose()).print()
  e.matMul(c.transpose()).print()
  d.matMul(e.transpose()).print()
  */
  var b = orthoTruncated({shape: [2,12], mean:1, dev:2}) 
  b.print()
  b.transpose().print()
  let i = 1, j = 4, k = 2, l = 8 
  var t = tf.stack([tf.ones([i,j],'float32'), tf.reshape(tf.linspace(0, 1, 4), [i,j])],0).squeeze()
  console.log(t)
  var x = orthoNormal({shape: [j,l]})//.print()
  var y = orthoNormal({shape: [j,l]})//.print()
  x.print()
  y.print()
  t.print()
  //x = tf.concat([y, x], 1)
  x.print()
  tf.matMul(t ,x ).print()
}



// ex: input will be 256 samples + time, topology will be default with array of dense unit layers
// and for experiments, the latent_spacetime is known, shared across distributed and disparate training sessions
// noting that an evolutionary algorithm for possibly finding latent_spacetime that is somehow better adoapted to the whole
// and then there is the study of comparative spacetimes, to see what's out there

var ortholizers = {orthoUniform, orthoTruncated, orthoNormal}

let input_shape = [2, 256] // first row is signal, second is time, this is a 2d flattened [1,256,2]
let topology =  [1024, 512, 256, 128, 64, 32, 16]
// it seems like the first should be bigger than input_shape[1]
// or maybe don't use orthos all the way?  only beginning and end? or only end?

// try first one filter for both the signal and time (to correlate them), ergo one dimension of 2d output instead of [16,16, 2]
let latent_spacetime = orthoNormal({shape: [16, 16]})

let elTopo = vaejs({input_shape, topology, latent_spacetime})
var xt = tf.ones(input_shape)
var {out, pre} = elTopo(xt)
pre.print()
out.print()

function vaejs({input_shape, topology, latent_spacetime}){
  // an array of functions, or a reduce into a fancy fuction?
  var lastOutput = input_shape[1] 
  var topo = topology.reduce((a,e,i,o) => {
    let units = e
    let shape = [lastOutput, e] 

    // if the the unit size is larger than the last output
    // expand the dimensionality through orthogonal space
    // else use a regular random weight... why not?
    var tensor
    if(lastOutput < e) tensor = orthoNormal({shape})
    else tensor = randomNormal({shape}) // createDenseOrthogon({shape})
    lastOutput = e
    let fn = a
    return function(input){
      var output = fn(input)
      return output.matMul(tensor)
    }}, function(input){
      return input
  })    

  return function(input){
    let pre = topo(input)
    let out = pre.matMul(latent_spacetime)
    return {out, pre}
  }

}


async function nextTick(fn){ await tf.nextFrame(); fn()}




//¿ cruel and unnecessary abstraction ?
function createDenseOrthogon({shape, init='orthoNormal', min=-1, max=1, mean=0, dev=1, dtype='float32'}){
  return ortholizers[init](arguments)
}

function orthoUniform({shape, min=-1, max=1, type='float32'}){
  return tf.linalg.gramSchmidt(tf.randomUniform(shape, min, max, type))
}

function orthoTruncated({shape, mean=0, dev=1, type='float32'}){
  return tf.linalg.gramSchmidt(tf.truncatedNormal(shape, mean, dev, type))
}

function randomNormal({shape, mean=0, dev=1, type='float32'}){
  return tf.randomNormal(shape, mean, dev, type)
}

function orthoNormal({shape, mean=0, dev=1, type='float32'}){
  return tf.linalg.gramSchmidt(tf.randomNormal(shape, mean, dev, type))
}

function createRollMatrix(s, t){

  return roll(s, t)

  function roll(s, t){ 
    l = s * s
    var one = t > 0 ? rollRightOne(l) : rollLeftOne(Math.abs(l))
    var rm = tf.eye(Math.sqrt(l))
    for(var x = 0; x < Math.abs(t); x++){
       rm = tf.matMul(rm, one)
    }
    return rm
  }

  function rollLeftOne(l){
    var a = new Float32Array(l)
    var n = Math.sqrt(l)
    a.fill(0)
    a.forEach((e,i,a) => (i - n) % (n + 1) === 0 ? a[i] = 1 : a[i] = 0)
    a[n - 1] = 1
    return tf.tensor(a, [n,n], 'float32')
  }

  function rollRightOne(l){
    var a = new Float32Array(l)
    var n = Math.sqrt(l)
    a.fill(0)
    a.forEach((e,i,a) => (i - 1) % (n + 1) === 0 ? a[i] = 1 : a[i] = 0)
    a[l - n] = 1
    return tf.tensor(a, [n,n], 'float32')
  }

}
