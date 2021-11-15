var baudio = require('baudio');
var tau = Math.PI * 2;
var b = baudio(function (t) {
    var n = t * 1.4 % 1 + 0.5;
    var f = Math.sin(tau * tau / ((n * 6 % 1 + 0.5) * 2));
    return Math.sin(tau * n * f);
});
b.play();
