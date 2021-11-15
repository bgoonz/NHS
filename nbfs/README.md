# Nota Bene

A partial clone of Node.j's fs module (including streams) for the browser File System API. Currently, only asynchronous methods are provided, per the File System API (sync is in the spec but not supported yet). All methods copy Node's FS module. Use with browserify.

__Nota Bene__ uses [through](https://github.com/dominictarr/through) to expose read and write streams.

## Methods
* createWriteStream
* createReadStream
* writeFile
* write
* unlink
* rename (aka mv)
* read
* readdir
* mkdir
* rmdir
* stat

There is also a helper method for the File System API.
* setStorage(size) 

Call this method before any others if you don't want these defaults:
```js
size = 1024 * 1024 * 1024 // in bytes
```

The default and standard for this module is persistent storage, to whatever extent the browser grants this.

## usage
```
npm install nota-bene
```
Then use it as you would the FS module, from the example in /test.js
```js
var fs = require('./nota-bene');

var buf = new Float32Array(1024 * 1024);
for(var x = 0; x < buf.length; x++){
	buf[x] = Math.sin((x / 1024 * 1024) * Math.PI * 2)
}
fs.mkdir('/tmp', function(err){
	if(err) console.log(err)
	else{
		fs.writeFile('/tmp/pipeTest', buf, function(err){
			if(err) console.log(err)
			var ws = fs.createWriteStream('/tmp/pip')
			var rs = fs.createReadStream('/tmp/pipeTest')
			rs.pipe(ws)
			ws.on('data', function(data){
				console.log(data)
			})
			setTimeout(function(){
				fs.readFile('/tmp/pip', 'arraybuffer', function(err, file){
					console.log('pipetest', err, file)
				})
			}, 1000)
		})		
	}
})

```

## Tests

Currently the "test" is an incomplete example with some logging to the console. 
Real test forthcoming.
It can be run like so:

First install browserify and opa
```
npm install -g browserify opa
```
Then:
```
git clone https://github.com/NHQ/nbfs
cd nbfs
opa -n -e test.js
```
you can pass a port number:
```
opa -n -e test.js -p 5000
```

