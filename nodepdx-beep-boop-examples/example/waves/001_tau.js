var baudio = require('baudio');
var tau = 2 * Math.PI;

var b = baudio(function (t) {
    var freq = 400;
    return Math.sin(tau * t * freq);
});
b.play();
