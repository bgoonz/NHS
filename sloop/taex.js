var Sampler = require('./sloop')
var buf = new Int8Array(4)
buf[0] = 1
buf[1] = 2
buf[2] = 3
buf[3] = 4

var start = 0 // buf index to start
, byteSize = 1 // size of each sample in bytes
, duration = 4 // length of loop in samples (not bytes)
;

sample = Sampler(buf, 0, duration, byteSize)

var t = setInterval(
    function(){
	console.log(sample()[0])
    }, 333)
