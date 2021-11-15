A single event for mouse on, mouse around & mouse out.
Can be used on whole elements, or for distinct points within any element. 
The latter feature was added specifically for canvas nodes.

##
```js
var hover = require('mouse-around')
```

### hover(el, [points], callback)

callback will be fired when mouse hovers the element.  if an array of point-circles is included, the callback will only fire when hovering that areat that offset within the element.  See below for example points array.

## install

```
npm install mouse-around
```

## example

```js
  var mouseAround = require('mouse-around');

  // the node u want to trigger on
	var node = document.getElementById('someElement');
  
  // optionally, an array of point-circle objects
  var points = [(x: 100, y: 100, radius: 25}/*,{...}*/]
	
  var hoverBot = document.getElementById('hoverbot');
	
	mouseAround(node, callback, points); // otionally include an array of point-circle objects 
	
	// evt = the mouse event
	// node = the original node you were listening to
	// position = the absolute position of the element currently being hovered (which may be a child element)
	// start & stop = boolean
	
	function callback(evt, node, position, start, end){
		hoverBot.style.left = 50 + evt.clientX + "px";
		hoverBot.style.top = evt.clientY - 25 + 'px';
		if(end) hoverBot.style.left = '-1000px'; 
	};
	
```
LICENSE: MIT
