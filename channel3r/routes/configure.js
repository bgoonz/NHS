var fs = require('fs')
  , config = fs.readFileSync('./config.json');
;

exports.get = GET
exports.post = POST
exports.put = PUT
exports.del = DEL

function GET (req, res)
{
  res.writeHead('200');
  res.write(config);
  res.end();
}

function POST (req, res)
{

}

function PUT (req, res)
{

}

function DEL (req, res)
{

}