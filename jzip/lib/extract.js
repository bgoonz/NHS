'use strict';

module.exports = Extract;

var Parse = require("../unzip").Parse;
var Writable = require('stream').Writable;
var path = require('path');
var inherits = require('util').inherits;

if (!Writable) {
  Writable = require('readable-stream/writable');
}

inherits(Extract, Writable);

function Extract (opts) {
  var self = this;
  if (!(this instanceof Extract)) {
    return new Extract(opts);
  }

  Writable.apply(this);
  this._opts = opts || { verbose: false };

  this._parser = Parse(this._opts);
  this._parser.on('error', function(err) {
    self.emit('error', err);
  });
  this.on('finish', function() {
    self._parser.end();
  });

}

Extract.prototype._write = function (chunk, encoding, callback) {
  if (this._parser.write(chunk)) {
    return callback();
  }

  return this._parser.once('drain', callback);
};
