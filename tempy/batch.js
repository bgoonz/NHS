const fs = require('fs')
const argv = require('minimist')(process.argv)
const sql = require('better-sqlite3')
const csv = require('fast-csv')
//const spear = require('spearman-rho')
//const atob = require('typedarray-to-buffer')

const db = new sql('aapl.db')
db.pragma('cache_size=24000');
//console.log(db.pragma('cache_size', { simple: true }));
const ticker_pragma = db.prepare('PRAGMA table_info(ticker)')
const short_pragma = db.prepare('PRAGMA table_info(short)')
const ast_pragma = db.prepare('PRAGMA table_info(ast)')

const tt = ticker_pragma.all()
const ts = short_pragma.all()
const ta = ast_pragma.all()

const short_sel = db.prepare('select * from short where date =?')
const ast_sel = db.prepare('select * from ast where date=?')
const ticker_sel = db.prepare('select * from ticker')
let categories = ['symbol']
let features = [].concat(db.prepare('select distinct(Market) from short').all()).concat(db.prepare('select distinct(marketParticipantName) from ast').all())
features = features.map(e => Object.values(e)[0].slice(0,5))
let kreals = ['date', 'phase']
let reals = tt.filter(e => e == 'date' || e == 'phase' ? false : true).concat(features)

ureals = reals.reduce((a,e)=>{
  a[e] = 0
  return a
}, {})

let header = Object.assign(kreals.concat(features).concat(categories).reduce((a, e)=> {
  a[e]=0//'-'// what pytorch forecaster wants according to docs..?
  return a
},{}), ureals)

let meta = {unknownReals:reals, knownReals: kreals, features:features, categories:categories}
fs.writeFileSync('./meta.json', JSON.stringify(meta), 'utf8')

//console.log(meta)
//console.log(header)
let batch = ticker_sel.all().map(e => Object.assign({...header}, e)).map(e => {
  let entry = ast_sel.all(e.date)
  if(entry && entry.length > 0){ 
    entry.forEach(n => {
      e[n['marketParticipantName'].slice(0, 5)] = n.totalWeeklyShareQuantity
      //e.aphase = n.aphase

    })  
  }
  return e
})

batch = batch.map(e => {
  let entry = short_sel.all(e.date)
  let mb = []
  if(entry && entry.length > 0) {
    entry.forEach(n => {
      e[n.reportingFacilityCode] = n['shortParQuantity']
    })
  }
  return e
})
//batch = batch.concat(astbatch)
batch = batch.map(e => {  
  delete e.Market
  delete e.marketParticipantName
  delete e['Trade Facility']
  delete e.MPID
  delete e['Short Volume']
  delete e['Total Volume']
  delete e.totalWeeklyShareQuantity
  delete e.totalWeeklyTradeCount
  for(n in e) if(e[n].length == 0) e[n] = 0
  //console.log(e)
  return e
  // need to go over features list and reverse one hot
  //console.log(entry)
})
batch = batch.sort((a,b) => a.date < b.date)
batch = batch.slice(1).map((e,i) => {
  e = {...e}
  console.log(e.date, batch[i].date, e.high, batch[i].high)
  e.high = e.high - batch[i].high
  e.low = e.low - batch[i].low
  e.open = e.open - batch[i].open
  e.close = e.close - batch[i].close
  return e
})
console.log(batch.map(e => e.high))

//batch.forEach(dashify)
let d = csv.format({headers: true})
d.pipe(fs.createWriteStream('./batchi-test.csv'))
batch.forEach( e => d.write(e))
d.end()
function nullify(x) { for(a in x) if (x[a] && x[a].length == 0) x[a] = null }
function dashify(x) { for(a in x) if (x[a] == null) x[a] = '-' }
function zero(x) { for(a in x) if (x[a] && x[a] == null) x[a] = 0 }
// select from short and ast, map to select from ticker same date
// query ast and shorts for string features, and add them to the header, then one hot them

//const features = tp.map(e => /feature/.test(e.name) ? e.name : false).filter(Boolean)
//const t_eras = db.prepare('select distinct(era) from train').all().map(e => e.era)//.sort()
//process.exit()
//var valids = db.prepare('select count(distinct(id)) from compete where data_type="validation"').get()['count(distinct(id))']
function getTrainBatchSeq(count, offset=0){

  var total = db.prepare('select count(distinct(id)) from train').get()
  total = total['count(distinct(id))']
  if(count) total=count
  var i = 0
  var iter = function(oof){
    if(oof) offset = oof
    if(offset + i * batch_size[0] >=total ) return {input: null, target: null, pad: null}
    var j = total - (i * batch_size[0] + offset), ii = 0, jj = batch_size[0], pad = 0
    if(j<batch_size[0]) { jj = j; pad = batch_size[0] - j}
    ii = i * batch_size[0]
    let batch = db.prepare(`select * from train limit ${jj} offset ${ii}`).all()
    //console.log(i, j, ii, batch.length)
    batch = batch.map((junk, i) => {
      let features = Object.keys(junk).map(k => /feature/.test(k) ? parseFloat(junk[k]) : NaN).filter(e => !isNaN(e))
      junk.features = features
      junk.target = Object.keys(junk).map(k => /target/.test(k) ? Number(junk[k]) : NaN).filter(e => !isNaN(e))
      return junk
    })
    i++
    remain = total - i * batch_size[0]
    var input = batch.map((e, era) => {
//      if(e.features.length < 310) console.log(e)
      return tf.tensor(e.features, [1, features.length], 'float32')
    })
    var id = batch.map(e => e.id)
    input  = tf.squeeze(tf.stack(input, 1))
    var target = tf.stack(batch.map(e => tf.tensor(e.target, [1])), 1)

    return {input, target, pad, id}
  }
  return {iter, total}
}
function getTrainEraBatchSeq(era, count, offset=0){

  var total = db.prepare(`select count(distinct(id)) from train where era="${era}"`).get()
  total = total['count(distinct(id))']
  if(count) total=count
  var i = 0
  var iter = function(oof){
    if(oof) offset = oof
    if(offset + i * batch_size[0] >=total ) return {input: null, target: null, pad: null}
    var j = total - (i * batch_size[0] + offset), ii = 0, jj = batch_size[0], pad = 0
    if(j<batch_size[0]) { jj = j; pad = batch_size[0] - j}
    ii = i * batch_size[0]
    let batch = db.prepare(`select * from train where era="${era}" limit ${jj} offset ${ii}`).all()
    //console.log(i, j, ii, batch.length)
    batch = batch.map((junk, i) => {
      let features = Object.keys(junk).map(k => /feature/.test(k) ? parseFloat(junk[k]) : NaN).filter(e => !isNaN(e))
      junk.features = features
      junk.target = Object.keys(junk).map(k => /target/.test(k) ? Number(junk[k]) : NaN).filter(e => !isNaN(e))
      return junk
    })
    i++
    remain = total - i * batch_size[0]
    var input = batch.map((e, era) => {
//      if(e.features.length < 310) console.log(e)
      return tf.tensor(e.features, [1, features.length], 'float32')
    })
    var id = batch.map(e => e.id)
    input  = tf.squeeze(tf.stack(input, 1))
    var target = tf.stack(batch.map(e => tf.tensor(e.target, [1])), 1)

    return {input, target, pad, id}
  }
  return {iter, total}
}

