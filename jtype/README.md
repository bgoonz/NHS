# jtype

Module measures font strings and characters.  Give it a string and a style object, a dictionary is returned with size data about each letter, and some other metadata.  

If you do not pass a string value, it will return a dictionary of measurements for [a-zA-Z0-9] plus punctuations.

## example

```js
var alpha = require('./');

var styles = {}
styles.fontFamily = 'Georgia';
styles.fontSize = '30px';
styles.letterSpacing = '3px';

var dict = alpha(styles) 

console.log(dict)

var stringDict = alpha('king of infinite space', styles)

console.log(stringDict)
```
