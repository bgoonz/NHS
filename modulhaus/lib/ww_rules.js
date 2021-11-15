onMessage = function(){
  module.exports.apply(module.exports, arguments)
}

module.exports = rules

function rules(prev, next){
  for(i=0;i<prev.shape[0];i++)
  {
    for(j=0;j<prev.shape[1];j++)
      {
        var count = 0;
        for(ci=-1;ci<=1;ci++)
        {
          for(cj=-1;cj<=1;cj++)
          {      
            count += prev.get(i+ci,j+cj) || 0
          }
        }             
        count-=prev.get(i,j) || 0
        if(count >= 255) count =  Math.floor(Math.random() * 11 / 2)
        next.set(i,j, count);
     }
  }
}


