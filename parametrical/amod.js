var $ = require('./cheatcode.js')
var solver = require('../beezy/beezy.js')
var touchdown = require('touchdown')
var findPos = require('./findPosition')
var colors = 'red,orange,yellow,green,blue,indigo,violet'.split(',')
var dist = require('./trig.js').distance
console.log(colors)
module.exports = function(p, cb){
  var parEl = parent(p.el)
  var curves = p.value 
  var canvas = canv()//document.createElement('canvas')
  parEl.appendChild(canvas)
  
  const ctx = canvas.getContext('2d')
  ctx.translate(.5, .5)
  var draw = function(state){
    var solve = solver(curves)
    ctx.clearRect(0,0,canvas.width, canvas.height)
    ctx.moveTo(0, canvas.height)
    ctx.beginPath()
    ctx.lineWidth = 7
    ctx.strokeStyle = colors[5]
    ctx.beginPath()

    for(var x = 0; x < canvas.width; x+=1 ){
    var w = x/canvas.width 
      ctx.lineTo(x, (1 - $.amod(state[0], $.oz.saw(w, 1/2) * (curves[0][1] - .5), w, curves[0][0]*8 )) * canvas.height )
    }
    ctx.stroke()
    //process.exit()
    
    
  }
  var dots = []

  var done = false
  donce()

  var observer = new MutationObserver(function(mutations){
    mutations.forEach(function(e){
      if(e.type === 'childList') {
        if(e.addedNodes[0] == parEl) {
          observer.disconnect()
          donce()
        }
      }
    })
  })

  //observer.observe(document.body, {childList: true})

  observeDown(document.body, parEl, function(el){
  })

  function observeDown(pa, el, cb){
    var obs = new MutationObserver(function(mutations){
      mutations.forEach(function(e){
        donce()
      })
    })
    obs.observe(pa, {childList: true})
  }

  function donce(){
    if(done) return
    done = true
    canvas.pos = canvas.getBoundingClientRect()//findPos(canvas)
    draw([1/2, 1/4, 4])
    var pas = parEl.getBoundingClientRect()
    setTimeout(function(){
      curves.forEach(function(e, i){
        ;(function(e, i){
          var dot = handle(e, canvas.pos, i)
          touchdown.start(dot)
          dot.addEventListener('touchdown', function(){
            document.body.style.cursor = 'none'
          })
          dot.addEventListener('liftoff', function(){
            document.body.style.cursor = 'pointer'
          })
          dot.addEventListener('deltavector', function(e){
            window.requestAnimationFrame(function(){
              dot.style.left = e.detail.x - pas.left  + window.scrollX - 15 + 'px'
              dot.style.top =  e.detail.y - pas.top  + window.scrollY - 15 + 'px'
              curves[i][0] = ((e.detail.x + window.scrollX) - canvas.pos.left) / canvas.pos.width
              curves[i][1] =  ((canvas.pos.top + canvas.height) - (e.detail.y + window.scrollY))/ canvas.pos.height
              cb(curves)
              draw([1/2, 1/4, 4])
            })
          })
          parEl.appendChild(dot)
        })(e, i)
      })
    
    
    }, 10)
  }

  return parEl

  function parent(el){
    var node = el || document.createElement('div')
    var $ = node.style
//    $.width = 400 + 'px'
//    $.height = 244 + 'px'
    $.border = '3px solid black'
    $.display = 'inline-flex'
    $.alignItems =  'center'
    $.justifyContent = 'center'
    $.boxSizing = 'border-box'
    $.position = 'relative'
    return node
  }

  function canv(){
    var node = document.createElement('canvas')
    var $ = node.style
    node.width = parseFloat(window.getComputedStyle(parEl).width)
    $.width  = node.width + 'px'
    node.height = parseFloat(window.getComputedStyle(parEl).height)
    $.height = node.height + 'px'
    //$.border = '3px solid black'
    $.boxSizing = 'border-box'
    $.backgroundImage = 'linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)';
    
    $.backgroundSize='20px 20px'
    $.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px' 

    return node

  }

  function handle(vec, pos, i){

    var c = colors//['red', 'green', 'yellow', 'blue']
    var node = document.createElement('div')
    var $ = node.style
    var r = 15
    node.classList.add('handle')
    $.height = $.width = r+'px'
    $.position = 'absolute'
    $.border = '3px solid black'
    $.background = c[i % c.length] 
    $.borderRadius = '50% 50%'
    $.zIndex = '100'
    var pas = findPos(parEl)
    $.left = vec[0] * parseInt(canvas.width) - r + 'px'
    $.top = (1 - vec[1]) * parseInt(canvas.height) - r +  'px'
    return node

  }

}


