var baudio = require('baudio');
var tau = 2 * Math.PI;

var b = baudio(function (t) {
    return sawtooth(400) * (sawtooth(3) + sawtooth(4) + sawtooth(5));
    
    function sawtooth (freq) {
        return t % (1 / freq) * freq * 2 - 1;
    }
});
b.play();
