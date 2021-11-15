module.exports = function(n,m ){
  var seq = new Array(m + n).fill(0).map((e,i) => [i < n ? 1 : e])
  while(n > 1){
    for(var i = 0; i < n; i++){
      seq[i] = seq[i].concat(seq.pop())
    }
    let x = m
    m = n
    n = x - n 
  }
  return seq.reduce((a, e) => a.concat(e), [])
}
