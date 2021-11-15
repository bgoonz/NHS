//window.Buffer = Buffer
var xxx = require('./')
var ds = xxx.deconstruct;
var cs = xxx.construct;
var ndarray = require('ndarray')
var test = require('tape')
var str = 'for you my mooncalf';
var n = 1/9
var fn = function(foo,balls){ 
  return function(biz,baap){
    return foo + balls + biz + baap
  }
}
var reg = new RegExp('[a-z]')
var buffa = new Buffer('a herald buffers our way')
var ab = new ArrayBuffer(16)
var f32 = new Float64Array(1)
f32[0] = 1/2
var nd = new ndarray(new Float32Array(4), [2,2])
var arr = [null, undefined, Infinity, -Infinity, str, n, ab, f32, nd]
var nest = {one: 1, two: {two: 'two', three: {three: 4}}}
var obj = {null: null, u: undefined, inf: Infinity, ninf: -Infinity, str: str, n: n, ab: ab, f32: f32, nd: nd, arr: arr, nest: nest}

test('String', function(t){
  t.equal(str, cs(ds(str)))
  t.equal(n, cs(ds(n)))
  t.equal(fn(2,3)(4,5), cs(ds(fn))(2,3)(4,5))
  t.deepLooseEqual(reg, cs(ds(reg)))
  t.deepLooseEqual(buffa, cs(ds(buffa)))//.toString())
  t.deepLooseEqual(ab, cs(ds(ab)))
  t.deepLooseEqual(f32, cs(ds(f32)))
  t.deepLooseEqual(null, cs(ds(null)))
  t.deepLooseEqual(undefined, cs(ds(undefined)))
  t.deepEqual(isNaN(NaN), isNaN(cs(ds(NaN))))
  t.deepLooseEqual(Infinity, cs(ds(Infinity)))
  t.deepLooseEqual(-Infinity, cs(ds(-Infinity)))
  t.deepLooseEqual(nd, cs(ds(nd)))
  t.deepLooseEqual(arr, cs(ds(arr)))
  t.deepLooseEqual(obj, cs(ds(obj)))


})
/*
console.log(cs(ds(null)))
console.log(cs(ds(undefined)))
console.log(cs(ds(Infinity)))
console.log(cs(ds(str)))
console.log(cs(ds(n)))
console.log(cs(ds(fn)))
console.log(cs(ds(reg)))
console.log(cs(ds(ab)))
console.log(cs(ds(f32)))
console.log(cs(ds(buffa)))
console.log(cs(ds(nd)))
console.log(cs(ds(arr)))
console.log(cs(ds(obj)))
/*
test('string', function(t){
  t.plan(1)
  t.equals('ArrayBuffer', ds(str).data)
})
*/
