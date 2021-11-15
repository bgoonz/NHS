var sql = require('better-sqlite3')
var db = sql('../batch.db')

db.prepare('drop table if exists lorenz').run()
db.prepare('create table lorenz(date string, symbol string, wealth number, rank number, percentile number, delta number, diff number, streak number)').run()
//var insert = db.prepare('insert into lorenz values (@date, @symbol, @volume, @close, @wealth, @rank, @percentile)')
//console.log(db.pragma('table_info(lorenz)'))
//process.exit()
var st = e => {
  var s =  `insert into lorenz (date, symbol, wealth, rank, percentile, delta, diff, streak) values `
  e.forEach(e => s+= `('${e.date}', '${e.symbol}', ${e.wealth}, ${e.rank}, ${e.percentile}, ${e.delta}, ${e.diff}, ${e.streak}),`)
  s = s.slice(0, s.lastIndexOf(','))
  return s
}

var eras = db.prepare('select distinct(date) from ticker').all()
//var stonk = db.prepare('select close * volume as wealth, close, volume, symbol from ticker order by date desc limit 2200 offset ?').all(0)
console.log(eras)
var prev 
eras.slice(0, 2).map((e, i) => {
  var date = e.date
  var index = i
  var stonk = db.prepare('select close * volume as wealth, close, volume, symbol, date from ticker where date=? order by (close * volume)').all(e.date)
  console.log(e, stonk)
  var sum = stonk.reduce((a, e) => a + Number(e.close), 0)
  var vsum = stonk.reduce((a, e) => a + Number(e.volume), 0)
  var wsum = stonk.reduce((a, e) => a + Number(e.wealth), 0)
  stonk = stonk.sort((a, b) => Number(a.wealth) < Number(b.wealth) ? -1 : 1)
  var totes = 0
  stonk = stonk.map(e => {
    e.pc = e.wealth + totes
    totes = e.pc
    e.date = date
    if(index==0){
      e.delta = 0
      e.diff = 0
      e.streak = 0
    }
    return e
  })
  process.exit()
  var p = 0
  var n = stonk.length
  console.log(stonk.slice(0,2))

  stonk = stonk.map((e, i) => {
    var f = i/n
    var si = 1/n*e.pc
    var sn = 1/n*wsum 
    var l = si/sn
    e.percentile = l
    e.rank = n-i
    if(index > 0) {
      console.log(prev.slice(0,2))
      console.log(e.symbol) 
      var pre = prev.filter(ex => ex.symbol == e.symbol)[0]
      e.delta = pre.rank - e.rank
      e.diff = e.percentile - pre.percentile
      if(e.delta > 0 || e.delta == 0 && pre.streak > 0) e.streak = Math.max(0, pre.streak) + 1//e.delta
      else if(e.delta < 0) e.streak = Math.min(0, pre.streak) -1// e.delta
      else e.streak = 0
      //else e.streak--
      //e.delta >= 0 ? e.streak = e.streak+=1 : e.streak-=1
    }
    else{
    }

    //console.log(e)
    return e
  })

  prev = stonk
  //insert.run(stonk

  console.log(i)
  db.exec(st(stonk))

  //console.log(stonk.reverse(), sum, vsum, wsum)
  //stonk.forEach((e,i) => {e.i = i / n; console.log(e)})

})
/*
sum = stonk.reduce((a, e) => a + Number(e.close), 0)
vsum = stonk.reduce((a, e) => a + Number(e.volume), 0)
wsum = stonk.reduce((a, e) => a + Number(e.wealth), 0)
stonk = stonk.sort((a, b) => Number(a.wealth) < Number(b.wealth) ? -1 : 1)
var totes = 0
stonk = stonk.map(e => {
  e.pc = e.wealth + totes
  totes = e.pc
  return e
})


p = 0
n = stonk.length
//stonk = stonk.map(e => {p = e.percentile = p + e.wealth / wsum; return e})

stonk = stonk.map((e, i) => {
  var f = i/n
  var si = 1/n*e.pc
  var sn = 1/n*wsum 
  var l = si/sn
  e.percentile = l
  //p = e.percentile = p + e.wealth / wsum; return e
  return e
})

//console.log(stonk.reverse(), sum, vsum, wsum)
stonk.forEach((e,i) => {e.i = i / n; console.log(e)})

*/
