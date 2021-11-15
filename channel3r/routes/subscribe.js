module.exports = GET

function GET (req, res)
{
  if(req.url === '/') home(req, res);
}

function home(req,res)
{
  res.render('index', {layout: false, title: 'Express'}); 
};