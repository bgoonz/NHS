var through = require('through')
var split = require('split')
var EOL = require('os').EOL

module.exports = parse
module.exports.serialize = serialize
module.exports.parse = parse

function parse(bool) {
  return split(function(row) {
    if (row) {
      if(!bool) return JSON.parse(row)
      else return row
    }
  })
}

function serialize() {
  return through(function(obj) {
    this.queue(JSON.stringify(obj) + EOL)
  })
}
