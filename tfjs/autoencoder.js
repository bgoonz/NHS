var tf = require('@tensorflow/tfjs')

module.exports = function(decode_units, encode_units, input_shape, activation){

  activation = activation || 'sigmoid'

  var input = tf.input({batchShape: [null, input_shape[0]]})

  var z = decode_units.pop() // tail value is size of abstract components (aka latent variables)
  var size = z
  z = [z,z] // two tensors for mean and stdev 

  var params = {
    activation: 'sigmoid',
    useBias: false,
    kernalinitializer: tf.initializers.randomUniform({
      maxval: 1,
      minval: -1
    })
  }

  var decoder = decode_units.reduce((a, e) => {
    var p = Object.assign({}, params)
    p.units = e
    var dense = tf.layers.dense(p).apply(a)
    return dense
  }, input)

  z = z.map(e => {
    var p = Object.assign({}, params)
    p.units = e
    var dense = tf.layers.dense(p).apply(decoder)
    return dense
  })

  class KL extends tf.layers.Layer{
    constructor(z, inp, oup){
      super({})
      this.stuff = {z, inp, oup}
    }

    computeOutputShape(inp){
      return [inp[0], inp[1], inp[2], inp[3] * 2]
    }

    call(inps, kwargs){
      this.involeCallHool(inps, kwargs)
      var z_mean = z[0]
      var z_sdv = z[1]
      var norm = tf.randomNormal([size])
      var sample = z_mean.add(tf.exp(z_sdv).mul(norm))

      
    }
    getClassName(){
      return "KL Divergance"
    }
  }

  
  var encoder = encode_units.reduce((a, e) => {
    var p = Object.assign({}, params)
    p.units = e
    return tf.layers.dense(p).apply(a)
  }, sample)
  
  var model = tf.model({input: input, output: encoder })

  return model

}
