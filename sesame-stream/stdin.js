module.exports = function(stream, path, opts){

	var ended = false;
	
	stream.on('end', closer)
	stream.on('close', closer)
//  process.stdin.pipe(stream)
  process.stdin.on('data', function(data){
    stream.write(data.toString())
//    console.log(data.toString())
  })
  function closer(){
		ended = true
	} 
	return stream
}
