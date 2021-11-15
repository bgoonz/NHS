var raf = window.requestAnimationFrame

var calls = []

var callbro = function(time){
  calls.forEach(function(caller){
    if(caller) caller(time)
  })
  calls = []
  raf(callbro)
}

raf(callbro)

module.exports = function(fn){

  var index = calls.length

  calls.push(fn)

  return function(fn){
    calls[index] = fn
  }

}
