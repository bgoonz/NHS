module.exports = function(draw, w, h, lifeSize){
  draw.clearRect(0,0,w,h);    
  draw.fillStyle = rgba(0,0,0,1) 
  draw.fillRect(0,0,w,h)
  draw.strokeStyle = '#fff';
  for(var x = 0; x < w; x+=lifeSize * zoom){
    draw.moveTo(x, 0)
    draw.lineTo(x, h)
  } 

  for(var y = 0; y < h; y+= lifeSize * zoom){
    draw.moveTo(0, y)
    draw.lineTo(w, y)
  } 
  draw.stroke()

  function rgba(){
    return 'rgba('+Array.prototype.join.call(arguments, ',')+')'
  }
}
