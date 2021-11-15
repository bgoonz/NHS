var fs = require('fs')
var ls = new (require('json-stream'))
var restify = require('restify')
var level = require('levelup')
var sub = require('level-sublevel')
var geoLevel = require('level-geo')
var uuid = require('uuid')
var concat = require('concat-stream')
var allowCORS = require('./lib/allowCORS')
//var auth = require('./lib/auth.js')
//var users = level('./data/users/')
var DB = sub(level('./data'))
var users = DB.sublevel('users')
var geo = DB.sublevel('geo')
var gdb = geoLevel(DB)
var sessionStore = require('./lib/sessions')(DB)
process.on('exit', function(c0de){
  console.log(c0de)
  DB.close()
//  users.close(function(){console.log('users closed')})
//  gdb.close(function(){console.log('gdb closed')})
})

var server = restify.createServer({
	name: 'geoTest',
	version: '0.0.1'
})
var count = 0
var rs = fs.createReadStream('./trees.geojson').pipe(ls).on('data', function(data){
	var id = uuid.v4()
	data = {species: data.properties.SPECIES, lng: data.geometry.coordinates[0], lat: data.geometry.coordinates[1]}
//	console.log(data)
//	gdb.put(id, data)
})

rs.on('end', function(){
  console.log(gdb._rtree.toJSON().slice(0,50000))
//  gdb.saveIndex()
  console.log('done loading database.')
  console.log('\ntry http://0.0.0.0:11111/data?lat=37.788583950&lng=-122.18280096&radius=0.02')
//	gdb.createSearchStream({
	//	bbox: [[-122.18280096717119, 37.78858395077543], [-122.18280096717119, 37.78858395077543]]
//	}).on('data', function(data){console.log(data)})	
})

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(sessionStore)
server.use(allowCORS)
  
server.post('/register', function(req, res, next){
  var _data = JSON.parse(req.body);
  users.get(_data.email, function(err, data){
    if(err) {
      users.put(_data.email, JSON.stringify({email: _data.email}), function(err, data){
        if(err)console.error('new users put error', err.toString());
        else{ // data is undefined, but user is created
          res.writeHead(302, {"Location":server.url})
          res.end()
        }
      })
    }
    else {// email already taken!
      console.log('data', typeof data, data)
    }
  })
  res.end()
})

server.get('/data', function(req, res, next){
	console.log(req.session)
  res.writeHead(200, {"Content-Type":"application/json"})
	var r = parseFloat(req.params.radius) || .002
	var bbox = [ [ parseFloat(req.params.lng) - r, parseFloat(req.params.lat) - r], [ parseFloat(req.params.lng) + r, parseFloat(req.params.lat) + r] ];
	var s = gdb.createSearchStream({
		bbox: bbox
	//	bbox: [[-122.18280096717119, 37.78858395077543], [-122.18280096717119, 37.78858395077543]]
	}).pipe(concat(function(data){
		if(!data.length) data = {}; 
		res.write(JSON.stringify({data: data}));
		res.end()
	}))
	s.on('error', function(err){console.error(err)})
	s.on('end', function(){})
})

server.post('/data', function(req, res, next){
	var id = uuid.v4()
	req.params.lat = parseFloat(req.params.lat)
	req.params.lng = parseFloat(req.params.lng)
	geo.put(id, req.params, function(err){
		if(err) console.error(err)
	})
	res.writeHead(200, {"content-type":"application/json"})
	res.end(req.params)
})

server.listen(11111, function () {
  console.log('%s listening at %s', server.name, server.url);
  console.log('loading database...')
});
//g.geocode('3276 logan st, oakland ca 94601', function(err, loc){
//	console.log(err, loc)	
//})
