var fs = require('fs');
var html = fs.readFileSync(__dirname + '/assets/flatfield.html', 'utf8');
var css = fs.readFileSync(__dirname + '/assets/flatfield.css', 'utf8');
var touchdown = require('touchdown');

module.exports = function(opts){

  var c = css + '';
  
  if(opts.color){ console.log(opts.color)
    c = c.split('OrangeRed').join(opts.color)
  }

  if(opts.selected){
    c = c.split('LimeGreen').join(opts.selected)
  }

  var es = document.getElementById('uxer-flatfield-style');

  if(es){
    es.parentNode.insertBefore(makeStyle(c), es.nextSibling)
  }
  else{
    document.head.insertBefore(makeStyle(c), document.head.childNodes[0]);
  }


  var fieldset = document.createElement('fieldset');
  fieldset.classList.add('uxer-flat-fieldset');
  if(opts.fontColor) fieldset.style.color = opts.fontColor;

  var legend = document.createElement('legend');
  legend.classList.add('uxer-flatfield-legend');
  legend.textContent = opts.legend.toUpperCase();
  if(opts.legendColor) legend.style.color = opts.legendColor;
  if(opts.options instanceof HTMLElement) {
      var labels = [opts.options];
  }
  else {
      var labels = opts.options.map(function(e, i){
	  
	  var label = document.createElement('div');
	  label.classList.add('uxer-flatfield-label');
	  label.for = e.name;
	  var inp = document.createElement('input');
	  inp.classList.add('uxer-flatfield-input');
	  inp.name = e.name || opts.name;
	  inp.value = e.value || '';
	  inp.type = e.type;
	  inp.id = e.id || '';
	  inp.checked = e.checked || false;
	  inp.placeholder = e.placeholder || '';

	  label.appendChild(inp)

	  if(inp.type.match('text|number|url|file|button')){
	      var button = document.createElement('button');
	      button.textContent = "SUBMIT";
	      button.textContent = e.text || e.value;
	      button.classList.add('uxer-flat-button');
	      touchdown.start(button);
	      button.addEventListener('deltavector', function(evt){
		  evt.preventDefault();

	      });
	      button.addEventListener('liftoff', function(evt){
		  evt.preventDefault()

	      });
	      button.addEventListener('touchdown', function(evt){
		  evt.preventDefault();

		  if(opts.click){

		      opts.click.call(inp, evt);
		  }
	      });
	      label.appendChild(button);
	  }

	  if(opts.change) inp.addEventListener('change', opts.change, true)

	  if(inp.type.match('radio|checkbox')){
	      var type = document.createElement('div');
	      type.classList.add('uxer-flatfield-radio');
	      var p  = document.createElement('p');
	      p.classList.add('uxer-flatfield-'+inp.type+'-value');
	      p.textContent = e.value.toUpperCase();
	      label.appendChild(type)
	      label.appendChild(p);
	  }

	  touchdown.start(label);

	  label.addEventListener('touchdown', function(e){
//	      e.preventDefault();
	  }, false)

	  label.addEventListener('deltavector', function(e){
//	      e.preventDefault();
	  }, true)

	  label.addEventListener('liftoff', function(e){
//	      e.preventDefault();
	  }, true)

	  return label
      });
  }    
  fieldset.appendChild(legend);

  labels.forEach(function(e, i){
    fieldset.appendChild(e)
  })

  return fieldset;

}

function makeStyle(str){
  var style = document.createElement('style');
  style.id = 'uxer-flatfield-style';
  style.textContent = str;
  return style
}
