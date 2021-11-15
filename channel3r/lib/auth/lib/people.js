var	crypto = require('crypto')
	, md
	, salt = 'poopRadish'
	, fs = require('fs')
	, personDB = require('../lib/personDB.js')
	, emailSpice = 'redtickcoonhound' // salt for creating objects ID
        , utils = require('../lib/utils.js')
;

var person = function(obj){

        var ehash = crypto.createHash('sha1')
          , phash = crypto.createHash('sha1')
          ;
          
	this._id = ehash.update(obj.email).update(emailSpice).digest('hex')
	this.password = phash.update(obj.password).update(salt).digest('hex')
	this.salt = salt
	this.email = obj.email
	this.fname = 'Sans'
	this.lname = 'Nombre'
	this.location = null
	this.files = null
	this.age = ""
	this.dob = ""
	this.companies = undefined
	this.channels = null
	this.networks = null
	this.comments = undefined
	this.published = undefined
	this.comments = undefined
	this.date_created = utils.spaceTime()
	this.date_last_edited = utils.spaceTime()
};

module.exports = person;
