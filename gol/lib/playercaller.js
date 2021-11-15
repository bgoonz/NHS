var rgba = require('./rgba.js')
var a,b,c,x,y,z;

module.exports = swich

function swich (player,shade){ 

  switch(player){
    case 0:
      return x || (x = rgba(255,255,255,shade)) 
    break;
    
    case 10:
      return y || (y = rgba(255,0,0,shade)) 
    break;
    
    case 20:     
      return z || (z = rgba(0,0,255,shade)) 
    break;
        
    case 30:     
      return a || (a = rgba(40,150,150,shade)) 
    break;

    case 40:
      return b || (b = rgba(200,40,100,shade)) 
    break;

    default:
      return c || (c = rgba(0,0,0,shade)) 

  }

}
