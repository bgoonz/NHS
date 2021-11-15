module.exports = rules

function rules(prev, next){
var count=0;
var team=0;
var temp = 0;
var stat = 0;
var FoF = 0; ///frind or fou
  for(i=0;i<prev.shape[0];i++)
  {
  for(j=0;j<prev.shape[1]-1;j++)
  {                                         /////////run thero the chart

  team = prev.get(i,j);
  team = team - (team % 10)                 ///////// get only team value
 
    
  if(team === 100)
    continue                                ///// dissregard emty cels
  else if(team < 100)
  {
    for(ci=-1;ci<=1;ci++)
    {
    for(cj=-1;cj<=1;cj++)
    {                                       //////// all naboring cels
      if( ci === 0 && cj ===0 )     ///// not self or undefind
        continue
      if((i===0 && ci<0) || (j===0 && cj <0))
        continue
      temp = next.get(i+ci , j+cj);
      stat = temp % 10;
      FoF = temp - stat - team;
                                     ///// chek if they are of the same team FoF===0

      if(temp === 101)
        continue                              //// 101 is for over pupulation
      else if(temp === 100)
        temp = team+4;                        ////  set emty nabors logical to 4 and team to the influencing team
      else if(stat === 0 || stat === 1 || stat === 2)
        temp++                                /// 0-3 is the count for live cells, it dos not matter the team
      else if(stat === 3 || stat === 7)
        temp = 101;                           /// more than 3 nabors is dead, 7 and 3 are the logical for 3 naibors
      else if(stat === 4 && FoF === 0)
        temp++                      /// empty cell that have 2 nabors of the same team is 5
      else if(stat === 4 && FoF != 0)
        temp = team + 6 ;                      /// emty cell with 2 diffrent nabors is now 6
      else if(stat === 5)
        temp = temp - 2 ;                      /// cells with 2 same team nabors get a 3 with its current team no matter the influens cell
      else if(stat === 6 && FoF === 0)
        temp = temp - 3;                               /// not knoing the nabors the cell is now 7 and will cheak his nabors in the futur 
      else if(stat === 6 && FoF!= 0)
          temp = team + 7;
      next.set(i+ci , j+cj , temp);           //// readitt next
    }
    }
  }
  }
  }

  var take = 100;

  var overt = 100;
  var flag = 0;
  for(i=0;i<prev.shape[0];i++)
  {
  for(j=0;j<prev.shape[1];j++)
  {                                           ///// runing the cells a second time
    temp = next.get(i , j); 
    stat = temp % 10;

    if(stat === 2 || stat === 3)
      next.set(i , j , temp-stat)  ///// if a cell was alive and have 2 naibors or if it have 3 naibors he keeps his currently saved team                 
    else if(stat === 7)
      {                            //// 3 unundentifide naghbors       
        flag = 0;
        take = 111;
        overt = 111;
        for(ci=-1;ci<=1;ci++)
         {
         for(cj=-1;cj<=1;cj++)
           {
             if((j === 0 && cj < 0) || (i === 0 && ci < 0) || (ci === 0 && cj === 0) || (flag === 1) )
               continue                              
                                                    ///// skip self undefind and flag(wen next hase been set allready)
             team = prev.get(i+ci , j+cj);
             if(team < 100)
             {
              if(take === 111)
               {                          ///// skip empty
                  take = team
                  }
                                      ////first rund, take is the first live naibor
              else if(take === team)
              {
                 next.set(i,j,take);              ///// if anuther naibor is same as take it is it and the flug is up
                 flag = 1;
              }
               
              else if(overt === 111 )
                 overt = team;                     ////// secon round over take, 
              else if(overt === team)
              {
                 next.set(i,j,overt);               ///// if a secund cell is same as over take it is it and the flag is up
                 flag = 1;
              }
              else                                 
              {
                 next.set(i,j,0);                 //// if the cell is alive, and diff from bouth take and over take the next is nutral
                  flag =1;                  ////  and the flag is up
              }
             }
           }
          }
      }
      else
        next.set(i,j,100);    ///// if the logical is not 2 ,3 or 7 the cell is dead
      
      

  }    
  }
}
