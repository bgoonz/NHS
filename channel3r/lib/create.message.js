var crypto = require('crypto')
;

module.exports = function(msg)
{

  delete msg._wysihtml5_mode; // see about this some time

  var ms = new Date().getTime()
    , shasum = crypto.createHash('sha1')
    , str = JSON.stringify(msg)
  ;
   
  msg.id = shasum.update(str).digest('base64')
  msg.created = ms

  return msg
 
}

