# xxx (currently published as jmao)

This dangerous module converts any arbitrary JS into an ArrayBuffer, and converts any such ArrayBuffer back to JS.

It includes special handling for [browserify's](http://npmjs.org/package/browserify) Node Buffer, and for [ndarrays](https://npmjs.org/package/ndarray).

It also handles functions, using the Function constructor.

## Johnny, why?

A couple of reasons.

Browsers speak ArrayBuffers at the lowest level.  I wanted to to send and recieve data that way.  I use ndarrays and TypedArrays a lot, so I wanted to easily send them over the network, and between windows / processes.  Stringifying large ArrayBuffers is not ideal.  But sending metadata such as can accompany any old JSON is nice.  The twain have met.

Another reason is to build a node style event interface between web workers, iframes, and windows.

# So you can

This module exports two functions:
```js
var xxx = require('jmao')
var deconstruct = xxx.deconstruct
var construct = xxx.construct
```
continuing...
```js
var obj = {id: 'HK289hns918hNPN8yphp', body: new Float32Array(64)}
var event = {name: 'data', data: obj}
var buffer = deconstruct(event)
//  ArrayBuffer {}
window.parent.postMessage(buffer, '*')
```
elsewhere...
```js
window.onmesssage = function(evt){
  var buffer = evt.data
  var event = construct(evt.data)
  var data = event.data
}
```

