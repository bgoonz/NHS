var fs = require('fs')
	,	crypto = require('crypto')
	, client = require('redis').createClient()
	,	async = require('async')
	,	emailSpice = 'redtickcoonhound'
	,		path = require('path')
	,		resolvedPath = path.resolve('./', './lib/auth/peopleDB')
;

/*
 *	newPerson._id is email hashed
 */

client.select('people');



exports.verify = function(obj, cb){ // @obj === submited form data, req.body

        var hash = crypto.createHash('sha1')
        ;
	
	var id = hash.update(obj.email).update(emailSpice).digest('hex')
		,	pw = obj.password
		,	cb = cb
	;
	
	async.parallel([checkRedis, checkHard], evaluate)
	
	function checkRedis(cb){
		client.hgetall(id, cb)
	};

	function checkHard(cb){ console.log(__dirname)
		fs.readFile(resolvedPath + '/' + id, 'utf8', cb)
	};

	function evaluate(err, result){
		if(err){cb(err, true); /*  no such user in hard db */ return}
		
		var hardData = JSON.parse(result[1]);
		
		if(result[0] && hardData){
                
                        var phash = crypto.createHash('sha1');
				
			var user = 
					result[0].date_last_edited >= hardData.date_last_edited ?
					result[0] : 
					hardData 
				,	hashedPass = phash.update(pw).update(user.salt).digest('hex')
				;
				
			cb(null, (hashedPass === user.password) ? user : 'Wrong password')
			
		}
		
		else cb(null, false)
		
	};
	
};

exports.update = function(person){
	
};

exports.del = function(person){
	
};

exports.create = function(newPerson){
	
	try { // user email already exists // Also this ty catch shit is lame
	
		var p = fs.statSync(resolvedPath + '/' + newPerson._id); // if its not there, Node will throw up error
						
		return true
	
	}
	
	catch(err) { // no duplicate
				
		fs.writeFileSync(resolvedPath + '/' + newPerson._id, JSON.stringify(newPerson), 'utf8')
				
		client.hmset(newPerson._id, newPerson, function(e,r){if(e)console.log(e)})
		
		return false
		
	}
		
};

