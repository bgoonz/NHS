var hyperlog = require('hyperlog')
var memdb = require('memdb')
var hsodium = require('../')
var sodium = require('sodium')
var test = require('tape')

test('array of public keys in opts', function (t) {
  t.plan(4)
  var kp0 = sodium.api.crypto_sign_keypair()
  var kp1 = sodium.api.crypto_sign_keypair()
  var kp2 = sodium.api.crypto_sign_keypair()
 
  var log0 = hyperlog(memdb(), hsodium(sodium, kp0, {
    publicKey: [kp0.publicKey,kp1.publicKey]
  }))
  var log1 = hyperlog(memdb(), hsodium(sodium, kp1, {
    publicKey: [kp1.publicKey]
  }))
  var log2 = hyperlog(memdb(), hsodium(sodium, kp2, {
    publicKey: [kp2.publicKey]
  }))

  var pending = 2
  log1.add(null, Buffer('one'), function (err, node) {
    t.ifError(err)
    if (--pending === 0) replicate01()
  })
  log2.add(null, Buffer('two'), function (err, node) {
    t.ifError(err)
    if (--pending === 0) replicate01()
  })
  function replicate01 () {
    var r0 = log0.replicate()
    var r1 = log1.replicate()
    r0.pipe(r1).pipe(r0)
    r0.on('end', replicate02)
  }
  function replicate02 () {
    var r0 = log0.replicate()
    var r2 = log2.replicate()
    r0.pipe(r2).pipe(r0)
    r0.on('error', function (err) {
      t.ok(err, 'failed replication on r0')
    })
    r2.on('error', function (err) {
      t.ok(err, 'failed replication on r1')
    })
  }
})
