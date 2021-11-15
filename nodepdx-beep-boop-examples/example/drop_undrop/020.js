var baudio = require('baudio');
var tau = Math.PI * 2;

var b = baudio(function (t) {
    t += 15;
    
    var f = 120 + Math.sin(1000 * (t % 1));
    return sin(f)
        * (t % 32 < 8 ? 1 : sin(4))
        + (t % 64 < 16 ? 0 : (t % 3/4 < 3/16) * sin(f) * sin(12))
    ;
    
    function sin (x) {
        return Math.sin(tau * (t % 32) * x);
    }
    
    function square (x) {
        var n = Math.sin(tau * (t % 32) * x);
        return n > 0 ? 1 : -1;
    }
    
    function sawtooth (x) {
        return (t % 32) % (1 / x) * x * 2 - 1;
    }
});
b.play();
