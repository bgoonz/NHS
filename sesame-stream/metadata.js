var Time = require('since-when');

var ns2ms = 1.0 / 1000000.0

// ping pong
// if opts.payload is a number, a payload of that number will be created and sent
// if opts.payload is anything but undefined, it will be the payload (even null)
// if no payload is passed, this is the recieving end, and it will only return data it receieves

module.exports = function(stream){
		
	var ended = false;
	
	var payload = null;
	
	var d = Object.create(null)
		
	stream.on('end', closer)
	stream.on('close', closer)
	
	function closer(){
		ended = true
	}
	
//	stream.write(JSON.stringify(stream.session))
	
	stream.on('data', function(data){

		if(!ended) {
			
//			d = JSON.stringify(stream.session) + "\n"
									
//			stream.write(d)

//			stream.emit('metadata', d)
						
		}

	})
	
	return stream
}