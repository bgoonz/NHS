var scrypt = require('js-scrypt')
var scryptc = require('scrypt')
var p = scryptc.params(0.1)
var Time = require('since-when')

var key = new Buffer('what whig zally hoobot yagshits walla walla beep booz baap')

var hashes = []

var time = new Time()
for(var x = 0; x <100000; x++){
  scryptc.hash(key, {N:1, r:1, p:1}, function(err, hash){
   // hashes.push(hash)
  })
}
console.log(time.sinceBegin())
//console.log(scryptc.hash(key,p).toString())
/*
scryptc.hash(key, {N:1, r:1, p:1}, function(err, hash){
  console.log(JSON.stringify(err), hash.toString())
})
*/
//scrypt.hash('whatwhat', console.log)

//console.log('hi*********************', scrypt.hashSync(key).toString())
