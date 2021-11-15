var Emitter = require('events').EventEmitter
var Time = require('since-when');
var globalTimes = {}

module.exports = function(stream, path, opts){
	opts = opts || Object.create(null)
  opts.interval = opts.interval || 1000 
	var ns2ms = 1.0 / 1000000.0
	var ended = false;
  var e = globalTimes[opts.interval]
  if(!e){
    e = globalTimes[opts.interval] = new Emitter
    var t = new Time
    var i = opts.interval
    t.every(opts.interval / ns2ms, function(tick, actual){
      tick()
      var d = Object.create(null)
      d.metadata = {};
      d.metadata.type = 'ticktock'
      d.metadata.timestamp = new Date().getTime();
      d.metadata.sinceBegin = t.sinceBegin()
      d.metadata.sinceLast = t.sinceLast()
      d.data = undefined
      e.emit('bwaam', JSON.stringify(d)) 
    })
  }
  e.on('bwaam', function(d){
         
    stream.write(d)

  })
  
	stream.on('end', closer)
	stream.on('close', closer)
	
	function closer(){
		ended = true
	}

	return stream
}
