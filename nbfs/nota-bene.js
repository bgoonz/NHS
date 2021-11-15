var through = require('through');
var path = require('path');

var FILESYSTEM = null;
var TYPE = 1;
var SIZE = 1024 * 1024 * 1024 * 5;

getFileSystem(function(){})

var FS = module.exports

FS.createWriteStream = createWriteStream
FS.readdir = readdir
FS.mkdir = mkdir
FS.rmdir = rmdir
FS.createReadStream = createReadStream
FS.write = write
FS.writeFile = writeFile
FS.readFile = readFile
FS.unlink = unlink
FS.rename = rename
FS.mv = rename
FS.setStorage = setStorage
FS.stat = stat

function write(path, buffer, offset, length, pos, cb){
	switch ('function'){
		case typeof buffer:
			throw new Error('Buffer must be a string or array')
			break;
		case typeof offset:
			cb = offset
			offset = 0
			length = null
			pos = null
			break;
		case typeof length:
				cb = length;
				length = null
				pos = null
			break;
		case typeof pos:
				cb = pos;
				pos = null;
			break;
	}
	cb = maybeCallback(cb);
	getFileSystem(function(err, fs){
		if(err) {
			cb(err, null)
			return
		}
		fs.root.getFile(path, {create: true}, success, error)
		function success(fileEntry){
			fileEntry.createWriter(function(writer){
				if(pos) writer.seek(pos)
				var _buf = null;
				var l = buffer.length || buffer.byteLength;
				if(offset || length) {
					_buf = buffer.slice(offset, length)
					l = length
					console.log(_buf)

				}
				writer.write(new Blob([_buf || buffer]))
				cb(null, l, buffer)
			}, error)
		}
		function error(err){
			cb(err, null)
		}	
	})
}

function writeFile(path, data, opts, cb){
	var encoding = 'utf8';
	if(typeof opts == 'string'){
		encoding = String(opts).toLowerCase();
		opts = Object.create(null)
	}
	if(typeof opts == 'function'){
		cb = opts;
		opts = Object.create(null);
		encoding = 'utf8';
	}
	FS.write(path, data, 0, null, null, cb)
}

function readFile(path, opts, cb){
	var encoding = 'utf8';
	if(typeof opts == 'string'){
		encoding = String(opts).toLowerCase();
		opts = Object.create(null)
	}
	if(typeof opts == 'function'){
		cb = opts;
		opts = Object.create(null);
		encoding = 'utf8';
	}
	cb = maybeCallback(cb)
	opts = opts || Object.create(null)
	
	getFileSystem(function(err, fs){
		if(err) {
			cb(err, null)
			return
		}

		fs.root.getFile(path, {create: opts.create || false}, success, error)
		function success(fileEntry){
			fileEntry.file(function(file){
				var reader = new FileReader();
				var readType = 'readAsText';
				var type = {type: ''};
			
				switch(encoding){
					case 'base64':
					case 'base-64':
						type.type = 'application/base64'
						break;
					case 'utf8':
					case 'utf-8':
					  type.type = 'text/plain;charset=UTF-8'
						break;
					case 'uri':
					case 'url':
						readType = 'readAsDataURL'
						break;
					case null:
					case 'arraybuffer':
						readType = 'readAsArrayBuffer'
						break;
				}
				reader.onloadend = function(evt){					
					cb(null, this.result)
				}
				reader[readType](file)
			}, error)
		}
		function error(err){
			cb(err, null)
		}
	})
}

function stat(path, cb, create){
	getFileSystem(function(err, fs){
		if(err) {
			cb(err, null)
			return
		}
		fs.root.getFile(path, {create: create || false}, success, error)
		function success(fileEntry){
			cb(null, fileEntry)
		}
		function error(err){
			cb(err, null)
		}
	})
}


function rename(from, to, cb){
	var toDir = path.dirname(to)
	var fromName = path.basename(from);
	var toName = path.basename(to);
	getFileSystem(function(err, fs){
		if(err) return error(err)
		fs.root.getFile(from, {create: true}, success, error)
		function success(fileEntry){
			fileEntry.moveTo(toDir, toName, undefined, function(){
				cb&&cb(null)
			}, error)
		}
		function error(err){
			cb&&cb(err)
		}
	})
}


function readdir(path, cb, create){
	getFileSystem(function(err, fs){
		if(err) {
			cb(err, null)
			return
		}
		fs.root.getDirectory(path, {create: create || false}, success, error)
	
		function success(dir){
			var reader = dir.createReader();
			reader.readEntries(function(results){
				cb(null, results)
			}, error)
		}
	
		function error(err){
			cb(err, null)
		}
	})
}

function mkdir(path, cb){
	
	getFileSystem(function(err, fs){
		if(err) {
			cb(err, null)
			return
		}

		fs.root.getDirectory(path, {create: true}, success, error);

		function success(dir){
			cb(null, dir)
		}

		function error(err){
			cb(err, null)
		}	
	})
}

