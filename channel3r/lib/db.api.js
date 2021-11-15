var Redis = require('redis')
  , redis = Redis.createClient()
  , gcb = require('lib/generic.callback.js')
;

module.readMSG = function (id)
{

  redis.hmgetall(id)

}

module.insertMSG = function (msg)
{

  redis.hmset(msg.id, msg, gcb)  

}