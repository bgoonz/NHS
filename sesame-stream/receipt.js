var Time = require('since-when');

var ns2ms = 1.0 / 1000000.0

// ping pong
// if opts.payload is a number, a payload of that number will be created and sent
// if opts.payload is anything but undefined, it will be the payload (even null)
// if no payload is passed, this is the recieving end, and it will only return data it receieves

module.exports = function(stream, path, opts){
		
	opts = opts || Object.create(null);

  var time = Time(); 

	var ended = false;
	
	var payload = null;
	
	var d = Object.create(null)
	
	var l = 0
	
	stream.on('end', closer)
	stream.on('close', closer)
	
	function closer(){
		ended = true
	}
	
	stream.on('data', function(data){

		if(!ended) {
			
			l = data.length || data.byteLength
			
			d.timestamp = new Date().getTime();
			
			d.sinceBegin = time.sinceBegin()
			
			d.sinceLast = time.sinceLast()
									
			stream.write("" + l)

			stream.emit('metadata')
			
		}

	})
	
	return stream
}
