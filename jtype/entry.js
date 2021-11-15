var alpha = require('./');
var ready = require('domready');

ready(function(){
  var styles = {}
  styles.fontFamily = 'Audiowide, Georgia';
  styles.fontSize = '30px'
  var dict = alpha('king of infinite space', styles)

  console.log(dict)
  styles.fontSize = '50px'
  var stringDict = alpha('king of infinite space', styles)

  console.log(stringDict)
  })
