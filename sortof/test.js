var cal = require('./sortByDate')
var events = require('./events.json').events
var fmt = 'YYYY-MM-DD HH:mm:ss';
var key = 'starts_at';

var test = require('tape')

var today = cal.moment().format(fmt).toString(fmt) // today should be this week
var tomorrow = cal.moment().add('days', 1).format(fmt).toString(fmt)
var yore = cal.moment().subtract('year', 2).format(fmt).toString()
var nextWeek = cal.moment().add('weeks', 1).format(fmt).toString()
var nextMonth = cal.moment().add('months', 1).format(fmt).toString()

var lastYearsParties = [{}]
lastYearsParties[0][key] = yore
var happening = [{}, {}, {}, {}]
happening[0][key] = today
happening[1][key] = tomorrow
happening[2][key] = nextWeek
happening[3][key] = nextMonth

test('testing range', function(t){

  var begin = events[0][key]
  var end = events[events.length - 1][key]
  t.plan(2)
  if(cal.range(events, key, fmt, begin, end).length === events.length){
    t.pass('All dates were within the range, as expected')
  }

  // test a date should be outside the range
  t.equal(0, cal.range(lastYearsParties, key, fmt, begin, end).length)
})

test('testing for tomorrow', function(t){
  t.plan(1)
  if(cal.tomorrow(happening, key, fmt).length === 1) t.pass('tomorrow passed')
})

test('testing for this week', function(t){
  var event = [{}]
  event[0][key] = today
  t.plan(2)
  if(cal.thisWeek(event, key, fmt).length){
    t.pass('an event today is indeed this week')
  }
  t.equal(0, cal.thisWeek(lastYearsParties, key, fmt).length)
})

test('testing WITHIN week', function(t){
  t.plan(2)
  var event = [{}]
  event[0][key] = today
  if(cal.withinWeek(event, key, fmt).length){
      t.pass('an event today is indeed within a week which begins today!')
  }
  t.equal(0, cal.withinWeek(lastYearsParties, key, fmt).length)
})

test('testing for next week', function(t){
  t.plan(1)
  if(cal.nextWeek(happening.splice(2,1), key, fmt).length === 1) t.pass('next week passed')

})

test('testing for next month', function(t){
  t.plan(1)
  if(cal.nextMonth(happening.splice(2,1), key, fmt).length === 1) t.pass('next month passed')

})
test('testing this month', function(t){
   t.plan(2)
   var events = [{}]
   events[0][key] = today
   if(cal.thisMonth(events, key, fmt).length){
    t.pass('an event today is of this month.')
   }
  t.equal(0, cal.thisMonth(lastYearsParties, key, fmt).length)
})

test('testing WITHIN month', function(t){
  t.plan(2)
  var events = [{}]
  events[0][key] = today
  if(cal.withinMonth(events, key, fmt).length){
    t.pass('an event today is within a month beginning today!')
  }
  t.equal(0, cal.withinMonth(lastYearsParties, key, fmt).length)
})

test('testing linear temporal sorting!', function(t){
  t.plan(1)
  t.same(events, cal.sort(events.reverse(), key, fmt))
})

//console.log(thisMonth(events, 'starts_at', fmt, 2))
//console.log(cal.thisWeek(events, 'starts_at', fmt))
//console.log(range(events, 'starts_at', fmt, events[23].starts_at, events[25].starts_at))

