var Redis = require('redis')
  , redis = Redis.createClient()
  , getMessages = require('../lib/get.messages')
  , EV2 = require('../lib/events.emitter').EventEmitter2
  , ev = new EV2()
;

module.exports = GET

function GET (req, res)
{
  if(req.url === '/') 
  {
    getMessages(0, 10, 'user@messages', ev.remit('msgs'))
    ev.on('msgs', function(e, msgs)
    {
     home(res, msgs) 
    })
  }
}

function home(res, msgs)
{
  res.render('index', {layout: false, msgs: msgs, title: 'Express'}); 
};