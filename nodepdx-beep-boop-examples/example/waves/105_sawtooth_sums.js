var baudio = require('baudio');
var tau = 2 * Math.PI;

var b = baudio(function (t) {
    return sawtooth(400) * (sin(3) + sin(4) + sin(5));
    
    function sin (freq) {
        return Math.sin(tau * t * freq);
    }
    
    function sawtooth (freq) {
        return t % (1 / freq) * freq * 2 - 1;
    }
});
b.play();
