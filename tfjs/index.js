let tf = require('@tensorflow/tfjs')
Math.random = require('math-random')

window.tf = tf

const i = tf.input({shape: [32]});
const d = tf.layers.dense({units: 3, activation: 'softmax'});
const o = d.apply(i);

const x = tf.input({shape: [32]});
const y = tf.layers.dense({units: 3, activation: 'softmax'}).apply(x);

/*
let a = tf.tensor([[1,2,3,4],[5,6,7,8]])
let b = tf.tensor([.5, .5,], [2,1])
a.print()
b.print()
console.log(a.transpose().shape)
a.transpose().matMul(b).print()
*/
