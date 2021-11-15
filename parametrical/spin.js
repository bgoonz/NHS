var knob = require('./knob')(function(d, a){
  console.log(d, a)
})

document.body.appendChild(knob)
