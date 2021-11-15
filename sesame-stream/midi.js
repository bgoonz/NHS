midi = require('midi');
var teoria = require('teoria')

input = new midi.input();

input.on('message', function(a,b){
  process.stdout.write(JSON.stringify(b))
//  console.log(a,b, teoria.note.fromMIDI(b[1]).fq());
});

input.on('error', function(e){
  console.log(e);
});
console.log(input.getPortName(1))
input.openPort(1);
