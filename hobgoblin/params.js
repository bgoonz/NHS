module.exports = function(sr, bpm){
  var spb = (sr * 60) / bpm 
  var params = {
    tempo: {
      name: 'tempo',
      value: 74,
      min: 0,
      max: Infinity,
      gain: 10
    },
    mute: {
      name: 'MUTE',
      type: 'switch',
      value: false 
    },
    cut: {
      name: 'delay cut',
      type: 'switch',
      value: false
    },
    drop: {
      name: 'drop',
      type: 'switch',
      calue: false
    },
    s1: {
      name: 'delay 1 switch',
      type: 'switch',
      value: true 
    },
    d1: {
      name: 'delay',
      value: 1,//master.sampleRate,
      gain: 10,
      interval: 0,
      min: 0,
      max: Infinity
    },
    fb1: {
      name: 'feedback',
      value: .18,
      gain: 2,
      min: -2,
      max: 2
    },
    mix1: {
      name: 'mix',
      value: .98,
      gain: 1,
      min: -2,//0.0000001,
      max: 2
    },
    s2: {
      name: 'delay 2 switch',
      type: 'switch',
      value: true 
    },
    d2: {
      name: 'delay',
      value: .25,//master.sampleRate,
      gain: 1,
      interval: 0,
      min: 0,
      max: Infinity
    },
    fb2: {
      name: 'feedback',
      value: .667,
      gain: 2,
      min: -2,
      max: 2
    },
    mix2: {
      name: 'mix',
      value: .667,
      gain: 1,
      min: -2,//0.0000001,
      max: 2
    },
    s3: {
      name: 'delay 3 switch',
      type: 'switch',
      value: true 
    },
    d3: {
      name: 'delay',
      value:.5,//master.sampleRate,
      gain: 1,
      interval: 0,
      min: 0,
      max: Infinity
    },
    fb3: {
      name: 'feedback',
      value: .97,
      gain: 2,
      min: -2,
      max: 2
    },
    mix3: {
      name: 'mix',
      value: .37,
      gain: 1,
      min: -2,//0.0000001,
      max: 2
    },
    amod: {
      name: 'amod',
      value: 1,
      gain: 1,
      min: -2,//0.0000001,
      max: 2
    }
  }
  return params
}

