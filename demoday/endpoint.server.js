var Connect = require('connect')
  , http = require('http')
  , fake = require('./Faker.js')
;

var connect = Connect()
  .use(function(req, res){
	var obj = {};
	obj.EMPLOYEE = fake.Name.findName();
	obj.DEPARTMENT = fake.Company.bs();
	obj.COMPANY = fake.Company.companyName();
	res.writeHead(200);
	res.end(JSON.stringify(obj))
 });

var server = http.createServer(connect).listen(3200)

module.exports = server;