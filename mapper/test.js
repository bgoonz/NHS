var fs = require('fs')

var uuid = require('uuid')
var level = require('levelup')
var ls = new (require('json-stream'))

var geoLevel = require('level-geo')
var DB = level('./data')
var gdb = geoLevel(DB)

var rs = fs.createReadStream('./trees.geojson').pipe(ls).on('data', function(data){
	var id = uuid.v4()
	data = {species: data.properties.SPECIES, lng: data.geometry.coordinates[0], lat: data.geometry.coordinates[1]}
	gdb.put(id, data)
})

rs.on('end', function(){
	console.log('done\n')
	gdb.createSearchStream({
		bbox: [[-122.18280096717119, 37.78858395077543], [-122.18280096717119, 37.78858395077543]]
	}).on('data', function(data){console.log(data)})	
})