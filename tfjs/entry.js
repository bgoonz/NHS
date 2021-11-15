var jsynth = require('jsynth-buffer')
var tf = require('@tensorflow/tfjs')
var fileBuf = require('jsynth-file-sample')
var b2a = require('base64-arraybuffer')

var file = fs.readFileSync('./dub.mp3', 'base64')
var buf = b2a.decode(file)
fileBuf(master, buf, function(err, source){
  source.connect(master.destination)
  source.start(master.currentTime)

})

