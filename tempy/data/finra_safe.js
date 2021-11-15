var levelup = require('level');
var Schedule = require('level-schedule');
let day = require('dayjs')
let agent = require('superagent')
let fs = require('fs')
let mkdirp = require('mkdirp')
let bot = require('./bot.js')

let baseURI = 'https://api.finra.org/'
let astURI = 'data/group/OTCMarket/name/weeklySummary'
let shortURI = 'data/group/OTCMarket/name/regShoDaily'
var db = levelup('./db');
var last = '2021-02-16' ////////
var begin = '2021-03-25' ////////

let test = new RegExp(' US')
let latest = fs.readFileSync('./latest.csv', 'utf8').split('\n').slice(1).map(e => {
  if(test.test(e)){
    return e.slice(0, test.exec(e).index)
  }
}).filter(Boolean)

let pd = sym => `{"quoteValues":false,"delimiter":"|","offset":0,"limit":5000,"compareFilters":[{"fieldName":"issueSymbolIdentifier","fieldValue":"${sym}","compareType":"EQUAL"},{"fieldName":"tierIdentifier","fieldValue":"T1","compareType":"EQUAL"}], fields:['weekStartDate', 'totalWeeklyShareQuantity', 'marketParticipantName'], "dateRangeFilters":[{"endDate":"${begin}", "startDate":"${last}", "fieldName":"weekStartDate"}]}` 

let sd = sym => `{"quoteValues":false,"delimiter":"|","limit":5000,"compareFilters":[{"fieldName":"securitiesInformationProcessorSymbolIdentifier","fieldValue":"${sym}","compareType":"EQUAL"}], fields:['shortParQuantity', 'reportingFacilityCode', 'tradeReportDate'],"dateRangeFilters":[{"endDate":"${begin}", "startDate":"${last}", "fieldName":"tradeReportDate"}]}` 

let schedule = Schedule(db)
  
schedule.job('AST', function (d, fin) {
    query(astURI, pd(d.ticker), (err, res)=>{
      if(err) fin(err)
      if(res.text){
        fs.writeFile(`./data/${d.ticker}/ast.csv`, res.text, 'utf8', fin)
        console.log(`wiriting file: /data/${d.ticker}/ast.csv`)
      }
    })
})

schedule.job('SHO', function (d, fin) {
    query(shortURI, sd(d.ticker), (err, res)=>{
      if(err) fin(err)
      if(res.text){
        //
        fs.writeFile(`./data/${d.ticker}/short.csv`, res.text, 'utf8', fin)
        console.log(`wiriting file: /data/${d.ticker}/short.csv`)
      }
    })
})

schedule.job('BOT', function (d, fin) {
        console.log(d.ticker)
    bot({i: d.ticker, v:'day', s:'year'}, (err, res)=>{
      if(err) fin(err)
      if(res){
        //
        fs.writeFile(`./data/${d.ticker}/ticker.json`, JSON.stringify(res), 'utf8', fin)
        console.log(`wiriting file: /data/${d.ticker}/ticker.json`)
      }
    })
})


//.run('print', { some : 'json' }, 1000)
if(process.argv[2] === 'run'){
  latest.forEach(ticker => {
      ticker = ticker.replace('/', '.')
      //let date = day(begin).subtract(xx * 7, 'days').format('YYYY-MM-DD')
      //mkdirp(`./data/${ticker.toUpperCase()}`)
      //mkdirp(`./data/${ticker.toUpperCase()}`)
      //console.log(date)
      try{
        fs.statSync(`./data/${ticker}/ast.csv`)
        schedule.run('AST', {ticker}, 2000*Math.random())
      }catch(er){
        mkdirp(`./data/${ticker.toUpperCase()}`)
        schedule.run('AST', {ticker}, 2000*Math.random())
      }
      try{
        fs.statSync(`./data/${ticker}/short.csv`)
        schedule.run('SHO', {ticker}, 2000*Math.random())
      }catch(er){
        mkdirp(`./data/${ticker.toUpperCase()}`)
        schedule.run('SHO', {ticker}, 2000*Math.random())
      }
      
  })
}
//else schedule._start()

if(process.argv[2] === 'bot'){
  latest.forEach(ticker => {
      ticker = ticker.replace('/', '.')
      //let date = day(begin).subtract(xx * 7, 'days').format('YYYY-MM-DD')
      //mkdirp(`./data/${ticker.toUpperCase()}`)
      //console.log(date)
      try{
        fs.statSync(`./data/${ticker}/ticker.json`)
        schedule.run('BOT', {ticker}, 1000*Math.random())
      }catch(er){
        mkdirp(`./data/${ticker.toUpperCase()}`)
        schedule.run('BOT', {ticker}, 1000*Math.random())
      }
      
  })
}
//console.log(latest)
//setTimeout(function(){process.exit()}, 100)

//let pd = {"quoteValues":false,"delimiter":"|","limit":5000,"sortFields":["-totalWeeklyShareQuantity"],"compareFilters":[{"fieldName":"summaryTypeCode","fieldValue":"ATS_W_SMBL_FIRM","compareType":"EQUAL"},{"fieldName":"issueSymbolIdentifier","fieldValue":"AAPL","compareType":"EQUAL"},{"fieldName":"issueName","fieldValue":"Apple Inc. Common Stock","compareType":"EQUAL"},{"fieldName":"weekStartDate","fieldValue":"2020-01-27","compareType":"EQUAL"},{"fieldName":"tierIdentifier","fieldValue":"T1","compareType":"EQUAL"}]}


function query(path, postData, cb){
  agent.post(baseURI + path)
  .set('Accept-encoding', 'text/plain')
  .set('Content-type', 'application/json') 
  .set('Connection', 'keep-alive')
  .set('Accept-encoding', 'gzip, deflate, br')
  .set('Authorization', 'Basic ' + auth)
  .set('Content-length', new Buffer(postData).length)
  .send(postData)
  .end((err, res)=>{
    cb(err, res)
    //console.log(res.text, res.text.split('\n').length)
  })
}
