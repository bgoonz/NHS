module.exports = function(p1, p2, p3, p4){
  var a = [p1, p2];
  var b = [p3, p4];  
  return !(a[1][0] < b[0][0] || a[1][1] > b[0][1] || b[1][1] > a[0][1] || b[1][0] < a[0][0] ) 
}

