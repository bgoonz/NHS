var asynth = require('asynth');
var tau = 2 * Math.PI;
var s = asynth(function (note, t) {
    var freq = 440 * Math.pow(2, (note.key - 49) / 12);
    return Math.sin(tau * t * freq);
});

s.play();
