module.exports = decode

function decode(str){
  var obj = JSON.parse(str);
if(obj.data){
   var l = Object.keys(obj.data).length;
   var arr = new Uint8Array(l);
   for(var x in obj.data){
     arr[x] = obj.data[x]
   }
  

  obj.data = arr
 }
  return obj
}
