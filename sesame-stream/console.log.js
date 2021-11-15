module.exports = function(stream, path, opts){

	var ended = false;
	
	stream.on('end', closer)
	stream.on('close', closer)
  stream.pipe(process.stdout)	
	function closer(){
		ended = true
	} 
	return stream
}
