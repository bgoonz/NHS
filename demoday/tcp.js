var TCProxy = require('../netmorphic-1').tcp
, monitor = require('../netmorphic-1').monitor;
var internet = require('./tcp.handlers');

var config = require('./tcp.config.json');

var servers = TCProxy(config, internet, false)

// because each TCP connection uses a port
// netmorphic returns an array of servers
// one for each port

// to start one individual server ....

servers[0].app.listen(10001)