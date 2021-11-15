var baudio = require('baudio');
var tau = Math.PI * 2;

var b = baudio(function (t) {
    var f = 120 + Math.sin(1000 * (t % 1));
    return sin(f);
    
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
