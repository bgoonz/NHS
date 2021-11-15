var http = require('http');
var fs = require('fs');
var spawn = require('child_process').spawn;
var url = require('url');

var ecstatic = require('ecstatic');
var hyperstream = require('hyperstream');
var marked = require('marked');
var front = require('markdown-directory')(__dirname + '/public/texts', '.md');

marked.setOptions({
  breaks: true
})

var opts = {
    root       : __dirname + '/public', 
    autoIndex  : true,
    defaultExt : 'html'
};

var Static = ecstatic(opts);

var b = spawn('watchify', ['-e', __dirname + '/index.js', '-t', 'brfs', '-o', __dirname + '/public/js/bundle.js', '-d'])
b.stderr.on('data', function(data){ console.log(data.toString('utf8'))});

var server = http.createServer(function(req, res){

  console.log(req.url)
  
  if(req.url == '/'){

    res.writeHead(200, {"content-type" : "text/html"})

    var hs = hyperstream({
      "#brief" : front('brief'),
      "#code" : front('code'),
      "#poetry" : front('poetry'),
      "#fiction" : front('fiction'),
      "#essay" : front('essay')
    })

    fs.createReadStream(__dirname + '/public/old_index.html').pipe(hs).pipe(res)
   
  }

  else{

    var paths = url.parse(req.url).pathname.split('/');

    console.log(paths)

    if(req.url.match('poems|scripts|fictions|ideas')){
      
      console.log(paths)

      var hs = hyperstream({
	"#content" : front(req.url)
      })

      res.writeHead(200, {"Content-Type" : "text/html"});

      fs.createReadStream(__dirname + '/public/'+paths[1]+'.html').pipe(hs).pipe(res)
    }
    else{
      Static(req, res)
    }
  }
  
}).listen(10110)
