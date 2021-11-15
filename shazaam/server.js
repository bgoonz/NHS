var http = require('http')
,   ecstatic = require('ecstatic')
,   answer = require('answerver')
,   ls = require('ls-stream')
,   path = require('path')
,   fs = require('fs')
,   openSesame = require('sesame-stream')
,   url = require('url')
;

module.exports = function(dir, args){
   
  var home = dir.slice(dir.lastIndexOf('/'))
  
  var subdirs = {}
  ls(dir).on('data', function(data){
    if(data.stat.isDirectory()){
      var duh = data.path.slice(data.path.lastIndexOf('/'))
      if(duh == '/lib' || duh == '/node_modules' || duh == '/cmd' || duh == '/public') data.ignore()
      else{
        subdirs[duh] = data.stat
        var ops = {
          root: data.path + '/public',
          //root: dir + duh + '/public',
          autoIndex: true
        }
        subdirs[duh].static = ecstatic(ops)
        data.ignore() // we only want the top level 
      }
    }
  }).on('end', function(){console.log(subdirs)})


  var server = http.createServer(function(req, res){
      
      var host = req.headers.host;
      if(/^www/.test(host)){
        console.log('www found')
        res.writeHead(307, {'Location': 'http://' + host.replace(/^www\./, '') + req.url})
        res.end()
        return
      }
      if(req.url === '/') {
        res.writeHead(302, {'Location': 'http://' + host + req.url + 'index.html'})
        res.end()
        return
      }
      var subdomain = host.split('.')[0]
      var _url = url.parse(req.url)
	subdirs['/' + subdomain].static(req, res, next)
    
      function next(){
        res.writeHead(200, {'content-type' : 'text/html'})
        fs.createReadStream(dir + home + '/index.html').pipe(res)
      }

  });

  server.on('upgrade', openSesame)

  answer(server, 80)

  server.on('error', function(e){
  });

  return server

}

