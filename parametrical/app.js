var ui = require('./yindex')
var insert = require('insert-css')
var cstyle = require('../see-style')

var master = new AudioContext
var sr = master.sampleRate

var jsynth = require('../jsynth')
var $ = require('../polysynth/cheatcode')
var getids = require('getids')
var fs = require('fs')
var html = fs.readFileSync('./module.html', 'utf8')
var css = fs.readFileSync('./module.css', 'utf8')
insert(css)
document.body.innerHTML = html;
var model = document.querySelector('.module')
var env, dur = 1, del, start = false, fq 
var ux = getids()
//iterate initial state ball and assign new interface element 
//add option to drop down modules, which could be a parametrical element
//that switches style for large screen or mobile
//also save state between loads...

function init(config){
  var elements = {}
  for(x in config){
    var el = document.createElement('div')
    el.classList.add(config[x].type)
    elements[config[x].name] = el
    config[x]['el'] = el
  }
  return {config, elements}
}
// need to write a time-wubbing iir  ****<---o--->**** for flawless transitions
var {config, elements} = init({
  gain: 
    { type: 'dial', value: .333, name: 'gain', mag: 5/10, min:0, max: 1},
  amod: 
    { type: 'dial', value: 1/3, step: 1/10, mag: 10},
  xy: {type: 'xy', value: [3, 9], range:[-4,-24,4,24], name: 'ps'},
  gain2: 
    { type: 'dial', value: .4, name: 'gain', mag: 5/10, min:-3, max: 3, name: "jambosa"},
  amod2: 
    { type: 'dial', value: 1/3, step: 1/9, mag: 9, name:"mafoosa"},
    f: { type: 'dial', value: 1/6, step: 1/9, mag: 10, name: 'f'},
    g: { type: 'dial', value: 1/8, step: 1/10, mag: 10, name: 'g'},
    a: {type: 'amod', value: [[0,0],[0,3/2], [1,3/4]], name: 'athumb'},
    s: {type: 'amod', value: [[0,3/4],[1/2,1/4],[1/2, 3/4],[2/4, 1.25],[1,3/4]], name: 'sthumb'},
    d: {type: 'amod', value: [[0,3/4],[1/2, 1/2], [1,1/4]], name: 'dthumb'},
    r: {type: 'amod', value: [[0,1/4],[0,0], [1,0]], name: 'rthumb'},
  env2: {type: 'amod', value: [[0,1/2],[1/2,1],[2/4, 0],[1,1/2]], name: '2thumb'},
})

for(e in elements) model.appendChild(elements[e])
cstyle.flex(model, {square: 3})
var st = ui(config, function(v, e){
  //console.log(e, v)
  am = {}
  am.curves = v//st.state.amod
  dur = am.dur = 1
  env = $.env([st.state.env2], [dur])
  del = $.jdelay(1, .59, .9)
  //console.log(st.state.env2)
  //console.log('****************')
  for(var x = 0; x <= 100; x++){
  }
  //console.log('****************')
  console.log(v,e, st.state, env(1))
  fq = 440/2
  if(!start){
    start = true
  
  }
  bz = beezmod() // refresh env 
  if(e==='ps')iir=$.iir(Math.abs(Math.floor(v[0])), Math.abs(Math.floor(v[1])))
})

var state = st.state
var beezmod = function(){
  let pts = state.s//[[0, 1/2], [.5, 1], [.5, .5], [.5, 0], [1, 1/2]]
  let env = $.beezxy(pts)
  pts = pts.reduce((a,e) => { a[0].push(e[0]); a[1].push(e[1]); return a }, [[],[]])
  return function(c, t, f){
    pts[0][2] = .5 + $.oz.sine(t, f * -state.g) / 2
    var e = env((t * 1) % 1, pts)
    return e
  }
}

var bz = beezmod()
var bpm = 149.5
var iir = $.iir(4,12)
var dld, dl2d
var sampleRate = master.sampleRate
var dl = $.jdelay(dld = Math.floor(sampleRate * 60 / bpm / 15/2), .8, 1/2) 
var dl2 = $.jdelay(dl2d = Math.floor(sampleRate * 60 / bpm * 3 / 2), .4, 1/2) 

var synth = jsynth(master, function(t, s, i){
  var e = bz(.25, t * bpm/60, state.f)
  //return $.oz.sine(e[0], 440/2) * e[1]
  var c = $.gtone(e[0],  Math.PI * (113 - ((t*bpm/60) % 24)), $.amod(0, Math.E, e[0], 15), $.amod(Math.PI, Math.PI, e[0], -1/18), Math.E, 31, $.ph.sine, $.amod(0, 1/2, e[0], -state.amod2))
  if(t%1==0) console.log(state.amod)
  return (dl2(iir(dl(c * e[1])) * $.winfunk.planckt(t, 333,11), dl2d, $.amod(state.gain2, .4, e[0], -state.amod), 1/2)) * state.gain //(music(t, s, i))
},1024 )

var started = false
ux.play.onclick = function(e){
  started = !started
  if(started){
    master.resume().then(() => {
      synth.connect(master.destination)
    })
  }
  else synth.disconnect(master)
}



