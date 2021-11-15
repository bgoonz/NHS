//var argv = require('minimist')(process.argv.slice(2))
var spawnBot = require('../../projects/exbot/bot')
var bot = spawnBot(require('../../projects/robinhood/instructions.js'))
var fs = require('fs')
var config = require('../../projects/robinhood/config.json')

//console.log('\n*********\n' + bot.host + '\n*********\n')
module.exports = function(argv, cb){
  argv.t = config.token

  bot.do.gett(argv, function(err, data){
    //fs.writeFileSync('./data/' + argv.i + '.json', JSON.stringify(data))
    //console.log(err, data)
    if(err) console.error(err)
    if(cb) cb(err, data)
    else process.stdout.write(JSON.stringify(data))
    //process.exit()
  })

}


  //bot.node.connect(argv.h, (err, peer)=>{
    // build up full series across timelines
    // week/5yr, day/year, hour/3month, 10minute/week, 30min/week, 10minute/day
    //bot.do.gett(argv, console.log)
  //})
