;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var alpha = require('./');

var styles = {}
styles.fontFamily = 'Audiowide, Georgia';
styles.fontSize = '30px'
var dict = alpha('king of infinite space', styles)

console.log(dict)
styles.fontSize = '50px'
var stringDict = alpha('king of infinite space', styles)

console.log(stringDict)

},{"./":2}],2:[function(require,module,exports){
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

},{}]},{},[1])
;