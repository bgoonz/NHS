var vae = require('./autoencoder')
var tf = require('@tensorflow/tfjs')

import {MnistData} from './mnist_data'

var data
var batchSize = 10000
async function train(){

  console.log("begin")
  
  var model = vae([512, 128, 32], [32, 128, 512, 784], [784], 'sigmoid')

  model.compile({
    loss: 'meanSquaredError',
    optimizer: tf.train.sgd(.15) 
  })

  var batch = data.nextTrainBatch(1000)

  var log = console.log
  var result = await model.fit(batch.xs, batch.xs, {batchSize: batchSize, epochs: 32, verbose: false,
    callbacks: {
      onTrainEnd: function(){log(tf.memory())}
    },
    validationSplit: .5
  })

  console.log(result.history)
/*
  var encoder = tf.model({inputs: model.model.input, outputs: model.getLayer('Z_UNIT').output})

  var Zenc = encoder.predict(batch.xs)
  var Recon = model.predict(batch.xs)

  var testex = batch.xs.shape[0]


  var abstract
*/
}

async function load(){
  data = new MnistData()
  await data.load()
}

async function go(){
  await load()
  await train()
}

go()
