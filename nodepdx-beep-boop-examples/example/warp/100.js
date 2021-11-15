var baudio = require('baudio');
var tau = Math.PI * 2;
var b = baudio(function (tt) {
    var t = tt % 8;
    
    var n = t % 7;
    var xs = [ 120, 240, 450, 20 ];
    
    var speed = tt % 8 > 7 ? 16 : 2;
    var x = xs[Math.floor(t*speed)%xs.length]
    var z = tt % 8 < 7 ? 1000 : 80;
    
    var f = x + Math.sin(z * (t % 1));
    
    return (
        0.15 * Math.sin(tau * t * f)
        + 0.1 * Math.sin(tau * t * (f * 2 + 4))
    );
    
    function sin (x) {
        return Math.sin(tau * t * x);
    }
});
b.play();
