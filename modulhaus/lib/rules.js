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
            count += Math.floor(prev.get(i+ci,j+cj) / 6) || 0
          }
        }             
        //count-=prev.get(i,j) || 0
        //if(count >= 255) count =  0// Math.floor(Math.random() * 11 / 2)
        count = count%255
        next.set(i,j, count);
     }
  }
}


