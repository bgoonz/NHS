var asynth = require('asynth');
var synth = require('jynth')();

var samples = [];

var notes = {};

var s = asynth(function (note, t) {
    var freq = 440 * Math.pow(2, (note.key - 49) / 12);
    if (!notes[note.key]) {
        notes[note.key] = true;
        setTimeout(function () {
            notes[note.key] = false;
        }, 8000);
        samples.splice(0);
    }
    var x = synth(t).sine(0.1, freq).amod(freq/200,freq/100,3).sample;
    var y = synth(t).sine(1, freq).sample;
    var value = x + y;
    
    samples.push(value);
    if (samples.length > s.rate * 16) samples.splice(0, s.rate * 16);
    return value;
});

s.push(function (t, i) {
    return samples[i % samples.length] * 0.5;
});

s.play();
