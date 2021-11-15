const tc = require('./timecraft.js')
const bodies = [[1,0], [2,0], [3,0], [4,0], [5,0], [6,0], [7,0], [8,0], [9,0], [10,0], [199, 1], [299, 2], [301, 3], [399, 3]]
module.exports = function(date){
  if(date instanceof String) date = setTime(date)
  return bodies.map(e => tc.spkezr(e[0], tc.date2et(date), e[1]))
}

d = new Date
console.log(tc.spkezr('SATURN BARYCENTER', tc.date2et(d), '0'))
console.log(tc.spkezr('399', tc.date2et(d), '0'))

let r= tc.spkezr('MOON', tc.date2et(setTime('1981-1-12')), '3')
let s= tc.spkezr('6', tc.date2et(setTime('1981-1-12')), '0')
console.log(s)

function setTime(date){
  let d = new Date
  date = date.split('-')
  d.setUTCFullYear(date[0])
  d.setUTCMonth(parseInt(date[1])-1)
  d.setUTCDate(date[2])
  d.setUTCHours(0)
  d.setUTCMinutes(0)
  d.setUTCSeconds(0)
  d.setUTCMilliseconds(0)
  return d//.toUTCString().slice(0, -3)
}
