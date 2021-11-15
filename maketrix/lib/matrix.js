var generateMatrix = require('./maketrix');

module.exports = function(stage, arena){
    var y = plusminus(200);
    var z = 0;
    var a
    , dots = []
    ;


    for(a = 1; a <= 360/2; a++){
	var dot = document.createElement('div');
	dot.classList.add('dot');
	var el = document.createElement('div');
	el.appendChild(dot);
	dots.push(el);
	el.classList.add('maketrix-object');
	el.id = 'dot' + a;
	arena.appendChild(el);
	el.coords = [a * 2, a * 2, 90]
	var t = Math.sin((360 / a / 2)) * 300
	el.x = 360 * Math.random()
	el.style['-webkit-transform-origin'] = '50% 50% -'+70+'px ';
	el.style['-webkit-transform'] = generateMatrix(el.x, a* 2, 0,0,0, 700, 1)
       el.z = 10
       el.a = a*2
//       el.x = 0
	el.o = 700
    }

    function rotate(){
     z+=11
      var els = [].slice.call(document.querySelectorAll('.maketrix-object'));
      els.forEach(function(e){
	  var q =  z * Math.random();
        e.style['-webkit-transform'] = generateMatrix(z * Math.random(), z * Math.random(),0,0,0,q, 1);
	e.style['-webkit-transform-origin'] = '50% 50% -'+q+'px ';
      })
      arena.style['-webkit-transform'] = '';
      arena.style['-webkit-transition'] = '';
      arena.style['-webkit-transform'] = generateMatrix(0, 0 ,0,0,0, -z, 1);
      arena.style['-webkit-transition'] = 'all 1s linear';
    }

    arena.addEventListener( 'webkitTransitionEnd', rotate, false );
    setInterval(rotate, 100);


}

function plusminus(num){

  var flip = true
  num = num;

  return function(){
    flip = !flip;
    var a = flip ? num : num * -1
    return a * Math.random()
  }

}
