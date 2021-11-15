(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var hover = require('./')

var pts = [{x: window.innerWidth / 2, y: window.innerHeight / 2, radius: 500}]

hover(document.body, pts, function(e, pt, pts, hut, huthut){

  console.log(pt, pts, hut, huthut)

})

},{"./":2}],2:[function(require,module,exports){
var close = require('closeness')

module.exports = function(node, points, fn){
  
  if(!(Array.isArray(points))){
    fn = points
    points = null
  }

  if(points){
    points = points.map(function(e){
      e.closeX = close(e.x, e.radius || 10)
      e.closeY = close(e.y, e.radius || 10)
      return e
    })
  }

  node.addEventListener('mouseover', onHover, true)

  node.addEventListener('mouseout', onExit, true)

  var node = node;

  var position = [0, 0];

  function mouseMove(evt){

    if(points){
      points.forEach(function(pt) {
        var x, y
        if(pt.closeX(x = evt.offsetX) && pt.closeY(y = evt.offsetY)){
          fn(evt, pt, [x, y], false, true)
        }
      })    
      return
    }

    position = findPos(evt.target);

    fn(evt, node, position, false, false)

  };

  function onExit(evt){

    window.removeEventListener('mousemove', mouseMove, true)
    
    if(points){
      points.forEach(function(pt) {
        var x, y
        if(pt.closeX(x = evt.offsetX) && pt.closeY(y = evt.offsetY)){
          fn(evt, pt, [x, y], false, true)
        }
      })    
      return
    }


    position = findPos(evt.target);

    fn(evt, node, position, false, true)
  };


  function onHover(evt){

    window.addEventListener('mousemove', mouseMove, true);

    if(points){
      points.forEach(function(pt) {
        var x, y
        if(pt.closeX(x = evt.offsetX) && pt.closeY(y = evt.offsetY)){
          fn(evt, pt, [x, y], true, false)
        }
      })    
      return
    }
    

    position = findPos(evt.target);

    fn(evt, node, position, true, false)

  };

}

function findPos(obj) {
  var curleft = 0
  ,   curtop = 0;

  if (obj.offsetParent) {

    do {

      curleft += obj.offsetLeft;

      curtop += obj.offsetTop;

    } 

    while (obj = obj.offsetParent);

    return [curleft,curtop];

  };
};

},{"closeness":3}],3:[function(require,module,exports){
module.exports = function(num, dist){
	return function(val){
		return (Math.abs(num - val) < dist)
	}
};
},{}]},{},[1]);
