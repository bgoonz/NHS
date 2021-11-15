var input = document.getElementById('input')
var enter = document.getElementById('enter')
var story = document.getElementById('story')


// write module, tbd exported elsewhere

var lines = []
var characters = {}

enter.addEventListener('click', function(evt){
  lines.push(input.value);
  var child = html('p', {id: new Date().getTime()}, input.value) 
  input.value = '';
  story.appendChild(child)
})
