var eq = require('buffer-equals')
var xtend = require('xtend')
var isarray = require('isarray')
var defined = require('defined')

module.exports = function (sodium, keypair, opts) {
  if (sodium.api && !sodium.crypto_sign) sodium = sodium.api
  if (!opts) opts = {}
  var pub
  if (typeof opts.publicKey === 'function') {
    pub = opts.publicKey
  }
  else {
    var pub = [].concat(keypair.publicKey || [])
    if (opts.publicKey) pub = [].concat(pub, opts.publicKey)
  }
 
  return xtend({
    identity: defined(
      keypair.identity, keypair.publicKey, opts.identity, opts.id
    ),
    sign: function (node, cb) {
      var bkey = Buffer(node.key, 'hex')
      if (sodium.sign && !sodium.crypto_sign) {
        cb(null, sodium.sign(bkey, keypair.secretKey))
      } else {
        cb(null, sodium.crypto_sign_detached(bkey, keypair.secretKey))
      }
    },
    verify: function (node, cb) {
      if (typeof pub === 'function') {
        pub(node.identity, function (err, ok) {
          if (err) cb(err)
          else if (!ok) cb(null, false)
          else cb(null, verify(node))
        })
      }
      else {
        for (var i = 0; i < pub.length; i++) {
          if (eq(node.identity, pub[i])) break
        }
        if (i === pub.length) return cb(null, false)
        cb(null, verify(node))
      }
    }
  }, opts)

  function verify (node) {
    var bkey = Buffer(node.key, 'hex')
    if (sodium.verify && !sodium.crypto_sign_open) {
      return sodium.verify(bkey, node.signature, node.identity)
    } else {
      return sodium.crypto_sign_verify_detached(
        node.signature, bkey, node.identity)
    }
  }
}
