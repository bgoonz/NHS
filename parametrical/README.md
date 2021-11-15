# parametrical 

An instant interface for your function. You give it your parameters; it gives you a multi-touch enabled, cross device compatible front-end.

![screen shot](./public/parametrical_sceen.png)

## example from entry.js

```js
var amod = require('amod')
var oz = require('oscillators')
var jdelay = require('jdelay')
var jsynth = require('jsynth')
var master = new webkitAudioContext()

var paramify = require('./')

var p = {
      f : {
      name: 'frequency',
      value: .5,//master.sampleRate,
      gain: 1,
      interval: 0,
      min: 0,
      max: 1
    },
      a: {
      name: 'amplitude',
      value: 4,
      gain: 1,
      min: 0,
      max: 24
    }
}

paramify(p, document.body)
var delay = jdelay(master.sampleRate, .25, .75)
var synth = jsynth(master, dsp)
synth.connect(master.destination)
function dsp(time){
  return oz.sine(time, 330) * amod(p.f, 1 - p.f, time, Math.floor(p.a))
}
```
