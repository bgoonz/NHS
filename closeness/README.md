# closeness

[![browser support](https://ci.testling.com/NHQ/closeness.png)](https://ci.testling.com/NHQ/closeness)

Test the proximal range of values

```
npm install closeness
```

## example

The constructor takes 2 parameters, the target value, and the proximal range you want to test.
It returns a function which takes a singe value as an argument, and return true or false if it is close enough.

```js
var howClose = require('closeness');

var close = howClose(100, 5) // returns a fn that will test if your number is with 5 of 100

if(close(96)) console.log('yep its close enough')
if(!(close(50))) console.log('not close enough')

```
## license 
MIT I GUESS