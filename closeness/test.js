var test = require('tape');
var howClose = require('./');
var closeEnough = howClose(100, 5)

test('closeness', function (t) {

    t.plan(3);

    t.ok(closeEnough(99.999999));
    t.ok(closeEnough(99));
    t.notOk(closeEnough(3));
		
});