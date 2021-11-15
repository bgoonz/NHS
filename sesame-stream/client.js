var websocket = require('websocket-stream')
var Time = require('since-when')
var Model = require('scuttlebutt/model');
var model = new Model();
var teoria = require('teoria')
var jsynth = require('jsynth')
var master = new webkitAudioContext
var notesOn = {};
var empties = []
var notes = []
var oz = require('oscillators')
var amod = require('amod')
var jdelay = require('jdelay')
var delay = jdelay(2333, .48, .33)
var handlers = require('./')
//var stream = websocket('ws://localhost:11010?type=ticktock&interval=1000&payload=1000')
var stream = websocket('ws://localhost:11010?type=stdin')
stream.on('data', function(data){
  data = JSON.parse(data)
  createNote(data)
})

var sample = 0;
var synth = function(time){
  sample = 0;
  notes.forEach(function(e){
    if(e){
      sample += oz.sine(time, e[0]) * amod(e[2]/122, Math.abs(e[2]/122) / 2, time, 8) 
    }
  })
  return sample
}

var node = jsynth(master, synth)
node.connect(master.destination)
function createNote(data){
  if(data[0] == 144){// noteOn
    data[0] = teoria.note.fromMIDI(data[1]).fq()
    var x = empties.indexOf(false)
    if(x >= 0){
       notesOn[data[1]] = x
       notes[x] = data
       empties[x] = true
    }
    else{
      notesOn[data[1]] = notes.push(data) - 1
      empties.push(true)
    }
  }
  if(data[0] == 128){// noteOff
    empties[notesOn[data[1]]] = false
    notes.splice(notesOn[data[1]], 1, null)
    notesOn[data[1]] = undefined
  }
}



//handlers.pingpong(stream)
/*
var time = new Date().getTime();
var t = 0;
var l = 1024 * 1024
var buf;
init()
var time = Time();

handlers.pingpong(stream)

stream.on('metadata', function(data){
	console.log(data)
})

//ws.write(buf)
function init(){
	buf = new Int8Array(l);
	for(var x = 0; x < buf.length; x++){
		buf[x] = Math.sin((x / l) * Math.PI * 2)
	}
}
*/
