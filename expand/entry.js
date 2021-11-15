var html = require('hyperscript')
var unzip = require('./hands/unzipStream')
var fileStream = require('filereader-stream')
var zlib = require('zlib')

var form = html('form', {
  action: '/upload'
}, html('input', {
  type: 'file',
  name: 'file'
}), html('input', {
  type: 'submit',
  value: 'select a small'
}))

form.addEventListener('change', function(e){
  console.log(e)
  var file = e.target.files[0]
  var reader = new FileReader
  reader.readAsArrayBuffer(file)
  reader.onload  = function(e){
    var buf = Buffer._augment(new Uint8Array(e.target.result))
    zlib.unzip(buf, function(err, res){
      console.log(err, res)
    })
  }
  unzip(fileStream(file))
})
document.body.appendChild(form)
