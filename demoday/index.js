var proxy = require('../netmorphic-1').http
  , monitor = require('../netmorphic-1').monitor
  , config = require('./config.json')
  , sample_handlers = require('./sample.handlers.js')
  , Cluster = require('cluster2')
;

var clustered = true;

var server = proxy(config, sample_handlers, clustered);  

var cluster = new Cluster({
	    port: 3201,
		monitor: monitor()
});
	
cluster.listen(function(cb) {
		 cb(server.server);
});
