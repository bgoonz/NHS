var fs = require('fs')
var $ = require('../various/utils.js')
var {dense, rnn, conv} = require('../various/topo.js')
const tf = $.tf
var data = require('./server.js')
//  training variables
var batch_size = 1 
var epochas =5 
var scale = [640/2,480/2]
var pix = scale[0] * scale[1]
var channels = 1
var feedback = 14*2
var train_frames = 20400
var test_frames = 10798
var fps = 20
var bytes = pix * 2
var conv1_input_shape = [batch_size, 640, 480, 1]

var layers = [
  {size: 2, depth: 64, pool: {fn: tf.maxPool, size: 5, strides: 5}, id:'c1', activation: 'sigmoid'},
  {size: 4, depth: 32, pool: {fn: tf.maxPool, size: 1, strides: 1}, id:'c2', activation: 'tanh'}, // now 64 * 48
  {size: 16, depth: 1, strides: [8,8], id: 'c3', activation: 'relu'} // 8 * 6
]

var factor = dense({input_shape: [batch_size * feedback, 6 * 8], layers:[{size: 256, depth:4, id:'d11', activation: 'relu'}, 
 ]}) 

var conv1 = conv({input_shape:conv1_input_shape, layers: [layers[0]]})
var conv2 = conv({input_shape:[batch_size, 64, 48, 64], layers: [layers[1]]})
var conv3 = conv({input_shape:[batch_size, 64, 48, 32], layers: [layers[2]]})

var mask = $.variable({shape: scale.concat([channels]), init: 'ones', id: 'mask'})

var rate = .001
var optimizer = tf.train.adam(rate)
var min = [3]
var last = 6
var best = 6 
var losses = Array(30).fill(0).map(e => last)
//run(false, ()=> process.exit())
go()

function go(){
  tf.tidy(()=>train(lcb))
}

var era = 0
function lcb(loss){
//  factor.regularize()
//  conv1.regularize()
  losses.push(loss)
  loss = losses.reduce((a, e) => a + e, 0) / losses.length
  if(loss < best){
    best = loss
//    factor.save()
//    conv1.save()
//    conv2.save()
//    mask.saver()
  }

  if(losses.length == 31) losses.shift()
  console.log('average loss %d end of era: ' + (++era), loss)
  //if(era % 10 == 9) console.log(JSON.stringify(tf.memory()))
  
  if(era == 9000) setTimeout(()=>process.exit(), 333)
  else{
    if(loss > min[0]) go()
    else if(loss < min[0]){
      run(false, () => {
        min.shift() 
        console.log(min)
        if(min[0]) go()
        else process.exit()
      })
    }
  }
}
function run(train, cb){
  var set = train ? 'getTrainBatch' : 'getTestBatch'
  var file = fs.createWriteStream('./' + set + '.'+min[0]+'.txt')
  var fc = train ? train_frames : test_frames
  var size = train ? 25 : 25
  var frameStart = 0
  var losses = []
  var results = []
  var loadnext = data.getTestBatch({size: size, train, scale, pixfmt: 'gray16le'}, ready) 
  
  function ready(rd){
    var d = rd()
    var gc = []
    var load = new Float32Array(d[0].length / 2).fill(0).map((e, i)=>{
      return d[0].readInt16LE(i * 2)
    })
    //console.log(d[0].length, load.length / bytes * 2 )
    var set = []
    for(var i = 0; i < load.length / bytes * 2; i ++){
      var j = 0
      var copy = $.scalar(0)
        var img = load.slice((i + j) * pix * channels, (i + j) * pix * channels + pix * channels)
        //console.log(i, j,img.length)
        //  console.log(img.length, scale.concat([channels]), i, j)
        var tensor = tf.tensor(img, scale.concat([channels]), 'float32')//.toFloat()//.div($.scalar(Math.pow(2,16)-1))
        gc.push(tensor)
        set.push(tensor)
      //set = tf.concat(set, 1)
      //console.log(set)
      //batch.push(set)
    }
    //console.log(labels)
    //console.log(batch)
    batch = tf.stack(set, 0)
    //console.log(batch)
    var t = 0
    var result = feed_fwd(batch, true, size).sum(1)
    //result.sum(1).print()
    file.write(new Buffer(result.dataSync().join('\n') + '\n', 'utf8')) 
    gc.push[set]
    gc.push(batch, result)
    tf.dispose(gc)
    var mas = loadnext()
    if(!mas) cb()
  }
}

