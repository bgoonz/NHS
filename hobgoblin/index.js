var master = new webkitAudioContext

var jsynth = require('jsynth')
var jdelay = require('../delay')
var amod = require('amod')
var oz = require('oscillators')
var sync = require('jsynth-sync')
var trigger = require('jigger')
var nvelope = require('nvelope')
var mic = require('jsynth-mic')(master)
var clang = require('../meffisto')
var parametrical = require('../parametrical')
var clone = require('clone')
var store = require('store')
var generator = new trigger
var params = require('./config.js')
var no = function(){}
var alRitmo = no
var mute = no

time = 0.0
sr = master.sampleRate
tempo = 151 
spb = sr * 60 / tempo


params = params(sr, tempo)

//  setup tempo bound latency
buf = new Array(Math.floor(spb))
for(var x = 0; x < buf.length; x++) buf[x] = 0

// sycopation for metrognome
var timer = sync(tempo, sr)

parametrical(params, document.body)
// observables on the switches
params.mute(mute)
params.dmaster(function(val){
  if(val){
    music = qusic
  }
  else{
    music = pass
  }
})
params.s1(function(val){console.log(val)})
params.s2(function(val){console.log(val)})
params.s3(function(val){console.log(val)})

var p = params

var d1 = jdelay(spb * 3 / 2, .87, .87)
var d2 = jdelay(spb * 2 * 5 / 3, .67, .67)
var d3 = jdelay(spb * 4 * 7 / 5, .37, .37)

// main functionis
var pass = function(t, i, s){
  buf.push(s)
  s = buf.shift() 
  return s
}

var qusic = function(t, i, s){
  buf.push(s)
  s = buf.shift() 
  //timer.tick.call(timer, t)
  //var x = generator.tick(t, i, s)
  return  d3(d2(d1(s, p.d1, p.fb1, p.mix1), p.d2, p.fb2, p.mix2), p.d3, p.fb3, p.mix3) * 
          amod(.5, .37, t, 60 / tempo ) 
}

var music = qusic

// get mic node, connect and go
mic.on('node', function(node){
	dsp = function(t, i, s){
		time = t
  window.s = s
    return music(t, i, s) 
	}	
  synth = jsynth(master, dsp)
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
