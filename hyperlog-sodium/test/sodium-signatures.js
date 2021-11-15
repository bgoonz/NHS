var hyperlog = require('hyperlog')
var memdb = require('memdb')
var hsodium = require('../')
var sodium = require('sodium-signatures')
var test = require('tape')

test('add', function (t) {
  t.plan(3)
  var keypair = sodium.keyPair()
  var log = hyperlog(memdb(), hsodium(sodium, keypair))

  log.add(null, Buffer('whatever'), function (err, node) {
    t.ifError(err)
    t.deepEqual(node.identity, keypair.publicKey)
    t.ok(sodium.verify(Buffer(node.key, 'hex'), node.signature, node.identity))
  })
})
