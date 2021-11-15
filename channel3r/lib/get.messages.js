var Redis = require('redis')
  , redis = Redis.createClient()
;

module.exports = function(start, stop, index, cb)
{
  var start = start || 0
    , stop = stop || 25
    , index = index || 'user@messages'
    , multi = redis.multi()
  ;
  
  redis.zrevrange(index, start, stop, function(er, list)
  {
    list.forEach(function(e)
    {
      multi.hgetall(e)
    })
    multi.exec(function(e, msgs)
    {
      cb(e, msgs)
    })
  })
}