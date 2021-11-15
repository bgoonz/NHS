var body = document.body
var websocket = require('websocket-stream')
var stream = websocket('ws://'+window.location.hostname + ':' + window.location.port + window.location.pathname+'?type=share,ticktock&interval=400')
var decode = require('./lib/decode')
var ui = require('getids')(document.body)
var fs = require('fullscreen');
var touchdown = require('touchdown');
var Time = require('since-when')
var ndarray = require('ndarray')
var fakefix = require('fakefix')
var rules = require('./lib/rules.js')
require('./lib/reqFrame')()
var getCSS = require('./lib/getCSS')
var drawGrid = require('./lib/grid.js')
var squarejob = require('./lib/squarejob');
var pice = require('./lib/pices.js');
var rgba = require('./lib/rgba.js')
var energyProses = require('./lib/energyzer.js')
var rectSect = require('./lib/rectIntersect')
var w,h,draw,drawS,lifeSize,zom,data,data2,action;
var pices = new Array();
var tasks = new Array();
var energyMesseg = new Array();
var tempTasks
var playerTeam = 0;
var tern = 0
time = Time()
var safty
var temparray = new Array();
var ttemparray = new Array()
var nu = 0

function command(type,point){
  var ex = point.detail.x + window.scrollX
  var ey = point.detail.y + window.scrollY
   ex -= ex % lifeSize
   ey -= ey % lifeSize
   ex /= lifeSize
   ey /= lifeSize              ////find the offset mous location for refferens

  var task = {
        "metadata" : { 
          type: type,
          ex:ex,
          ey:ey,
          team:playerTeam,
          timestamp:new Date().getTime(),
          length:stemp.shape[0],	 
        },
        data: stemp.data, 
      }

  stream.write(JSON.stringify(task))
  task.data = stemp
  tasks.push(task)
}

stream.on('data', function(data){
  data = decode(data)

  if(data.metadata.type === "ticktock"){
    if(playflag){
      executer(data.metadata.timestamp)
      run()
    }
  }
  else if(data.metadata.type === "play"){
    playflag = true
    timeStamp = data.metadata.timestamp
  }
  else if(data.data){
    data.data  = ndarray(data.data,[data.metadata.length,data.metadata.length])
    data.timing = 0
    tasks.push(data)
  }
})


function executer(line){

  var safty = 200
  var time = line - safty 

  temparray = tasks.filter(function(e){
    return e.metadata.timestamp >= time
  })
  tasks = tasks.filter(function(e){
    return e.metadata.timestamp < time
  }).sort(function(e,i){
    var a = 0, b = 0;
    if((a = e.metadata.timestamp) <= (b = i.metadata.timestamp)){
      if(a == b) return 0
      else return -1
    }
    else return 1
  }).reduce(function(p,e,i,d){
    var x = [e];
    if(i > 0){
      var q = p[p.length - 1];
      if(q[0].metadata.timestamp == e.metadata.timestamp){
        // put all same-timestamps in same array
        q.push(e)
      }
      else p.push(x)
    }
    else p.push(x)
    return p
  },[]).map(function(e, i, a){
    if(e.length == 1) return e
    else{
      var box = Object.create(null)
      box['BStemp'] = []
      box['build'] = []
      e.forEach(function(e){
        if(e.metadata.type == 'BStemp') box[e.metadata.type].push(e)
        else box['build'].push(e)
      })
      return box
    }
  }).reduce(function(_tasks,e,i,d){
    if(Array.isArray(e)) _tasks.push(e[0])
    else{ // should be an object
      // iterate over the keys in e
      Object.keys(e).forEach(function(type){
        switch(type){
          case 'BStemp':
          // e[type] is an array of same-time stamps
          // check if they are intersecting first
          // if they are, check for contentious points
          // of which be there any, all conflicting stamps are disregarded
            e[type] = e[type].reduce(function(p,e,i,d){
              var x, y;
              var p1 = [x = e.metadata.ex, y = e.metadata.ey];
              var p2 = [x + e.data.shape[0], y + e.data.shape[1]];
              var intersects = false
              var conflict = false
              for(x = 0; x < d.length; x++){
                var p3 = [d[x].metadata.ex, d[x].metadata.ey]
                var p4 = [p3[0] + d[x].data.shape[0], p3[1] + p[3].data.shape[1]]
                if(rectSect(p1, p2, p4, p4)){
                  // we have an intersection
                  // the next step would be to see if they contend for individual coordinates
                  // and if not, let them through
                  // ie. calculate rectangle intersection, and compare each coordinate
                  // but for now we will throw out all intersecting, same time stamos
                  intersects = true
                }
                else continue
              }
              if(!intersects) _tasks.push(e) 
            },[])
          break;
          case  'build':
          _tasks.push(e)
          //e[type] is an array of same-time buildings
          break;
        }
      })
    }
    return _tasks
  },[])
//  console.log(tasks.slice(), temparray.slice())

  for(work = 0 ; work < tasks.length;work++){ 
    switch(tasks[work].metadata.type){

      case "BStemp": springStemp(tasks[work].metadata.ex,tasks[work].metadata.ey,tasks[work].metadata.team,tasks[work].data)
        break;
      case "BBase": builder(tasks[work].metadata.ex,tasks[work].metadata.ey,"base",tasks[work].metadata.team)
        break;
      case "BStation": builder(tasks[work].metadata.ex,tasks[work].metadata.ey,"station",tasks[work].metadata.team)
        break;
      case "BTurent": builder(tasks[work].metadata.ex,tasks[work].metadata.ey,"turent",tasks[work].metadata.team)
        break;
      case "BFort": builder(tasks[work].metadata.ex,tasks[work].metadata.ey,"fort",tasks[work].metadata.team)
        break;
    }
  }
  
  tasks = temparray
  temparray=new Array();
}


