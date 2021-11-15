var hyperlog = require('hyperlog')
var memdb = require('memdb')
var hsodium = require('../')
var sodium = require('sodium')
var test = require('tape')

test('add', function (t) {
  t.plan(3)
  var keypair = sodium.api.crypto_sign_keypair()
  var log = hyperlog(memdb(), hsodium(sodium, keypair))

  log.add(null, Buffer('whatever'), function (err, node) {
    t.ifError(err)
    t.deepEqual(node.identity, keypair.publicKey)
    t.ok(sodium.api.crypto_sign_verify_detached(
      node.signature, Buffer(node.key, 'hex'), node.identity))
  })
})

test('add api', function (t) {
  t.plan(3)
  var keypair = sodium.api.crypto_sign_keypair()
  var log = hyperlog(memdb(), hsodium(sodium.api, keypair))

  log.add(null, Buffer('whatever'), function (err, node) {
    t.ifError(err)
    t.deepEqual(node.identity, keypair.publicKey)
    t.ok(sodium.api.crypto_sign_verify_detached(
      node.signature, Buffer(node.key, 'hex'), node.identity))
  })
})
