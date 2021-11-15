var moment = require('moment')

module.exports.moment = moment
module.exports.sort = linearSort
module.exports.today = today
module.exports.tomorrow = tomorrow
module.exports.thisWeek = thisWeek
module.exports.nextWeek = nextWeek
module.exports.thisMonth = thisMonth
module.exports.withinWeek = withinWeek
module.exports.withinMonth = withinMonth
module.exports.nextMonth = nextMonth
module.exports.range = range

function range(events, key, fmt, begin, end){
  var begin = moment(begin).subtract('seconds', 1)
  var end = moment(end).add('seconds', 1)
  return linearSort(events.reduce(function(p,e){
    var _a = moment(e[key])
    if(_a.isAfter(begin) && _a.isBefore(end)) p.push(e)
    return p
  },[]), key, fmt)
}

function thisMonth(events, key, fmt, _month){
  
  var begin = moment().month(_month || moment().month()).startOf('month')
  var end = moment().month(_month || moment().month()).endOf('month')
  return range(events, key, fmt, begin, end)
}

function nextMonth(events, key, fmt){
  var begin = moment().add('months', 1).startOf('month')
  var end = moment().add('months', 1).endOf('month')
  return range(events, key, fmt, begin, end)
} 

function withinMonth(events, key, fmt){
  var nextMonth = moment().add('months', 1).hours(0).minutes(0).seconds(0)
  var begin = moment().startOf('month')
  return range(events, key, fmt, begin, nextMonth)
}

function thisWeek(events, key, fmt, _week){
  var begin = moment().startOf('week')
  var end = moment().endOf('week')
  return range(events, key, fmt, begin, end)
}

function nextWeek(events, key, fmt){
  var begin = moment().add('weeks', 1).startOf('week')
  var end = moment().add('weeks', 1).endOf('week')
  return range(events, key, fmt, begin, end)
}

function withinWeek(events, key, fmt){

  var end = moment().add('weeks', 1).hours(0).minutes(0).second(0)
  var begin = moment().startOf('day')
  return range(events, key, fmt, begin, end)
}


function today(events, key, fmt){

  var end = moment().add('days', 1).hours(0).minutes(0).seconds(0)
  var begin = moment().startOf('day')
  return range(events, key, fmt, begin, end)
  return linearSort(events.reduce(function(p,e,i,d){
    var _a = moment(e[key], fmt)
    if(_a.isBefore(tomorrow)) p.push(e)
    return p
  }, []), key, fmt)
    

}

function tomorrow(events, key, fmt){
  var start = moment().add('days', 1).hours(0).minutes(0).seconds(0)
  var end = moment().add('days', 1).hours(23).minutes(59).seconds(59)
  return range(events, key, fmt, start, end)
}

function linearSort(events, key, fmt){

  return events.sort(function(a,b){
    var _a = moment(a[key], fmt)
    var _b = moment(b[key], fmt)
    if(_a.isBefore(_b)) return -1
    if(_a.isAfter(_b)) return 1
    else return 0
  })

}
