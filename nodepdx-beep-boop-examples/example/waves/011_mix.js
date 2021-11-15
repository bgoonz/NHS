var baudio = require('baudio');
var tau = 2 * Math.PI;

var b = baudio(function (t) {
    return sin(400) + square(401) + sawtooth(408);
    
    function sin (freq) {
        return Math.sin(tau * t * freq);
    }
    
    function square (freq) {
        return Math.sin(tau * t * freq) < 0 ? -1 : 1;
    }
    
    function sawtooth (freq) {
        return t % (1 / freq) * freq * 2 - 1;
    }
});
b.play();

// mixed waves
