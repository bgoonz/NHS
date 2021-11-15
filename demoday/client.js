var http = require('http');

var host = 'localhost'

var headers = {
	host: host,
	port: 3201,
	path: '/get/json',
	method: 'get'
};

setInterval(request, 300)

//setInterval(setConfigType, 2000)

function request(){

	var req = http.request(headers, response);
	
	req.on('error', console.error);
	
	req.end();
	
	function response(res){
				
		res.on('data', function(data){
			var info = JSON.parse(data.toString());
			var a = data.toString().split('","');
			var str = a.join('"\n"')
			console.log(str + '\n')
		})
		
	}

};

var typeswitch = false;

function setConfigType(){
	
	var c = "*"
	
	typeswitch = !typeswitch
	
	var type = typeswitch ? 'fake date' : 'meta data'
	console.log('type = ' + type)
	var headers = {
		host: 'localhost',
		host: host,
		port: 3201,
		path: '/setconfig?tenant=global&srcUrl=' + c + '&type=' + type,
		method: 'get'
	};
	
	var req = http.request(headers, response);
	
	req.on('error', console.error);
	
	req.end();
	
	function response(res){
				
		res.on('data', function(data){
			var info = JSON.parse(data.toString());
			var a = data.toString().split('","');
			var str = a.join('"\n"')
			console.log(str + '\n')
		})
		
	}
	
}
