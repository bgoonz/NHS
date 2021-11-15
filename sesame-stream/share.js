var channels = {}

module.exports = function(stream, path, opts){
  if(!channels[path]) channels[path] = {connected : []}
  channels[path].connected.forEach(function(e){
    if(e) {
      stream.pipe(e, {end: false})
      e.pipe(stream, {end: false})
      e.on('end', function(){
      })
      stream.on('end', function(){
      })
    }
  })
  var s = channels[path].connected.push(stream)
  stream.on('end', function(){
    channels[path].connected.splice(s, 1, null)
    channels[path].connected = channels[path].connected.filter(Boolean)
    if(!channels[path].connected.length) delete channels[path]
  })
  stream.on('error', function(err){
    //console.error(err) // who cares!
  })
}
