require('./reqFrame')
var stage = document.getElementById('stage');
var show = require('uxer-show')

var set = show('stage', 'left')
set.goTo(2)

Hammer(stage).on('swipeleft dragleft', leftHandler)
Hammer(stage).on('swiperight dragright', rightHandler)

document.ontouchmove = function(e){e.preventDefault()}

function leftHandler(evt){
  evt.preventDefault()
  evt.gesture.stopDetect();

  set.next();
}

function rightHandler(evt){
  evt.preventDefault()
  evt.gesture.stopDetect();

  set.prev();
}

//setInterval(set.next, 1000)



