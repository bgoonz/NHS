var ui = require('./yindex')

var st = ui({
  gain: 
    { type: 'dial', value: 1, name: 'gain', mag: 10, min:-1, max: 11 },
  amod: 
    { type: 'dial', value: 1/8, step: 1/8, mag: 1 },
  xy: 
    { type: 'xy', range: [-1, -1, 1, 1], value: [0,0]},
  wah:
    { type: 'button', name: 'wahwah', false: 0, true: 1, value: 0 },
  fire:
    { type: 'shot', name: 'wahwah', false: 0, true: 1, value: 0 },
  bpm:
    { type: 'bpm', name: 'bpm tap', value: 0 },
  timbre:
    { type: 'bezier', name: 'timbre', value: [[0,0], [1/4, 1], [1/3, 1/2], [2/3, 1/2],[3/4, 1/2], [1,0]] }
})

setInterval(function(){
console.log(st)}, 1000)
var sidebar = document.createElement('div')
sidebar.classList.add('sidebar')
$ = sidebar.style
$.display = 'flex'
$.flexDirection = 'row'
$.flexWrap = 'wrap'
$.justifyContent = 'space-around'
$.width = '25%'
$.height = '70%'
$.margin = '11px'
document.body.appendChild(sidebar)
st.forEach(function(e){
  sidebar.appendChild(e)
})
