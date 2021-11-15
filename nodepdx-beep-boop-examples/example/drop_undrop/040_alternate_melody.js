var baudio = require('baudio');
var tau = Math.PI * 2;
var tune = [ 0, -1/6, 1/2, -3/4, -1/5, 1/6 ]
    .map(function (x) { return 800 * Math.pow(2, x) })
;
var alt = [ -1/6, 4/2, 1/4, 1/3 ]
    .map(function (x) { return 1600 * Math.pow(2, x) })
;

var b = baudio(function (t) {
    t += 16;
    
    var f = 120 + Math.sin(1000 * (t % 1));
    var n = tune[Math.floor(t % tune.length)];
    
    if (t % 32 > 17 && t % 32 < 19) {
        var speed = t % 32 < 18 ? 2 : 4;
        n = alt[Math.floor(t * speed % alt.length)];
        return (variant(n) + primary(n)) / 2;
    }
    else {
        return (t < 4 ? t / 4 : 1) * primary(n);
    }
    
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
     
    function variant (n) {
        return (
            square(n / 4) + sawtooth(n * 2)
            + sin(n) + sin(n + 2)
            + 2 * sin(f)
        ) / 3 * sin(2 + (Math.floor(t * 2 % 4)));
    }
    
    function primary (n) {
        return sin(f)
            * (t % 32 < 8 ? 1 : sin(4))
            + (t % 64 < 16 ? 0 : (t % 3/4 < 3/16) * sin(f) * sin(12))
            + (sawtooth(n) * square(4)) * (sin(31) + sin(8))
        ;
    }
    
});
b.play();
