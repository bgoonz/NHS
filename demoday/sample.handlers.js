var httpProxy = require('http-proxy')
  ,  urlUtil = require('url');

exports['internet'] = function(req, res){
	var config = req.serConfig;
	var proxy = req.proxy;
    proxy.proxyRequest(req, res, {
        host: req.headers.host,
		port: req.headers.host.split(':')[1] || 80
    });
}

exports['slow internet'] = function(req, res){
	var config = req.serConfig;
	var proxy = req.proxy;
    var buffer = httpProxy.buffer(req);
    setTimeout(function () {
        proxy.proxyRequest(req, res, {
            host:req.headers.host,
            port:80,
            buffer:buffer
        });
    }, config.latency || 1000);
};

exports["drop some"] = function(req, res){
    var config = req.serConfig;
	var proxy = req.proxy;
	
	if (Math.random() > .25){
		var config = req.serConfig;
		var proxy = req.proxy;
	    proxy.proxyRequest(req, res, {
	        host: req.headers.host,
			port: req.headers.host.split(':')[1] || 80
	    });
	}

	else res.end();

};

exports['fake data'] = function (req, res) {
    var config = req.serConfig;
	var proxy = req.proxy;
    var buffer = httpProxy.buffer(req);
    setTimeout(function () {
        req.url = getUrl(req.url, config.url);
        proxy.proxyRequest(req, res, {
            host:config.host || '127.0.0.1',
            port:config.port || 3200,
            buffer:buffer
        });
    }, config.latency || 1000);
};

exports['meta data'] = function(req, res){
	var config = req.serConfig;
    var ip = req.connection.remoteAddress;
	res.writeHead(200);
	var obj = {};
	obj.ip = ip;
	obj.pid = process.pid;
	obj.configuration = config.type;
	res.end(JSON.stringify(obj));
}

function getLatency(lo, hi) {
    if (lo > hi) {
        var temp = lo;
        lo = hi;
        hi = temp;
    }
    return ((hi - lo) * Math.random()) + lo;
}

function getUrl(url, configUrl) {
    if (configUrl) {
        var parsed = urlUtil.parse(url);
        return configUrl + (parsed.search || '') + (parsed.hash || '');
    }
    return url;
}