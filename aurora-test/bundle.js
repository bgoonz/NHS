(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
console.log(AV)

var av = AV
//require('./node_modules/av/build/aurora.js')//av')
//require('./node_modules/aac/build/aac.js')//av')

var self = this;
var sampleRate = 44100//evt.data.sampleRate;
var resamplers = [];
var chans = 1;
var player = av.Asset.fromURL('/aurora-test/audio.mp3')

player.on('format', function(d){

    d.sourceLength = player.source.length;
    chans = d.channelsPerFrame;

    var bufferSize = Math.ceil(4096 / (sampleRate / d.sampleRate));

  });

  player.on('meta', function(d){
    console.log(d)
  });

  player.on('progress', function(evt){
    console.log(evt)
  });

  player.on('data', function(bufArray){
    for(x in resamplers){
    }
    console.log(bufArray)
  });

  player.on('end', function(){
  });
  player.on('error', function(err){
    console.log(err)
  });
  player.start();
 

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9qb2hubnkvZGV2ZWxvcG1lbnQvYmFybi9hdXJvcmEvZW50cnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zb2xlLmxvZyhBVilcblxudmFyIGF2ID0gQVZcbi8vcmVxdWlyZSgnLi9ub2RlX21vZHVsZXMvYXYvYnVpbGQvYXVyb3JhLmpzJykvL2F2Jylcbi8vcmVxdWlyZSgnLi9ub2RlX21vZHVsZXMvYWFjL2J1aWxkL2FhYy5qcycpLy9hdicpXG5cbnZhciBzZWxmID0gdGhpcztcbnZhciBzYW1wbGVSYXRlID0gNDQxMDAvL2V2dC5kYXRhLnNhbXBsZVJhdGU7XG52YXIgcmVzYW1wbGVycyA9IFtdO1xudmFyIGNoYW5zID0gMTtcbnZhciBwbGF5ZXIgPSBhdi5Bc3NldC5mcm9tVVJMKCcvYXVyb3JhLXRlc3QvYXVkaW8ubXAzJylcblxucGxheWVyLm9uKCdmb3JtYXQnLCBmdW5jdGlvbihkKXtcblxuICAgIGQuc291cmNlTGVuZ3RoID0gcGxheWVyLnNvdXJjZS5sZW5ndGg7XG4gICAgY2hhbnMgPSBkLmNoYW5uZWxzUGVyRnJhbWU7XG5cbiAgICB2YXIgYnVmZmVyU2l6ZSA9IE1hdGguY2VpbCg0MDk2IC8gKHNhbXBsZVJhdGUgLyBkLnNhbXBsZVJhdGUpKTtcblxuICB9KTtcblxuICBwbGF5ZXIub24oJ21ldGEnLCBmdW5jdGlvbihkKXtcbiAgICBjb25zb2xlLmxvZyhkKVxuICB9KTtcblxuICBwbGF5ZXIub24oJ3Byb2dyZXNzJywgZnVuY3Rpb24oZXZ0KXtcbiAgICBjb25zb2xlLmxvZyhldnQpXG4gIH0pO1xuXG4gIHBsYXllci5vbignZGF0YScsIGZ1bmN0aW9uKGJ1ZkFycmF5KXtcbiAgICBmb3IoeCBpbiByZXNhbXBsZXJzKXtcbiAgICB9XG4gICAgY29uc29sZS5sb2coYnVmQXJyYXkpXG4gIH0pO1xuXG4gIHBsYXllci5vbignZW5kJywgZnVuY3Rpb24oKXtcbiAgfSk7XG4gIHBsYXllci5vbignZXJyb3InLCBmdW5jdGlvbihlcnIpe1xuICAgIGNvbnNvbGUubG9nKGVycilcbiAgfSk7XG4gIHBsYXllci5zdGFydCgpO1xuIFxuIl19
