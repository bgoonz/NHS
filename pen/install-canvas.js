module.exports = installCanvas

function installCanvas(parent, zIndex){
  if('number' == typeof parent){
    zIndex = parent;
    parent = null
  }
  if(!parent) parent = document.body
  var canvas = document.createElement('canvas')
  canvas.width = parseFloat(getCSS(parent, 'width'))
  canvas.height = parseFloat(getCSS(parent, 'height'))
  canvas.style.width = canvas.width + 'px'
  canvas.style.height = canvas.height + 'px'
  canvas.style.position = 'absolute'
  canvas.style.backgroundColor = 'transparent'
  canvas.style.zIndex = zIndex || 1 
  canvas.style.top = '0px'
  canvas.style.left = '0px'
  parent.appendChild(canvas)
  return canvas
}

function getCSS(el, prop){
  return document.defaultView.getComputedStyle(el).getPropertyValue(prop)
}

