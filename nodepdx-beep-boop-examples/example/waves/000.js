var baudio = require('baudio');
var b = baudio(function (t) {
    var freq = 400;
    return Math.sin(2 * Math.PI * t * freq);
});
b.play();

/*
     _---_                _---_              
   ./     \.            ./     \.            
-  -  -  -  ,  -  -   -,  -   -  ,-  - -   -,
             ``------``           ``------`` 

*/
