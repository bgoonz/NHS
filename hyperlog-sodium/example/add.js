var hyperlog = require('hyperlog')
var memdb = require('memdb')
var hsodium = require('../')
var sodium = require('sodium')

var keypair = sodium.api.crypto_sign_keypair()
var log = hyperlog(memdb(), hsodium(sodium, keypair))

log.add(null, Buffer('whatever'), function (err, node) {
  console.log(node)
})
