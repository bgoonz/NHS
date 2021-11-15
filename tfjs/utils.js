var $ = module.exports

$.combinatorial = function(n, k){ var p = n - k; var x = 1; while(n > p) x*=(n--); return x}


