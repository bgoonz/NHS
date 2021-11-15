module.exports = function(center){
  var c = center || [window.innerWidth / 2, window.innerHeight / 2]
  return function(xy, w, h){
      w = w || 0
      h = h || 0
      return [(c[0] + xy[0]) - (w / 2), (c[1] - xy[1]) - (h / 2)] 

  }
}
