var monitor = require('netmorphic').monitor(3100)
var netmorphic = require('netmorphic').proxy
  , Cluster = require('cluster2')
  , fs = require('fs')
  , config = require('./config.json') // edit this config file for your usage, or change the path to your own config
  , customHandlers = null
  , clustered = true
  , httPort = 3201
  , httpsPort = 3443
  , cluster = new Cluster({
	  monitor: monitor
    })
  , certs = false
;

// IF YOU WANT HTTPS, UNCOMMENT BELOW AND CHANGE RELATIVE FILE PATHS (from this dir) TO YOUR KEY AND CERT FILES
// YOU ALSO NEED TO SET https: true IN YOUR CONFIG FOR HTTPS ROUTES

/*

var certs = {
  	key:  '../PATH/TO/KEY.pem',
  	cert: '../PATH/TO/CERT.pem'
};

*/


var servers = netmorphic(config, customHandlers, clustered, httPort, httpsPort, certs)

servers.forEach(function(e){
	var server = e.app;
	server.on('netmorphic-begin-event', function(event){
		console.log(event)
	});
	server.on('netmorphic-end-event', function(event){
		console.log(event)
	})
})
	
cluster.listen(function(cb) {
    cb(servers);
});
