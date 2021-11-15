var parse = require('url').parse
var qs = require('querystring')

var WebSocketServer = require('ws').Server
var websocketStream = require('websocket-stream')
var wss = new WebSocketServer({noServer: true})
var cookies = require('cookies');
var keygrip = require('keygrip')(['catpile', 'doglight'])

var sockets = require('./handlers')

module.exports = function(req, socket, head){
  wss.handleUpgrade(req, socket, head, function(ws){
    var q = qs.parse(parse(req.url).query);
    var stream = websocketStream(ws, {autoDestroy: false})
    var types = q.type.split(',');
    types.forEach(function(handler){
      sockets[handler](stream, parse(req.url).pathname, q)
    })
  })
}