function getChallengeBatch(count, offset=0){

  var total = db.prepare('select count(distinct(id)) from compete').get()
  total = total['count(distinct(id))']
  if(count) total=count

  var i = 0
  var gcb = function(){
    if(offset + i * batch_size[0] >=total ) return {input: null, target: null, pad: null}
    var j = total - (i * batch_size[0] + offset), ii = 0, jj = batch_size[0], pad = 0
    if(j<batch_size[0]) { jj = j; pad = batch_size[0] - j}
    ii = i * batch_size[0]
    let batch = db.prepare(`select * from compete limit ${jj} offset ${ii}`).all()
    //console.log(i, j, ii, batch.length)
    batch = batch.map((junk, i) => {
      let features = Object.keys(junk).map(k => /feature/.test(k) ? parseFloat(junk[k]) : NaN).filter(e => !isNaN(e))
      junk.features = features
      junk.target = Object.keys(junk).map(k => /target/.test(k) ? Number(junk[k]) : NaN).filter(e => !isNaN(e))
      return junk
    })
    i++
    remain = total - i * batch_size[0]
    var input = batch.map((e, era) => {
//      if(e.features.length < 310) console.log(e)
      return tf.tensor(e.features, [1, features.length], 'float32')
    })
    var id = batch.map(e => e.id)
    input  = tf.squeeze(tf.stack(input, 1))
    var target = tf.stack(batch.map(e => tf.tensor(e.target, [1])), 1)

    return {input, target, pad, id}
  }
  return {gcb, total}
}

function getEraBatch(era='eraX', table='compete', offset=0, count=null){ // defaults to live era

  var total = db.prepare(`select count(distinct(id)) from ${table} where era="${era}"`).get()
  total = total['count(distinct(id))']
  //if(count) total=count

  var i = 0
  var gcb = function(oof){
    var pad = null
    if(oof)
      offset = Math.floor(Math.random() * total - batch_size[0])
    //if(offset + i * batch_size[0] >=total ) return {input: null, target: null, pad: null}
    //var j = total - (batch_size[0] + offset), ii = 0, jj = batch_size[0], pad = 0
    //if(j<batch_size[0]) { jj = j; pad = batch_size[0] - j}
    //ii = batch_size[0]
    let batch = db.prepare(`select * from ${table} where era="${era}" limit ${batch_size[0]} offset ${offset}`).all()
    //console.log(i, j, ii, batch.length)
    batch = batch.map((junk, i) => {
      let features = Object.keys(junk).map(k => /feature/.test(k) ? parseFloat(junk[k]) : NaN).filter(e => !isNaN(e))
      junk.features = features
      junk.target = Object.keys(junk).map(k => /target/.test(k) ? Number(junk[k]) : NaN).filter(e => !isNaN(e))
      return junk
    })
    //i++
    //remain = total - i * batch_size[0]
    var input = batch.map((e, era) => {
//      if(e.features.length < 310) console.log(e)
      /*
      let rank = e.features.reduce((a,e) => {a[e*100] += 1; return a}, new Array(101).fill(0))
      let sorted = e.features.sort((a,b) => a < b ? 1 : -1).map(e => {
            if(e==1) return 1
            if(e==0.75) return rank[100] + 1
            if(e==0.5) return rank[75] + rank[100] + 1
            if(e==0.25) return rank[50] + rank[75] + rank[100] + 1
            if(e==0) return rank[25] + rank[50] + rank[75] + rank[100] + 1
      })
//      sorted.forEach(e => {if(isNaN(e)) console.log(era)})//(sorted)
        return tf.tensor(sorted, [1, features.length], 'float32')
    */
      return tf.tensor(e.features, [1, features.length], 'float32')
    })
    var id = batch.map(e => e.id)
    input  = tf.squeeze(tf.stack(input, 1))
    var target = tf.stack(batch.map(e => tf.tensor(e.target, [1])), 1)
    //console.log(era, offset, total, input)

    return {input, target, pad, id}
  }
  return {gcb, total}
}
