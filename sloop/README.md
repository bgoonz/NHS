    npm install sloop

**loop over a selected portion of a buffer**
**now supports Typed Arrays**
```js
    var Sampler = require('./sloop')

    var buf = new Buffer('beepboopbaapboom')
    , start = 0 // buf index to start
    , size = 4 // size of each sample by index count (bytes, for buffers;  indecies for TAs (usually 1))
    , duration = 4 // length of the loop in the above size value
    ;
    
    sample = Sampler(buf, start, duration, size)
    
    var t = setInterval(
      function(){
      console.log(sample().toString())
    }, 333)
```
