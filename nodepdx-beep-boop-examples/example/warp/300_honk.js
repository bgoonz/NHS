var baudio = require('baudio');
var tau = Math.PI * 2;
var b = baudio(function (tt) {
    var t = tt % 8;
    
    var honk = (
        2 * sin(254)
        + 5 * sin(4) * sin(508)
        + 1 * sin(250)
        + 0.5 * sin(125)
    );
    
    var n = t % 7;
    var xs = [ 120, 240, 450, 20 ];
    
    var speed = tt % 8 > 7 ? 16 : 2;
    var x = xs[Math.floor(t*speed)%xs.length]
    var z = tt % 8 < 7 ? 1000 : 80;
    
    var f = x + Math.sin(z * (t % 1));
    
    return (
        0.15 * Math.sin(tau * t * f)
        + 0.1 * Math.sin(tau * t * (f * 2 + 4))
        + 0.5 * (tt >= 4) * shaker(tt < 16 ? tt : (tt % 4 + 16))
        + honk
        + (tt >= 12 && t % (1/2) < 1/24 ? Math.random() : 0)
    );
    
    function sin (x) {
        return Math.sin(tau * t * x);
    }
});
b.play();

function shaker (t) {
    var n = (Math.sin(t * 2) + 1) * 4;
    var xs = [ 20, 10, 32, 50, 30 ];
    var x = xs[Math.floor(t*8)%xs.length];
    var f = x + Math.sin(1000 * (n % 1));
    var r = sin(f) * (sin(4) + sin(3) + sin(5)) * sin(4);
    return r * r;
    
    function sin (x) {
        return Math.sin(tau * t * x);
    }
}
