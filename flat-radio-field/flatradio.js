var fs = require('fs');
var html = fs.readFileSync('./assets/flatradio.html', 'utf8');
var css = fs.readFileSync('./assets/flatradio.css', 'utf8');

module.exports = function(opts){

  var c = css + '';
  
  if(opts.color){ console.log(opts.color)
    c = c.split('OrangeRed').join(opts.color)
  }

  if(opts.selected){
    c = c.split('LimeGreen').join(opts.selected)
  }

  var es = document.getElementById('uxer-radio-style');

  if(es){
    es.parentNode.insertBefore(makeStyle(c), es.nextSibling)
  }
  else{
    document.head.insertBefore(makeStyle(c), document.head.childNodes[0]);
  }


  var fieldset = document.createElement('fieldset');
  fieldset.classList.add('uxer-fieldset');
  if(opts.fontColor) fieldset.style.color = opts.fontColor;

  var legend = document.createElement('legend');
  legend.classList.add('uxer-legend');
  legend.textContent = opts.legend.toUpperCase();
  if(opts.legendColor) legend.style.color = opts.legendColor;

  var labels = opts.options.map(function(e, i){
      
      var label = document.createElement('label');
      label.classList.add('uxer-label');

      var inp = document.createElement('input');
      inp.classList.add('uxer-input');
      inp.name = opts.name;
      inp.value = e.value;
      inp.type = 'radio';
      inp.checked = e.checked || false;
      var radio = document.createElement('div');
      radio.classList.add('uxer-radio');

      var p  = document.createElement('p');
      p.classList.add('uxer-radio-name');
      p.textContent = e.value.toUpperCase();

      label.appendChild(inp)
      label.appendChild(radio)
      label.appendChild(p);

      label.addEventListener('touchstart', function(e){

	var theEvent = document.createEvent('MouseEvents');
	theEvent.initEvent('click', true, true);
	this.dispatchEvent(theEvent);

      }, true)

      label.addEventListener('touchmove', function(e){
	e.preventDefault();
      }, true)

      label.addEventListener('touchend', function(e){
	e.preventDefault();
      }, true)

      return label
  });
    
  fieldset.appendChild(legend);

  labels.forEach(function(e, i){
    fieldset.appendChild(e)
  })

  return fieldset;

}

function makeStyle(str){
  var style = document.createElement('style');
  style.id = 'uxer-radio-style';
  style.textContent = str;
  return style
}
