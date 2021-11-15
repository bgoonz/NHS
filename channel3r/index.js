var express = require('express')
  , index = require('./routes/index')
  , subscribe = require('./routes/subscribe')
  , message = require('./routes/message')
  , update = require('./routes/update')
  , configure = require('./routes/configure')
  , http = require('http')
  , path = require('path')
  , redisSession = require('connect-redis')(express)
  , auth = require('./lib/auth')
  , transport = require('./lib/transport')
  , checkSession = require('./lib/checkSession')
;
  

var app = express()
  , IO = require('socket.io').listen(app)

IO.sockets.on('connection', transport)

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('cocofarts'));
  app.use(express.session({store: new redisSession(), secret: 'cocofarts'}));
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', checkSession, index);

app.get('/auth', auth);
app.get('/auth/*', auth);
app.post('/auth/*', auth);

app.post('/update', update.post);
app.put('/update', update.put);
app.del('/update', update.del);

app.post('/message', message.post);
app.put('/message', message.put);
app.del('/message', message.del);

app.post('/subscribe', subscribe.post);
app.put('/subscribe', subscribe.put);
app.del('/subscribe', subscribe.del);

app.get('/configure', configure.get);
app.post('/configure', configure.post);
app.put('/configure', configure.put);
app.del('/configure', configure.del);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