init()
  pices.push(new pice.set("base",20,10,10))

  pices.push(new pice.set("base",30,20,20))
  pices.push(new pice.set("base",25,15,0))
  pices.push(new pice.set("base",100,50,20))

function init(){
  w = 2000 //window.innerWidth * 2
  h = 2000 //window.innerHeight * 2
  draw = ui.board.getContext('2d')
  drawS = ui.stemps.getContext('2d')
  lifeSize = 45 
  draw.strokeStyle = rgba(255,255,255,1) 
  stempSize = 40
  zoom = 1;
  ui.board.style.width = w + 'px'
  ui.board.style.height =h + 'px'
  ui.board.width = w
  ui.board.height = h
  ui.stemps.width = 200
  ui.stemps.height = 200
  fakefix(ui.stemps)
  fakefix(ui.controls)
  drawGrid(draw, w, h, lifeSize)
  drawGrid(drawS, 200, 200, stempSize)
}
function run(evt){
  rules(prev, next)
  squarejob(next, draw, lifeSize)
  tern ++
  for(i=0;i<pices.length;i++){
     pices[i].capture(next)
     pices[i].mark(playerTeam,lifeSize,draw)

     if(pices[i].type === "base" && pices[i].player === playerTeam){
  nu++
  energyMesseg.push("base number" , nu , "posess " , pices[i].energy, "energy ")
     }
     if(tern === 3 && pices[i].type === "base") pices[i].energy ++

  }
  if(tern === 3) tern = 0;
  for(var i = 0; i < next.shape[0]; i++){
    for(var j = 0; j < next.shape[1]; j++){
      var n = next.get(i, j)
      prev.set(i,j,n);
    }
  }
  nu = 0
  ui.energy.value = energyMesseg.join(" ")
  energyMesseg = new Array()
}


var ePoint 
ui.stemps.addEventListener('touchdown',drawStemp)
ui.board.addEventListener('touchdown', function (e){
  ePoint = e
  command(action,ePoint)
})
var timeStamp
ui.stop.addEventListener('touchdown', function(){
//  window.cancelAnimationFrame(anim)
})

ui.play.addEventListener('touchdown', function(){
  timeStamp = new Date().getTime
  stream.write(JSON.stringify({"metadata":{type:"play",	timestamp:new Date().getTime()}}))
  play()
})

//ui.step.addEventListener('click', run)


module.exports = {
  play: play,
  stop: stop,
  step: step,
}



ui.p1.addEventListener('touchdown',function(){
  playerTeam = 10
})

ui.p2.addEventListener('touchdown',function(){
  playerTeam = 20
})

/*
ui.p3.addEventListener('touchdown',function(){
playerTeam = 30
})
*/

ui.BStemp.addEventListener('touchdown',function(){
  action = "BStemp"
})

/*
ui.BBace.addEventListener('touchdown',function(){
action = "BBase"
})
*/

ui.BStatian.addEventListener('touchdown',function(){
  action = "BStation"
})



ui.BTurent.addEventListener('touchdown',function(){
  action = "BTurent"
})


/*
ui.BFort.addEventListener('touchdown',function(){
action = "BFort"
})

*/







