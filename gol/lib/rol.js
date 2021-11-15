/* in an area that inhibits growth (and decay)
// all you have to do is slow down time
// or speed it up for the oppotiste effect
// in other words, skip ticks of the game clock
*/

module.exports = function(prev, next){
  var r,g,b,a,rr,gg,bb,aa = 0;
  var pa = new Uint8ClampedArray(4)
  var na = new Uint8ClampedArrary(4)

  for(var i = 0; i < prev.length / 4; i++){
    var n = i * 4;


  }

  function getPix(n){
    r = prev[n]
    g = prev[n + 1]
    b = prev[n + 2]
    a = prev[n + 3]
    return 
  }

  function setPix(n){

  }

}
