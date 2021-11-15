var tf = require('@tensorflow/tfjs')

module.exports = function(decode_units, input_shape, activation){

  // input = batchNormalized(autoencoded(input), .5, .5) or somewhere above zero min (non negative signal)
  // denormalize before output and loss measure? 
  
  activation = activation || 'sigmoid'

  var input = tf.input({batchShape: [null, input_shape[0]]})

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

      
    }

  }

  var model = tf.model({input: input, output: decoder })

  return model

}
