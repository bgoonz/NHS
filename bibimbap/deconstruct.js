// metadata is base64 encoded JSON with a semi-colon terminator?
// sure

var toBase64 = require('js-base64').Base64.toBase64
module.exports = deconstruct

function deconstruct(val, key){

  var res = Object.create(null)
  res.meta = Object.create(null)
  res.meta.type = new String()
  if(key) res.meta.key = key;
  var reg = new RegExp('[0-9]+(?=darray)')
  var reg = new RegExp('[0-9]+(?=d)')
  var nodeFlag = false
  var r

  try{
    res.meta.type = val.constructor.name
    if(res.meta.type == 'Object' || res.meta.type == 'Array'){
      if(Array.isArray(val)){
        res.meta.index = []
        res.data = val.map(function(e,i){
          var x = deconstruct(e)
          res.meta.index[i] = x.byteLength
          return x
        })
      }
      else{
        res.meta.keys = Object.keys(val)
        res.meta.index = []
        res.data = res.meta.keys.map(function(e,i){
          var r = deconstruct(val[e], e)
          res.meta.index.push(r.byteLength)
          return r
        })
      }
        var blob = new Int8Array(res.meta.index.reduce(function(p,e){p+=e;return p},0))
        var offset = 0;
        res.meta.index.forEach(function(e, i){
          //console.log('eheheh', e, res.data[i].byteLength)

          blob.set(new Int8Array(res.data[i]), offset)
          //console.log('CONSTRUCTION GOING ON', '\n', construct(res.data[i]))
          //console.log('RECONSTRUCTION GOING ON', '\n', construct(blob.buffer.slice(offset, offset + e)))
          offset+=e
        })
        res.data = blob.buffer
    }
    else if(res.meta.type == 'Number'){
      if(val == Infinity || val == -Infinity){ // infinity or -infinity
        res.data = new ArrayBuffer(0)
        res.meta.name = String(val)
      }
      else{
        var data = new Float64Array(1)
        data[0] = val
        res.data = data.buffer
      }
    }
    else if(res.meta.type == 'String'){
      res.data = new Buffer(val).buffer
    }
    else if(r = reg.exec(res.meta.type)){
      // ndarray!
      res.meta.dimensions = Number(r[0])
      res.meta.shape = val.shape.join()
      res.meta.ndarrayType = val.data.constructor.name
      res.meta.type = 'ndarray'
      res.data = val.data.buffer
    }
    else if(res.meta.type == 'Function'){
      var str = val.toString();
      res.meta.name = val.name
      var regArgs = /\(([^)]+)\)/;
      res.meta.arguments = regArgs.exec(str)[1]
      var i = str.indexOf('{')
      var ii = str.lastIndexOf('}')
      res.data = new Buffer(str.slice(i+1, ii)).buffer
    }
    else if(res.meta.type == 'Buffer'){
      nodeFlag = true
      res.meta.nodeFlag = true
      res.data = val
    }
    else if(Buffer.isBuffer(val)){
      res.meta.type = 'Buffer'
      res.meta.nodeFlag = false
      res.data = val.buffer //deconstruct(val.buffer).data
    }
    else if(res.meta.type == 'RegExp'){
      res.data = new Buffer(val.toString()).buffer
    }
    else{
      // must me a TypedArray of ArrayBuffer
      if(val.buffer){
        // TypedArray
        res.data = val.buffer
      }
      else{
        res.data = val
      }
    }
  }catch(err){
    // undefined or null or isNaN
    //console.log(err)
    res.meta.type = 'nil'
    res.meta.name = String(val)
    res.data = new ArrayBuffer(0)
  }
//  if(process.title == 'node' && !res.meta.nodeFlag){
//    if(!res.meta.nodeFlag) res.data = new Buffer(new Int8Array(res.data))
//  } 
  
  res.meta.byteLength = res.data.byteLength
  var header = toBase64(JSON.stringify(res.meta)) + ';'
  var body = new Buffer(new Int8Array(res.data))
  var buf = new Buffer(res.data.byteLength + header.length)
  buf.write(header, 0, header.length, 'utf8')
  body.copy(buf, header.length)
//  buf.copy(new Int8Array(res.data), header.length, buf.length - 1)
//  console.log(buf.toString())  
  return buf.buffer

}
