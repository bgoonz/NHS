var Sampler = require('./sloop')
var buf = new Buffer('beepboopbaapboom')

var start = 4 // buf index to start
, byteSize = 4 // size of each sample in bytes
, duration = 4 // length of loop in samples (not bytes)
;

sample = Sampler(buf, start, duration, byteSize)

var t = setInterval(
    function(){
	console.log(sample().toString())
    }, 333)
