const wsock = require('websocket-stream')
const to = require('to2')
const split = require('split2')
const onend = require('end-of-stream')
const synthClock = require('./clock')
const teoria = require('teoria')


module.exports = function (clock) {
  const midi = require('web-midi')
  const input = midi.openInput('Q49 MIDI 1')
  const kmin = 24
  const kmax = 144
  const NUM_KEYS = kmax - kmin
  const state = {
    time: 0,
    keys: Array(NUM_KEYS).fill(0),
    times: Array(NUM_KEYS * 2).fill(0),
    onChange: null
  }


  input.on('data', function(data, delta){
    const keydown = (data[0] >> 4) & 1
    const k = data[1] 
    console.log(keydown, Math.pow(2, (k - 69)/12)*441, teoria.note.fromMIDI(k).fq())
    state.time = synthClock.time
    state.keys[k] = keydown * data[2] / 128
    state.times[k * 2 + keydown] = state.time
    console.log(state.keys[k])
    if (state.onChange) {
      state.onChange(state.keys)
    }
  })

  return state
}
