module.exports = function(sr, bpm){
  var spb = (sr * 60) / bpm 
  var params = {
    tempo: {
      name: 'tempo',
      value: bpm,
      min: 20,
      max: Infinity,
      gain: 10
    },
    mute: {
      name: 'MUTE',
      type: 'switch',
      value: true 
    },
    dmaster: {
      name: 'delays cut',
      type: 'switch',
      value: true 
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
      value: spb * 3 / 2,//master.sampleRate,
      gain: 10000,
      interval: 0,
      min: 0,
      max: Infinity
    },
    fb1: {
      name: 'feedback',
      value: .78,
      gain: 2,
      min: -2,
      max: 2
    },
    mix1: {
      name: 'mix',
      value: .78,
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
      value: spb * 3 / 2 * 5 / 3,//master.sampleRate,
      gain: 10000,
      interval: 0,
      min: 0,
      max: Infinity
    },
    fb2: {
      name: 'feedback',
      value: .11,
      gain: 2,
      min: -2,
      max: 2
    },
    mix2: {
      name: 'mix',
      value: .89,
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
      value: spb * 3 / 2 * 11 / 7,//master.sampleRate,
      gain: 10000,
      interval: 0,
      min: 0,
      max: Infinity
    },
    fb3: {
      name: 'feedback',
      value: .67,
      gain: 2,
      min: -2,
      max: 2
    },
    mix3: {
      name: 'mix',
      value: .25,
      gain: 1,
      min: -2,//0.0000001,
      max: 2
    }
  }
  return params
}

