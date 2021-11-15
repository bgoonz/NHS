var SetInterval = require('./').SetInterval;
var ClearInterval = require('./').ClearInterval;

var Time = require('since-when');
var time = new Time();

var i = SetInterval(ticktock, 1000, 1, 2, 3)

function ticktock(){

  console.log(Math.abs(1e9 - time.sinceLastNS()) / 1e9 + ' seconds off the 1 second mark')

}

SetInterval(function(){
  ClearInterval(i)
}, 10000)