function rmdir(path, cb){
	
	getFileSystem(function(err, fs){
		if(err) {
			cb(err, null)
			return
		}
		
		fs.root.getDirectory(path, {create: false}, success, error);

		function success(dir){
			dir.remove(function(){
				cb(null)
			}, error)
		}

		function error(err){
			cb(err, null)
		}
	})
}

function createReadStream(path, opts){
	
	var encoding = null;
	if(typeof opts == 'string'){
		encoding = String(opts).toLowerCase();
		opts = Object.create(null)
	}
	
	opts = opts || Object.create(null)
	
	var stream = through()

	stream.pause()
	
	getFileSystem(function(err, fs){
		if(err) {
			cb(err, null)
			return
		}
	
		fs.root.getFile(path, {create: opts.create || false}, success, error)
		
		function success(fileEntry){
			stream.url = fileEntry.toURL()

			var readType = 'readAsText';
			var type = {type: ''};
		
			fileEntry.file(function(file){
				switch(encoding){
					case 'base64':
					case 'base-64':
						type.type = 'application/base64'
						break;
					case 'utf8':
					case 'utf-8':
					  type.type = 'text/plain;charset=UTF-8'
						break;
					case 'uri':
					case 'url':
						readType = 'readAsDataURL'
						break;
					case null:
					case 'arraybuffer':
						readType = 'readAsArrayBuffer'
						break;
				}

				var reader = new FileReader();
				var loaded = 0;
				var fileSize = 0;
				reader.onloadstart = function(evt){
					if(evt.lengthComputable) fileSize = evt.total;
					stream.emit('loadstart')
					stream.emit('open')
				}
				reader.onprogress = function(evt){
					var chunkSize = evt.loaded - loaded;
					stream.emit('data', this.result.slice(loaded, loaded + chunkSize))
					loaded += evt.loaded;
				}
				reader.onloadend = function(evt){
					stream.emit('end')
				}
				reader[readType](file, type)
			})
		}

		function error(err){
			stream.emit('error', err)
		}
	})
	return stream
	
}

function createWriteStream(filePath, opts){
	
	var stream = through()

  stream.pause()
	
	getFileSystem(function(err, fs){
		if(err) {
			cb(err, null)
			return
		}

    opts = opts || {}
		
    fs.root.getFile(filePath, {create: opts.create || true}, success, error)

    function error(err){ stream.emit('error', err) }

		function success(fileEntry){
			
      stream.url = fileEntry.toURL()
      stream.emit('open')

      fileEntry.createWriter(function(fileWriter) {

        stream.on('end', function(){
          process.nextTick(function(){
            if (fileWriter.readyState !== fileWriter.DONE){
                fileWriter.onwriteend = function(){
                stream.emit('close')
              }
            } else {
              stream.emit('close')
            }
          })
        })

        if (opts.start){
          fileWriter.seek(opts.start)
        } else if (opts.flags == 'r+') {
          fileWriter.seek(fileWriter.length)
        }

				fileWriter.onerror = function(err){
					stream.emit('error', err)
				}
				
				fileWriter.onwriteend = function(evt){
					if(fileWriter.readyState = fileWriter.DONE) stream.resume()
				}

        stream.on('data', function(data){
          var blob = new Blob([data])
          fileWriter.write(blob);
					if(fileWriter.readyState == fileWriter.WRITING) stream.pause()
        })

        stream.resume()
      }, error)

    }
	})
	return stream
  
}

function unlink(path, cb){
	getFileSystem(function(err, fs){
		if(err) {
			cb(err, null)
			return
		}
		fs.root.getFile(path, {create: false}, function(fileEntry){
			fileEntry.remove(function(){
				cb&&cb(null)
			}, error)
			function error(err){
				cb&&cb(err)
			}
		})
	})
}

function setStorage(s, cb){
	cb = cb || function(){}
	TYPE = window.PERSISTENT
	SIZE = s || 1024 * 1024 * 1024
	getFileSystem(cb, true)
}

function getFileSystem(cb, reload){	
	if(FILESYSTEM && !(reload)) cb(null, FILESYSTEM);
	else{
		if(window.requestFileSystem){
			window.reqFileSystem(TYPE, SIZE, function(fs){
				FILESYSTEM = fs;
	      cb(null, FILESYSTEM)
	    }, function(err){cb(err, null)})
		}
		else if(window.webkitRequestFileSystem){
			navigator.webkitPersistentStorage.requestQuota(SIZE, function(grantedBytes) {
				  window.webkitRequestFileSystem(TYPE, grantedBytes, function(fs){
						FILESYSTEM = fs;
			      cb(null, FILESYSTEM)
				}, function(err) {
				    cb(err, null)
				});
			})
		}
		else{
			cb(new Error('no file system', null))
		}		
	}
}

function rethrow() {
  return function(err) {
    if (err) {
      throw err;  // Forgot a callback but don't know where? Use NODE_DEBUG=fs
    }
  };
}

function maybeCallback(cb) {
  return typeof cb === 'function' ? cb : rethrow();
}

