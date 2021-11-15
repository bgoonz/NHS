var baudio = require('baudio');
var tau = Math.PI * 2;
var b = baudio(function (t) {
    var f = 120 + Math.sin(1000 * (t % 1));
    return sin(f);
    
    function sin (x) {
        return Math.sin(tau * t * x);
    }
});
b.play();
