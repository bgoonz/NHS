var emitter = require('events').EventEmitter
var uuid = require('uuid').v4

var conx = new Array(10)
var count =1000
for(var x = 0; x < conx.length; x++) conx[x] = []
for(var x = 0; x < count; x++) {
  var e = new emitter
  e.id = 'node' + x
  e.setMaxListeners(0)
  e.cx = []
  e.loops = []
  conx[0][x] = e
}

var nodes = conx[conx.length - 1]

makeConx(0)
//console.log(nodes)

//console.log(nodes[Math.floor(nodes.length * Math.random())].cx.length)
//  we now have 1000 emitters each connected to a random 20 other emitters

var tail = 20
start()
function start(){
  nodes.forEach(function(node){
    node.cx.forEach(function(e){
      var msg = {}
      msg.id = uuid()
      msg.path = []
      msg.path.push(node.id)
      msg.data = []
      e.emit(node.id, msg)
    })
  })
}

function listen(a,b){
  a.on(b.id, function(m){
    // message is an array of connected nodes, in order of connection
    // ie, a path
    // if a.id is in m, a loop has formed
    // loops may be useful
    // store the loop for now, and terminate that path
    var loop = m.path.indexOf(a.id)
    if(m.data.length > 0){}
    else if(loop >  -1) {
      a.loops.push(m)
      //console.log(loop, m, a.id ,b.id)
    }
    else{
      m.path.push(a.id)
      a.cx.forEach(function(e){
        if(e.id === b.id){
          //console.log(a.id, b.id, e.id)
          return
        }
        else {
          setTimeout(function(){e.emit(a.id, m)}, Math.random * 1000)
        }
      })
    }
  })
}

function makeConx(i){
  if(i === conx.length - 1) return
  while(conx[i].length > 1){
    var s = conx[i][0]
    var r = pickrando(conx[i], 0)
    var f = conx[i][r]
    if(s.cx.indexOf(f.id) > -1){
      if(conx[i].length === 2) conx[i+1] = conx[i + 1].concat(conx[i].splice(0,2))
      continue
    } 
    s.cx.push(f)
    f.cx.push(s)
    listen(s, f)
    listen(f, s)
    conx[i].splice(r, 1)
    conx[i].shift()
    conx[i+1].push(s, f)
  }
  i++
  makeConx(i)
}

function  pickrando(arr, i){
  var l = arr.length
  var r = Math.floor(l * Math.random()) 
  return r === i ? pickrando(arr, i) : r 
}




