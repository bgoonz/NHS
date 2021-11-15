module.exports = rgba
function rgba(){
  return 'rgba('+Array.prototype.join.call(arguments, ',')+')'
}


