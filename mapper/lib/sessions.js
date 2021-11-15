//var level = require('levelup')
//var sublevel = require('level-sublevel')
var uuid = require('uuid')
var cookies = require('cookies')
var keygrip = require('keygrip')(['catpile', 'doglight'])

module.exports = function(_db){

  var db = _db.sublevel('sessions')
  
  return function(req, res, next){

  var cookie = new cookies(req, res, keygrip)
  var sessionID = cookie.get('signed', {signed: true})

  if(!(sessionID)){ // create new session
    console.log('NEW SESSION')
    var session = {
      id: uuid.v1(), 
      created: new Date().getTime(),
      events: {
        server: {},
        client: {}
      }
    }
    session.expires = session.created + (1000 * 60)
    db.put('session:'+session.id, JSON.stringify(session))
    cookie.set('signed', session.id, {signed: true, expires: new Date(session.expires)})
    req.session = session
    next()

  }
  else{
    db.get('session:'+sessionID, function(err, session){
      req.session = JSON.parse(session);
      console.log('OLD SESSION!', JSON.parse(session).id)
      next()
    })
  }
}}
