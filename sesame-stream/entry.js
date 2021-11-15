var websocket = require('websocket-stream')
var Time = require('since-when')
var Model = require('scuttlebutt/model');
var model = new Model();
var stream = websocket('ws://localhost:'+window.location.port+'?type=share,ticktock&interval=3000', {autoDestroy: false})
console.log(stream)
stream.on('data', function(data){
//  if(!(typeof data == 'string')) data = new Buffer(new Uint8Array(data)) 
  console.log(Boolean(data))
})
var b = new Buffer('string o data')
var a = new Float32Array(4)
a[0] = 1
a[1] = 2
a[2] = 3
a[3] = 4

var c = {type: 'share', data: b, a: new Buffer(a)}
setInterval(function(){
    stream.write(null)
//  stream.write(new Buffer(JSON.stringify(c)))
}, 1000)
