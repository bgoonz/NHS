var touchdown = require('touchdown')
var getid = require('../../getid')
var getCSS = require('./getCSS');
var offset = require('../../set-it-off');
var envelope = require('../n-velope');

var ui = getid(document.body)
var context = ui.context.getContext('2d');

var w = ui.context.width = window.innerWidth
var h = ui.context.height = window.innerHeight
offset.setParent(ui.context)




var center = [w/2, h/2]

var envelopes = []
var currentControlPoints = []


ui.firstControl.moveTo(0,0)//.style.top = offset.offset([0,0])[0]+'px';
ui.thirdControl.moveTo(100,0)//.style.top = offset.offset([100,0])[1] + 'px';
//ui.firstControl.style.left = offset.offset([0,0])[0]+'px';
//ui.thirdControl.style.left = offset.offset([100,0])[1]+'px';

touchdown.start(ui.context)
touchdown.start(ui.firstControl)
touchdown.start(ui.thirdControl)

ui.context.addEventListener('deltavector', function(evt){
    drawCurve(evt.detail.x, evt.detail.y)
})

ui.addEnvelope.addEventListener('click', function(e){
    envelopes.push(currentControlPoints)
})

ui.firstControl.addEventListener('touchdown', function(evt){
    var offsets = [evt.detail.e.offsetX, evt.detail.e.offsetY]
    console.log(offsets)
    this.addEventListener('deltavector', deltavector)
    this.addEventListener('liftoff', function(evt){
	this.removeEventListener('deltavector', deltavector)
    })
    function deltavector(evt){
	this.style.top = evt.detail.y - offsets[1] + 'px';
    }
})

ui.thirdControl.addEventListener('touchdown', function(evt){
    var offsets = [evt.detail.e.offsetX, evt.detail.e.offsetY]
    console.log(offsets)
    this.addEventListener('deltavector', deltavector)
    this.addEventListener('liftoff', function(evt){
	this.removeEventListener('deltavector', deltavector)
    })
    function deltavector(evt){
	var offsets = [evt.detail.e.offsetX, evt.detail.e.offsetY];
	var move = [100, e.detail.y - offsets[0]]
	console.log(offsets)
	this.moveTo(offsets)
//	console.log(this.cartesian)
//	this.style.top = evt.detail.y - offsets[1] + 'px';
    }
})


drawCurve(w/2, h/3+100)

function drawCurve(x,y){

    context.clearRect(0,0,w,h)
    context.strokeRect(w/2-50,h/3+50,100,100)
    
    var r = Math.round(Math.abs((w/2) - x))
    var g = Math.round(Math.abs(255 - distance([w/2,h/2],[x,y])))
    var b = Math.round(Math.abs((h/2) - y))
    context.fillStyle = 'rgba(100,66,100,255)'
    context.beginPath();
    context.lineWidth = 3
    context.moveTo(w/2-50, h/3 + 150)
    context.quadraticCurveTo(x,y,w/2 + 50,h/3+50)
    context.strokeStyle = ['rgba(',r,',',g,',',b,',',157,')'].join('')
    context.stroke()
    console.log(['rgba(',r,',',g,',',b,',',255,')'].join(''))
}

function distance(p1, p2){
        return Math.sqrt(
                Math.pow(p2[0] - p1[0], 2) +
                Math.pow(p2[1] - p1[1], 2)
        )
};
