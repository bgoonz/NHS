var ndarray = require('ndarray')
var from64 = require('js-base64').Base64.fromBase64

module.exports = construct

function construct(ab){

  ab = Buffer._augment(new Int8Array(ab))
  var buf = ab.buffer
  var header = {}
  var body = {}
  var x = 0;

  for(x; x < ab.length; x++){
    if(ab[x] == 59) break
  }
  //console.log(ab.byteLength, x, from64(ab.toString('utf8', 0, x)))
  try{
  header = JSON.parse(from64(ab.toString('utf8', 0, x)))
  }catch(err){
    return
  }
  body = buf.slice(ab.byteLength - header.byteLength) || ''
  
  switch(header.type){
    case 'Buffer':
      body = Buffer._augment(new Int8Array(body))
    break;
    case 'String':
    case 'RegExp':
    // the strings
      
      body = ab.toString('utf8', x + 1, ab.length)
      if(header.type == 'RegExp'){
        body = new RegExp(body.slice(1, body.length - 1))
      }
      //body = new Function([], 'return new '+header.type+'(\''+body+'\')')()
    break;
    
    case 'Function':
      body = ab.toString('utf8', x + 1, ab.length - 1)
      body = new Function(header.arguments.split(','), body);
    break;
    
    case 'nil':
      // the misfits
      body = new Function([], 'return '+ header.name)()
    
    break;
    
    case 'Number':
      if(header.name) body = new Function([], 'return '+header.name)()
      else{
        body = buf.slice(ab.byteLength - header.byteLength) || ''
        body = new Float64Array(body)[0]
      }
    break;
    case 'Object':
      var offset = 0
      body = header.index.map(function(e,i){
        var x = construct(body.slice(offset, offset + e))
        offset += e
        return x
      }).reduce(function(p,e,i){
        p[header.keys[i]] = e
        return p
      },{})
    break;
    case 'Array':
    // the complex
      var offset = 0
      body = header.index.map(function(e,i){
        var x = construct(body.slice(offset, offset + e))
        offset += e
        return x
      })
    //  console.log(index)
    
    break;
    
    default:
    // number, ndarray, typedArrays, ArrayBuffers, Buffers, all constructed from an ArrayBuffer 
      if(header.type == 'ndarray'){
        body = new Function(['x'], 'return new '+header.ndarrayType+'(x)')(body)
        body = new ndarray(body, header.shape.split(','))
      }
      else if(header.type == 'Buffer'){
        body = Buffer._augment(body)
      }
      else{
        body = new Function(['x'], 'return new '+header.type+'(x)')(body)
      }
    break;
  }


  return  body

}
