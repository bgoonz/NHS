var fs = require('fs')
var falafel = require('falafel')
var observe = require('observable')
var jsynth = require('jsynth')

var master = new AudioContext

var knob = require('./knob')

var script = fs.readFileSync('./synth.js', 'utf8')

var f32 = undefined
var nodes = []

var fn = new Function('', script)

fn = falafel(fn, function(node){
  if(node.type === 'Literal'){
    if(!isNaN(node.value)){
      var l = nodes.length
      var spinner = knob(function(d,a){
        d = -d
        f32[l] = f32[l] + d / Math.PI / 2 * 12
//        update()
      })
      nodes.push([node.value, spinner])
      node.update('f32['+l+']')
    }
  }
})

f32 = new Float32Array(nodes.length)

nodes.forEach(function(e,i){
  f32[i] = e[0]
  document.body.appendChild(e[1])
})

fn = new Function('f32', 'return '+fn.toString()+'()')(f32)
var dsp = function(t,s,i){
  //if(t % 1 ===0) console.log(fn(t))
  return fn(t)
}
function update(){
  nodes = []
  var f = new Function('', script)
  f = falafel(f, function(node){
    if(node.type === 'Literal'){
      if(!(isNaN(node.value))){
        var i = nodes.length
        nodes.push([node.value, null])
        node.update(f32[i])
      }
    }
  })
  console.log(f.toString())
  f = new Function('f32', 'return '+f.toString()+'()')(f32)
  fn = f 
}
var synth = jsynth(master, dsp)
synth.connect(master.destination)
console.log(fn.toString())


/*
  notes: 
  * an "Expression statement" is a reference to a previously defined variable
  * * if it's expression.type is CallExpression, it's a function, and we may want paramif it's arguments
  * * if it's expression.type is AssignmentExpression, it's math, and  
  * "BinaryExpressions" are math, and will have right and left members, which will fork down FIOL style
  * * look for CallEspressions, and literals, within
  * * note that a binary expression "1 / 2" can be interpreted by the UI as a ratio


  things could and could not do:
  * mess with any expressionStatement that is an argument of it's context function
  * check to make sure a variable is referenced in a tree leading up to the return, before paramifying it (uhm....)

*/
