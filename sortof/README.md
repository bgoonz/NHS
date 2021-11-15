## sortof

This module returns several functions that sort/filter a list of objects by date string.  This module uses [moment](http://momentjs.com/), so your date values can also be moment objects.

Given a list of objects that have a date value, you can filter by dates occuring:
* today
* tomorrow
* this week
* next week
* within a week (today + 1 week)
* this month
* next month 
* within a month (today + 1 month)
* any range, given a start and end date

This module works in Node.js and the browser, with Browserify.

[![browser support](https://ci.testling.com/NHQ/sortof.png?duhhhhhh)](https://ci.testling.com/NHQ/sortof)

```
npm install sorta
```

### usage

All functions take the same first 3 params:
* [Array] an array of objects
* [String] key in each object that points to the date string (ie. 'date', 'start_time')
* [String] format of date strings according to [moment#format](http://momentjs.com/docs/#/displaying/format/)

Others take an additional param.

### functions

The module returns an object with the following member functions. They each filter and return a list. 

#### sort(array, key, format)

returns an array of objects sorted linearly from today to the future

#### range(array, key, format, begin, end)

returns an array of objects fliltered by the range (within the range).  The begin and end params should be date strings in the same format as the rest, or a moment.js object.  The other functions use this function.

#### today(array, key, format)

return an array of objects which have date-times that are Today

#### tomorrow([ibid.])

returns same for dates occuring tomorrow

#### thisWeek([ibid.])

returns same for dates occuring within the current calendar week (beginning Sunday)

#### nextWeek([ibid.])

returns same for dates occuring next calendar week

#### withinWeek([ibid.])

returns same for dates occuring within a week, starting today

#### thisMonth(array, key, fmt [, month])

returns same for dates occruing within the given calendar month. Defaults to this month.  The month param can be a number (0,11), or a string, the name of the month.

#### nextMonth(array, key, fmt)

return same for dates occuring next calenday month

#### withinMonth(array, key, format)

returns same for dates within the next month, starting today

#### moment

for convenience, this module returns the actual moment module.


