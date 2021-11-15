var baudio = require('baudio');
var tau = Math.PI * 2;
var b = baudio(function (t) {
    var xs = [ 20, 10, 32, 50, 30 ];
    var x = xs[Math.floor(t*8)%xs.length];
    var f = x + Math.sin(1000 * (t % 1));
    return sin(f);
    
    function sin (x) {
        return Math.sin(tau * t * x);
    }
});
b.play();
