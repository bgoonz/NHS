var alloc = require('tcp-bind')
var isroot = require('is-root')
var minimist = require('minimist')
var argv = minimist(process.argv.slice(2), {
  alias: { u: 'uid', g: 'gid' }
})

var port = isroot() ? 80 : 8000
var fd = alloc(port)
if (isroot) {
  if (argv.uid) process.setuid(argv.uid)
  if (argv.gid) process.setuid(argv.gid)
}

var http = require('http')
var path = require('path')
var ecstatic = require('ecstatic')

var st = ecstatic(path.join(__dirname, 'public'))
var server = http.createServer(function (req, res) {
  st(req, res)
})
server.listen({ fd: fd }, function () {
  console.log('listening on :' + port)
})
