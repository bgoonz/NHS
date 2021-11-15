var baudio = require('baudio');
var tau = 2 * Math.PI;

var melody = [ 0, -3/2, 1/5, 4/3, 7/5, 0, -5/6, 1/3 ]
    .map(function (x) { return Math.pow(2, x) })
;
var b = baudio(function (t) {
    var m = melody[Math.floor(t * 2 % melody.length)];
    return sin(400 * m);
    
    function sin (freq) {
        return Math.sin(tau * t * freq);
    }
});
b.play();
