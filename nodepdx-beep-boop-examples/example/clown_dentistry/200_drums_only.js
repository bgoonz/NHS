var baudio = require('baudio');
var tau = Math.PI * 2;
var b = baudio(function (t) {
    return drums(t);
});
b.play();

function drums (t) {
    var n = t * 0.75 % 3 + 1;
    var f = Math.sin(tau * tau / ((n * 16 % 2 + 0.5) * 1));
    return Math.sin(tau * n * f);
}
