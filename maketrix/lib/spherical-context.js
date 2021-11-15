var matrix = require('./matrix')

module.exports = function(radius, perspective){

  var wx = window.innerWidth
    , wy = window.innerHeight
    , bcode = '-webkit-'
  ;

  var style = document.createElement('style')
    , stage = document.createElement('div')
    , arena = document.createElement('div')
  ; 

  stage.classList.add('maketrix-stage');
  arena.classList.add('maketrix-arena');
  arena.id = 'mx-arena';
  stage.id = 'mx-stage';
//  stage.appendChild(arena)
  document.body.appendChild(arena);

  style.textContent = CSS(radius, perspective, bcode);
  style.id = 'maketrix-style';
  document.body.appendChild(style);
  style = Array.prototype.slice.call(document.styleSheets)
	  .reduce(function(acc, e){ 
	    if(e.ownerNode.id == 'maketrix-style') return e}, []);
  console.log(style);

  window.addEventListener('mousemove', function(e){
      document.body.style['-webkit-perspective'] = e.clientY *2;

      arena.style['-webkit-transform'] = 'translateZ(-'+e.clientX *2+'px)';
//    style.cssRules[0].style.cssText += '-webkit-perspective:'+e.clientX *2+'px;'
  }, false);
  matrix(stage, arena);

//  return {stage: stage, arena: arena, stylesheet: style}

}

function CSS(radius, perspective, bcode){
    var css = '' +
	'.maketrix-stage {' +
	'  width: 1px;' +
	'  height: 1px;' + 
	'  margin: 300px auto;' +
	'  '+bcode+'transform-style: preserve-3d;' +
	'}' +
	'.maketrix-arena{'+
	'  width: 1px;' +
	'  height: 1px;' +
	'  margin: 300px auto;' +
	'  '+bcode+'transform: translateZ(-700px);' +
	'  '+bcode+'transform-style: preserve-3d;' +
	'  '+bcode+'transform-origin: 50% 50% -'+0+'px}' + 
	'.maketrix-object{' +
	'  position:absolute;' +
	'}'
    return css
}
