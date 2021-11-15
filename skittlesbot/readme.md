###  Test scenario using hyperlog to replicate a single uxer with multiple devices

You can run this test by clonings followed by:
```
npm install
npm test
```

The test goes like this:  3 hyperlogs are created; each intended to be a replication of the others;  two of them are "devices", like a lptop and a mobile, and the third is a peer-follower-replicator-pub. 

This works if for any new device a new log is created that does not link to any previous node in any other log, a null link;  when other logs replicate, they will see this and start a new branch;  Uxer branches never merge, they run parallel.

Basically, every log-in is an append-only feed, a new log; replication is therefore simple.

```js
var h = require('hyperlog')
var sublevel = require('level-sublevel')
var db = sublevel(require('level')('./data'))
var log1 = h(db.sublevel('one'))
var log2 = h(db.sublevel('two'))
var pub = h(db.sublevel('hub'))

var nope = function(){}
var flag = 2

// log1 is a uxer log from they main device
log1.add(null, 'item 0', function(er, node){
  var hash = node.key
  log1.add([hash], 'item 1', function(er, node){
    // we have a log with two items, linked sequentially
    flag--
    replicate()
  })
}) 

// log2 is a uxer log from they mobile
log2.add(null, 'item x', function(er, node){
  var hash = node.key
  log2.add([hash], 'item y', function(er, node){
    // we have a log with two items, linked sequentially
    flag--
    replicate()
  })
}) 

process.on('exit', function(){
  console.log('\n')
})

function replicate(){
  if(flag > 0) return
  var s1 = log1.replicate()
  var s2 = log2.replicate()
  var s3 = pub.replicate()

  // Note that the pub log is a replication log for this uxer only, every followed uxer has they own.
  // We are skipping the part where the pub identifies the logs as uxer, easily done
  
  var logogol = pub.createReadStream({live: true})
  
  console.log('#### Peer changefeed (shows replication of all 4 entries)\n')
  
  logogol.on('data', function(node){
    console.log(node)//.value.toString())
  })

  s2.pipe(s3).pipe(s2)
  
  s3.on('end', function(){
    var s3a = pub.replicate()
    s1.pipe(s3a).pipe(s1)
    s3a.on('end', function(){
      pub.heads(function(err, res){
        // now we replicate again, the pub performing it's role

        var s1 = log1.replicate()
        var s2 = log2.replicate()
        var s3 = pub.replicate()
        var logogol = pub.createReadStream({live: true})
        
        s2.pipe(s3).pipe(s2)

        s3.on('end', function(){
          var s3a = pub.replicate()
          s1.pipe(s3a).pipe(s1)
          s3a.on('end', function(){

            console.log('\n####################')
            console.log('replication complete')
            console.log('####################\n')
            
            pub.heads(function(err, res){
              // pub heads
              pub.heads(function(err, res){
                if(res.length){
                  res.forEach(function(e, i){
                    var head = e
                    pub.get(e.links[0], function(e,v){
                      if(i === 0) console.log('\n#### Peer Replication Feed')
                      console.log('head:', head.value.toString(), 'link:', v.value.toString())
                    })
                  })
                }
              })

              log1.heads(function(err, res){
                if(res.length){
                  res.forEach(function(e,i ){
                    var head = e
                    log1.get(e.links[0], function(e,v){
                      if(i === 0) console.log('\n#### Laptop Feed')
                      console.log('head:', head.value.toString(), 'link:', v.value.toString())
                    })
                  })
                }
              })

              log2.heads(function(err, res){
                if(res.length){
                  res.forEach(function(e, i){
                    var head = e
                    log2.get(e.links[0], function(e,v){
                      if(i === 0 )console.log('\n#### Mobile Feed')
                      console.log('head:', head.value.toString(), 'link:', v.value.toString())
                    })
                  })
                }
              })
            })
          })
        })
      })
    })
  })
}

```
