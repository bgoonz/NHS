# offsetter

This module is a simple thing does two things:
* moves (in the abstract) the center of your browser/css coordinate system to wherever you want, instead of the top-left corner.
* returns coordinates that offset your position to the middle of object (based on width & height)

```
npm install offsetter
```

### usage
offsetter returns a function that you call with new center, relative to [0,0] in the top-left, so:
```js
var offsetter = require('offsetter')
var center = [window.innerWidth / 2, window.innerHeight / 2]
var offset = offsetter(center)
```
The function that is returned from the constructor takes 3 args
```js
var width = 20
var height = 20
var coord = [-200, 200]
var newCoordinate = offset(coord, width, height)
```

### example
from ex.js
```js
var offset = require('./')([500,500]) // sets the new [0,0] to [500,500] the page
                                      // ie. offset([window.innerWidth / 2, window.innerHeight])

// test centering at the new [0,0] a supposed object that is height and width zero
console.log(offset([0,0], 0, 0))

// test position at [5,5], an item that is height and width 10
console.log(offset([5,5], 10, 10))
```
