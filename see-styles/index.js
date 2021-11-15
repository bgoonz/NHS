module.exports = function(el, ops){
  ops = ops || {}
  var $ = el.style
  var gtc = 'grid-template-column'
  var gtr = 'grid-templare-row'
  var square = ops.square || Math.ceil(Math.sqrt(el.children.length)) 
  $.display = 'grid'
  $[gtc] = `repeat(${square}, 'auto')`
  $[gtr] = `repeat(${square}, 'auto')`
  $.justifyItems = $.alignItems = 'center'
  ;[].forEach.call(el.children, function(e,i){ 
    e.style.gridColumn = `${(i%square) + 1} / span 1` 
    e.style.gridRow = `${square%(i+1)} / span 1`
  })
}
