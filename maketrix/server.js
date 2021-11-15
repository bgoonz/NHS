var http = require('http')
  , Static = require('ecstatic')
  , shoe = require('shoe')
  , reload = require('client-reloader')
;

var opts = {};
opts.root = './public';
opts.autoIndex = true;

var server = http.createServer(Static(opts)).listen(8101);


shoe(reload(function (stream) {

    stream.write('greetings');

    stream.on('error', function(e){
      console.log(e);
    })

    stream.on('end', function () {

    });
    
    stream.on('data', function(d){
      console.log(d.toString())
   });

})).install(server, '/game');
