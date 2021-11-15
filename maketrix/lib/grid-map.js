var win = require('./screen')()
  , gridLayer = require('gridlayer')
  , utils = require('./getCSSPrimitiveValue')
  ;

module.exports = function(id, resx, resy){

  if(!resx) resx = 10;
  if(!resy) resy = resx;

  var el = document.getElementById(id);

  var style = window.getComputedStyle(el)
    ,  undefinedProperties = []
  ;

  el.computedStyles = {};

  Array.prototype.slice.call(style).forEach(function(x){
      var val = el.computedStyles[x] = style.getPropertyCSSValue(x);
      var primitives = utils(val);
      if(!primitives){
  	undefinedProperties.push(o)
	return
      }
      val.primitiveTypeString = primitives.type;
      val.type = primitives.value.type;
      val.value = primitives.value.val;
      val.unit = primitives.value.unit;
      val.property = x;
  });

  console.log(el.computedStyles)

  var x = el.computedStyles.width.value;
  var y = el.computedStyles.height.value;

  var grid = gridLayer(x / resx, y / resy)

//  console.log(x, y, grid)

  return grid

}
