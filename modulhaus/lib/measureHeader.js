var jtype = require('../../jtype')
var s = 22 
var w = window.innerWidth
module.exports = function(){
  var styles = {
    fontFamily: 'Audiowide' 
  }

  var dict, length = 0;
  while(length < w * .80){
    styles.fontSize = (s++) + 'px'
    dict = jtype('modulhaus', styles)
    length = dict.sum.width
    console.log(styles.fontSize, dict, length, w)
  }
  return styles.fontSize 

}
