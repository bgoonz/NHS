var p = document.createElement('pre');
p.style.visibility = 'hidden';
p.style.zIndex = -10;
p.style.position = 'absolute';
p.style.left = '-3000px';
p.style.margin = '0';
p.style.padding = '0';
//p.style.whiteSpace = 'nowrap';
p.textContent = '';

document.body.appendChild(p)
var alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
var punc = ',./;"\'<>?:"{}|!@#$%^&*()-=_+ '

module.exports = function(string, params){
  if(!('string' == typeof string)) {
    params = string || {}
    var a = typify(alpha, params);
    var p = typify(punc, params)
    var dict = {};
    dict.average = {alphabet: a.average, punctuation: p.average}
    for(var x in a) dict[x] = a[x]
    for(var y in p) dict[y] = p[y]
    dict.alphabet = a;
    dict.punctuation = p;
    return dict
  }
  else{
    return typify(string, params)
  }
}

function typify(string, params){

  for(var x in params){
    p.style[x] = params[x]
  }  

  var dict = {}
  var a = string.split('');
  var alphabet = a.map(styleMap)
  var sumWidth= alphabet.reduce(function(p,e,i,d){
    return p + e[0]
  }, 0)
  var sumHeight = alphabet.reduce(function(p,e){
    return p + e[1]
  },0)
 
  a.forEach(function(e,i){
    dict[e] = alphabet[i]
  })
  dict.sum = {width: sumWidth, height: sumHeight}
  dict.max = {}
  dict.max.height = alphabet.reduce(function(p,e){
    return e[1] > p ? e[1] : p
  },0)
  dict.average = {height: sumHeight / alphabet.length, width: sumWidth / alphabet.length}
  dict.total = styleMap(string);

  return dict

  function styleMap(e,i){
    var o = {}
    p.textContent = e;
    var w = parseFloat(getCSS(p, 'width'))
    var h = parseFloat(getCSS(p, 'height'))
    return [w, h]
  }

  return dict

}

function getCSS(el, prop){
  return document.defaultView.getComputedStyle(el).getPropertyValue(prop);
}
