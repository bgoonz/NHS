var through = require('through')
var duplex = require('duplex')
var fs = require('fs')

var breakage = through(function(data){
    console.log(data)
})

var a = duplex(function(data){
  console.log(data)
})

var b = through(function write(data){
  this.emit('data', data)
})

var c = through(function write(data){
  var file = fs.createReadStream('./index.js', 'uft8')
  var self = this;
  file.on('data', function(data){
    self.emit('data', data.toString('utf8'))
  })
})

var d = through(function write(data){
  this.emit('data', 'I could be streaming data from the database')
})

a = breakage

// connext duplex to multiple streams
// each of which pipes data back to the duplex
// in longhand:

a.pipe(b).pipe(a)
.pipe(c).pipe(a)
.pipe(d).pipe(a)

// write to the duplex stream
//a.emit('data', 3)
a.write(3)
