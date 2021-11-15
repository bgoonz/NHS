
var T = require('since-when')
  , inherits = require('inherits')
;

exports.SetInterval = SetInterval;
exports.ClearInterval = ClearInterval;

function ClearInterval(i){

  return i.ended = true
 
};

function SetInterval (fn, ms){

  if(!(this instanceof SetInterval)) return new SetInterval(fn, ms);

  T.call(this);

  var ns = ms * 1e6;  

  var self = this;
  self.argz = [].slice.call(arguments, 2);
  self.timer = new T();
  self.threshold = ns * .63;
  self.inter = ns  || 1e9
  self.fn = fn || function(t,c){c()} 
  self.ended = false;
  self.tick();

};

inherits(SetInterval, T);

SetInterval.prototype.tick = function(){
  var self = this;
  var ns = nanos(self.sinceLast());
  self.beats.push(ns);
  self.loop();
};

SetInterval.prototype.tock = function(){
  this.beat = process.hrtime();
  this.skip = false;
  this.fn.call(this.fn, this.argz);
  this.tick();
};

SetInterval.prototype.loop = function(){

    var self = this;
    
    if(self.ended) {
      clearTimeout(self.to) 
      return;
    }

    var d = self.inter - (nanos(process.hrtime()) - nanos(self.beat));

    if(d < 10000) {
      self.tock()
    }

    else if(self.skip) {
      process.nextTick(function(){self.loop()})
    }

    else if(d < self.threshold) {
      // under the threshold, its nextTicks until the interval is up
      self.skip = true; 
      process.nextTick(function(){self.loop()})
    }

    else {

      if(self.beats.length > 11) {
        // over time, this will change the threshold to 90% of the average interval between calls back
        var r = self.beats.length / self.averageSetSize;
        self.threshold = avg(self.beats) * .45 * r * 2
      }

      self.skip = false;
      self.to = setTimeout(function(){self.loop.call(self)}, self.threshold / 1e6)
    }
}

function nanos(arr){
  return arr[0] * 1e9 + arr[1]
}

function add(a, b){
  var ns = a[1] + b[1];
  b[0] += a[0];
  b[1] = ns % 1e9;
  if(ns !== b[1]) b[0]++;
  return b
};
