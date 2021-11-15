var Time = require('since-when');

module.exports = function(stream, path, opts){
	opts = opts || Object.create(null)

  var time = Time(); 
	var payload = null
	var ns2ms = 1.0 / 1000000.0
	var d = Object.create(null)
	var ended = false;
	
	stream.on('end', closer)
	stream.on('close', closer)
	
	function closer(){
	
		ended = true
	
	}

	if(!(opts.payload === undefined)){
		
		if(!(isNaN(opts.payload))){
		
			payload = new Int8Array(opts.payload)		
		
		}
					
	}

	if(opts.interval){

		time.every(opts.interval / ns2ms, function(tick){			
			
			if(!ended){
				
				d.timestamp = new Date().getTime();
				
				d.sinceBegin = time.sinceBegin()
				
				d.sinceLast = time.sinceLast()
				
				stream.write(payload)
				
				stream.emit('metadata', d)
												
				tick();				

			}

		})

	}
	
	return stream
}
