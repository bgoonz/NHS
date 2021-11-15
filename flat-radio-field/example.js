var radioField = require('./flatfield.js');

//var fieldset = radioField({legend: 'love me with a', name: 'osc-type', options: [{value: 'sine'}, {value: 'triangle'}, {value: 'saw', checked: true}]})

var fieldset = radioField({
    legend: 'Source / Input Options', 
    name: 'osc-type', 
    options: [
	{text: 'SUBMIT LINK', placeholder:'ex: http://youtube.com/watch?this',  type: 'url', change:function(){console.log(this.value)}},
	{text: 'OPEN  LOCAL FILE', type: 'file',  change:function(){console.log(this.files)}},
	{text: 'MIC / LINE IN', type: 'button', change:function(){console.log(this)}}
    ]})

// just add a regular change event listener to the parent fieldset

fieldset.addEventListener('change', function(e){

  var chosenRadialValue = e.srcElement.value

}, true);

var div = document.createElement('div');

div.style.width = '320px';

div.appendChild(fieldset)

document.body.appendChild(div);



