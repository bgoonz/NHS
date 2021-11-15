var master = new AudioContext

var jsynth = require('jsynth')
var jdelay = require('../delay')
var amod = require('amod')
var oz = require('oscillators')
var sync = require('jsynth-sync')
var trigger = require('jigger')
var nvelope = require('nvelope')
var mic = require('jsynth-mic')(master)
var datadelay = require('data-delay')
var clang = require('../meffisto')
var parametrical = require('../parametrical')
var clone = require('clone')
var store = require('store')
var generator = new trigger
var params = require('./params.js')
var no = function(){return 0}
var alRitmo = no
var mute = no
var q  

time = 0.0
sr = master.sampleRate
tempo = 74 
latency = 15.5/10 * 2


params = params(sr, tempo)
parametrical(params, document.body)
p = params

init(tempo)

function init(tempo){
  tempo = tempo 
  spb = ((sr * 60) / tempo)
  spbf = spb * 16
  spl = sr * latency
  bpl = Math.ceil(spl / spb)
  spm = sr * 60
  xtempo = spm / spl
  xspb = spl / 4
  //  setup tempo bound latency
  console.log(xtempo, xspb)
  //buf = datadelay(Math.floor(spl), Float32Array)
  //for(var x = 0; x < Math.floor(spb); x++) buf.write(0)

  // sycopation for metrognome
  var timer = sync(tempo, sr)
  d1 = jdelay(spb * 8, .87, .87)
  d2 = jdelay(spb * 8 * 5 / 3, .67, .67)
  d3 = jdelay(spb * 8 * 7 / 5, .37, .37)

}

// main functionis
pass = function(t, i, s){
  //buf.write(s)
  //s = buf.read() || 0
  return s
}

drop = function(t, i, s){
  //buf.write(s)
  //s = buf.read() || 0
  //timer.tick.call(timer, t)
  //var x = generator.tick(t, i, s)
  return  (s * 1.67) + d3(d2(d1(0, spl * p.d1(), p.fb1(), p.mix1()), p.d2() * xspb, p.fb2(), p.mix2()), p.d3() * xspb, p.fb3(), p.mix3()) 
  return  s + d3(d2(d1(0, p.d1 * spb, p.fb1, p.mix1), p.d2 * spb, p.fb2, p.mix2), p.d3 * spb, p.fb3, p.mix3) * amod(.5, .37, t, 60 / tempo ) 
}


qusic = function(t, i, s){
  //timer.tick.call(timer, t)
  //var x = generator.tick(t, i, s)
  //return s
  
  //buf.write(s)
  //s = buf.read() || 0
  
  return s
  return  d3(d2(d1(s, spl * p.d1(), p.fb1(), p.mix1()), p.d2() * xspb, p.fb2(), p.mix2()), p.d3() * xspb, p.fb3(), p.mix3()) * amod(.5, .37, t, 60 / (xtempo * p.amod()) ) 
}

music = qusic
// observables on the switches
params.tempo(function(val){
  latency = val / 100
  init(tempo)
})
params.mute(mute)
params.drop(function(val){
  if(val){
    q = music 
    music = drop
  }
  else{
    music = q || music
  }
  console.log(music)
})

params.cut(function(val){
  if(val){
    q = music
    music = pass
  }
  else{
    music = q || music
  }
})

params.s1(function(val){console.log(val)})
params.s2(function(val){console.log(val)})
params.s3(function(val){console.log(val)})

// get mic node, connect and go
mic.on('node', function(node){
	dsp = function(t, i, s){
		time = t
    return music(t, i, s) 
	}	
  synth = jsynth(master, dsp, 256 * 2 * 2 * 2 * 2)
  node.connect(synth)
  synth.connect(master.destination)
  alRitmo = function(bpm){
    tempo = bpm
    spb = sr * 60 / tempo
  }

  mute = function(gate){
    if(!gate) synth.disconnect()
    else synth.connect(master.destination)
  }
})

/*

var metro = timer.on(1, function(t, b){
  var opts = {}
  opts.c = 1;
  opts.m = 1/1.62;
  opts.f = 2167 / 2 / 2 / 2 
  opts.wave = 'sine'
  var stringer = clang(opts)
  var attack = [[0,0],[0,1], [1,1]]
  var release = [[1,1],[1,0], [1,0]]
  var curves = [attack, release]
  var durs = [.030, .10]
  var mods = {curves: curves, durations: durs}
  var synth = function(t,s,i){
    //return oz[w<1/64?'sine':'square'](t, 1267);
    return stringer.ring(t, amod(0, 0.1, t, tempo),Math.sqrt(5)) * 
          1// (1/2 + ( 1 - (b%2) ))
  }
  var gen = generator.set(t, synth, mods)
})

*/