function train(cb){
  var gc = []
  data.getTrainBatch({size: batch_size * feedback, scale, pixfmt: 'gray16le'}, d => {
//    console.log(new Int8Array(d[0]).length/(25*100), d[1].length)
    var load = new Float32Array(scale[0] * scale[1] * channels * feedback).fill(0).map((e, i)=>{
      return d[0].readInt16LE(i * 2)
    })
    var labels = tf.tensor(d[1], [d[1].length, 1], 'float32')
    var set = []
    for(var i = 0; i < batch_size; i ++){
      var copy = $.scalar(0)
      for(var j = 0; j < feedback; j++){
        var img = load.slice((i + j) * pix * channels, (i + j) * pix * channels + pix * channels)
        //console.log(i, j,img.length)
        //  console.log(img.length, scale.concat([channels]), i, j)
        var tensor = tf.tensor(img, scale.concat([channels]), 'float32')//.toFloat()//.div($.scalar(Math.pow(2,16)-1))
        gc.push(tensor)
        set.push(tensor)
      }
      //set = tf.concat(set, 1)
      //console.log(set)
      //batch.push(set)
    }
    //console.log(labels)
    //console.log(batch)
    batch = tf.stack(set, 0)
    //console.log(batch)
    var t = 0
    gc.push[set]
    while(t < epochas){
      var loss = 0//$.scalar(0)
      tf.tidy(()=>{
        l = optimizer.minimize(function(){
          var result = feed_fwd(batch, true, batch_size * feedback).sum(1)
          var loss = tf.losses.meanSquaredError(labels.squeeze(), result)//.asScalar()
          d.push(result, loss)
          if(t == epochas - 1) {
            //labels.print()
            //result.print()
            //loss.print()
          }
          return loss
        }, true)
        t+=1
        loss = l.dataSync()[0]
        //gc.push(l)
        //console.log('epocha ' +  t + ' loss: ' +  loss)
      })
    }
    gc.push(batch, labels)
    tf.dispose(gc)
    gc = []
    //console.log(batch)
    cb(loss)
    
  })


/*
      //console.log(`\ntf memory is ${JSON.stringify(tf.memory())}`)
      console.log(`average loss after epoch ${(x+1)}:`)
      console.log(_loss.div($.scalar(batch.length)).dataSync()[0] + '\n')
*/
}


function feed_fwd(input, train, size){

  //input = tf.avgPool(input, 5, 5, 'same')
  return tf.tidy(() => {
    var masked = input.mul(mask.layer)
    var features = conv1.flow(masked, train)
    var res = features.add(tf.avgPool(masked, [5,5], [5,5], 'same'))
    var c2 = conv2.flow(res, train)
    //var res2 = c2.sub(tf.mean(res, 3).expandDims(3))//tf.avgPool(res, [8,8], [8,8], 'same'))
    var c3 = conv3.flow(c2, train)
  //c = tf.maxPool(c, 4, 4, 'same')
  //  features.squeeze().print()
  //  console.log(c)
    return factor.flow(c3.squeeze().reshape([size, 8 * 6]), train)
  })
  // flatten for dense layers
  //conv = conv.reshape([size || batch_size, input_shape[1]])

  //var encoding = encoder.flow(conv, train) 
}

function test(input){

  var batch = []
  var labels = []
  mnist.resetTest()
  var correct = 0
  var wrong = 0
  for(var x = 0; x < test_count; x++){
    var d = mnist.nextTestBatch(1)
    batch.push(d.image)
    labels.push(d.label) 
  }
  console.log('\n***************************  TESTING  ************************************\n')
  
  batch.forEach((input, i) => {
    tf.tidy(()=>{
    var {encoding} = feed_fwd(input, false, 1)
    let loss = tf.losses.softmaxCrossEntropy(labels[i], encoding)
    let p = tf.argMax(encoding, 1).dataSync()[0]
    let a = tf.argMax(labels[i], 1).dataSync()[0]
    if(p==a) correct++
    else wrong++
//    let m = `precidicted: ${p} \nactual: ${a}\nloss:${(tf.mean(loss).dataSync()[0])}` 
//    console.log(m)
  //  encoding.print()
  //  labels[i].print()
  //  tf.mean(loss).print()
  })
  })
  console.log(`correct: ${correct}, wrong: ${wrong}, percentage: ${(correct/(correct+wrong)*100)}`)
  console.log('\n\n\n')
}

