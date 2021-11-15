var parse = require('url').parse
var qs = require('querystring')
var http = require('http')
var spawn = require('child_process').spawn

var openSesame = require('./');
var level = require('levelup')
var sublevel = require('level-sublevel')
var uuid = require('uuid')
var ecstatic = require('ecstatic')
var cookies = require('cookies')
var keygrip = require('keygrip')(['catpile', 'doglight'])
var WebSocketServer = require('ws').Server
var websocketStream = require('websocket-stream')
var wss = new WebSocketServer({noServer: true})

var db = sublevel(level('./data/tmpdbx'))
var sockets = require('./handlers')

var year = 1000 * 60 * 60 * 24 * 365

var opts = {
    root       : __dirname + '/public', 
    autoIndex  : true,
    defaultExt : 'html'
}

var StaticPass = ecstatic(opts);

/**/

var server = http.createServer(function(req, res){
	
	var cookie = new cookies(req, res, keygrip)
	var sessionID = cookie.get('signed', {signed: true});
	var _db;

	if(!(sessionID)){ // create new session
		console.log('NEW SESSION')
		var session = {
			id: uuid.v1(), 
			created: new Date().getTime(),
			events: {
				server: {},
				client: {}
			}
		}
		session.expires = session.created + (1000 * 60)
		_db = db.sublevel(session.id)
		_db.put('session', JSON.stringify(session))
		cookie.set('signed', session.id, {signed: true, expires: new Date(session.expires)})
	}
	else{
			_db = db.sublevel(sessionID)
			_db.get('session', function(err, session){
			console.log('OLD SESSION!', JSON.parse(session).id)
		})
	}
	
	// **** DEV CHANNEL **** browserify stuff
	if(req.url === '/bundle.js'){
	  res.writeHead(200, {'Content-Type': 'text/javascript'});
		var b = spawn('browserify', ['-e', 'entry.js', '-t', 'brfs', '-d']);
		b.stdout.pipe(res);
		b.stderr.on('data', function(data){ console.log(data.toString('utf8'))});
  }

	else StaticPass(req, res)

})
/*
server.on('upgrade', function(req, socket, head){
      var p = parse(req.url);
      var q = qs.parse(p.query);

      wss.handleUpgrade(req, socket, head, function(ws){
	var stream = websocketStream(ws)

//	stream.session = session
	if(sockets.hasOwnProperty(q.type)){
	  if(q.type == 'metadata'){
	    // nohting happens here
	  }
	  else{
	    sockets[q.type](stream, p, q);	
	    stream.on('metadata', function(data){
	      console.log(data)
	    })
	  }			
	}
	else sockets.pingpong(stream, p, q)
      })
})
*/

server.on('upgrade', openSesame)

/*
server.on('upgrade', function(req, socket, head){
  
  var cookie = new cookies(req, undefined, keygrip)
  var sessionID = cookie.get('signed', {signed: true});
  var _db, __db;
  
  if(!(sessionID)){ // no session no socket!
    console.log('NOID')
    //		socket.close()
  }
  else{
    _db = db.sublevel(sessionID)
    _db.get('session', function(err, session){
      session = JSON.parse(session);
      var q = qs.parse(parse(req.url).query);
      wss.handleUpgrade(req, socket, head, function(ws){
	var stream = websocketStream(ws)
	stream.session = session
	if(sockets.hasOwnProperty(q.type)){
	  if(q.type == 'metadata'){
	    // nohting happens here
	  }
	  else{
	    sockets[q.type](stream, q);	
	    stream.on('metadata', function(data){
	      __db = _db.sublevel(q.type)
	      __db.put(data.timestamp, JSON.stringify(data), function(){
		__db.get(data.timestamp, function(err, data){
		  console.log(JSON.parse(data))
		})
	      })
	    })	
	  }			
	}
	else sockets.pingpong(stream)
      })
    })
  }	
})
*/
server.listen(11010)