data = new Uint8ClampedArray(Math.ceil(w / lifeSize) * Math.ceil(h / lifeSize))
data2 = new Uint8ClampedArray(Math.ceil(w / lifeSize) * Math.ceil(h / lifeSize))
data3 = new Uint8ClampedArray(Math.ceil(200 / stempSize) * Math.ceil(200 / stempSize))


for(var x = 0; x < data.length; x++){
  data[x] = 100;
  data2[x] = 100;
}
for(x = 0; x<data3.length; x++) data3[x] =100;

var prev = ndarray(data, [Math.ceil(w / lifeSize), Math.ceil(h / lifeSize)]);
var next = ndarray(data2, [Math.ceil(w / lifeSize), Math.ceil(h / lifeSize)]);
var stemp = ndarray(data3, [Math.ceil(200 / 40), Math.ceil(200 / 40)]);
///var stempS = ndarray(data3, [Math.ceil(123 / 40), Math.ceil(267 / 40)]);


  var pixel = draw.getImageData(0,0,100,100)

  var anim = 0;
  touchdown.start(ui.board);
  touchdown.start(ui.step)
  touchdown.start(ui.play)
  touchdown.start(ui.stop)
  touchdown.start(ui.p1)
  touchdown.start(ui.p2)
  touchdown.start(ui.stemps)
 // touchdown.start(ui.stempNum)
  //touchdown.start(ui.stempSave)
  touchdown.start(ui.BStemp)
 // touchdown.start(ui.BBace)
//  touchdown.start(ui.p3)
 touchdown.start(ui.BStatian)
// touchdown.start(ui.BFort)
 touchdown.start(ui.BTurent)







  function draw(t){

    window.requestAnimationFrame(draw)

  }

  function drawS(t){

    window.requestAnimationFrame(draw)

  }

function stop(){
  window.cancelAnimationFrame(anim)
}
var playflag = false
var last = 0
function play(t){

//    run()
    playflag=true
 //   anim = window.requestAnimationFrame(play)
 // }
 // else
//  anim = window.requestAnimationFrame(play)
  //run()
}
function builder(ex,ey,type,team){
  var energyPross
  if(pice.ICanBuild(ex,ey,team,pices)){
    energyPross = energyProses(pices,team,ex,ey,5,"build")
    if(energyPross[0]){
      pices = energyPross[1];
      pices.push(new pice.set(type,ex,ey,team,pices))
    }
    else
      console.log("you do not have enugh energy");
  }
}



function springStemp(ex,ey,team,Tstemp){
  var precheak = new Array();
  var energy
  var tempPices = pices.slice(0)
  var obs = 0;
  var n = 0;
  var zbord , zstemp, x, y;


  for(i = 0 ; i < Tstemp.shape[0] ; i++){      //// run therow all stemp 2d array
    for(j = 0 ; j < Tstemp.shape[1] ; j++){
      zstemp = Tstemp.get( i,  j)
      if(zstemp === 0) {           /// if ther is a cell in the stemp 
        x = ex + i
        y = ey + j
        zbord = prev.get(x,y)
        if(zbord === 100){
          energy =  energyProses(pices,team,x,y,1,"spun")
          if(energy[0]) {
            tempPices = energy[1]
          }
          else obs = 100;
          }
      else obs ++
    }
    precheak[n] = zstemp
    n++
    }
  }
  if(obs === 0){
    n = 0
    for(i = 0 ; i < Tstemp.shape[0] ; i++){
      for(j = 0 ; j < Tstemp.shape[1] ; j++){
        if(precheak[n] != 100){
          x = ex + i
          y = ey + j
          prev.set(x, y, team )
          next.set(x, y, team )  //////// dump the info from stemps  

        }
         n++
      }
    }
    pices = tempPices
  }
  else if(obs<100)
    console.log("cant create", obs, "obsticles");
  else if(obs === 200)
    console.log("not enugh energy")
  else
    console.log("out of your inflouens fild");
}

function drawStemp(e){
  var x = e.detail.x + window.scrollX, y = e.detail.y + window.scrollY;
  x -= e.srcElement.offsetLeft
  y -= e.srcElement.offsetTop
  x -= x % stempSize
  y -= y % stempSize
  x /= stempSize
  y /= stempSize
  var z = stemp.get(x,y)
  if(z === 100) z = 0
  else z = 100
  stemp.set(x,y,z)
  squarejob(stemp,drawS,stempSize)
}

/*
var screen = fs(document.body);
screen.on('attain', function(){})
screen.on('error', function(e){console.log(e)})

document.body.addEventListener('click', function(){
//  screen.request()
})
*/
