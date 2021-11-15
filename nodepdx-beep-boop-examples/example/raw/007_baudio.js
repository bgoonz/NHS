#!/usr/bin/env node

var baudio = require('baudio');
var b = baudio(function (t) {
    return Math.sin(2 * Math.PI * t * 400);
});
b.play();
