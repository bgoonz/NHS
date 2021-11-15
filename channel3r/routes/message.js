// currently messages == the user's messages
// updates == messages from abroad

var createMessage = require('../lib/create.message.js')
  , Redis = require('redis')
  , redis = Redis.createClient()
  , gcb = require('../lib/generic.callback.js')
;

exports.get = GET
exports.post = POST
exports.put = PUT
exports.del = DEL

function GET (req, res)
{

}

function POST (req, res)
{
  res.writeHead('200');
  var msg = createMessage(req.body);
  redis.zadd('user@messages', msg.id, new Date().getTime(), gcb)
  redis.hmset(msg.id, msg, gcb)
  res.end(JSON.stringify(msg)+'\n');
}

function PUT ()
{
}

function DEL ()
{
}