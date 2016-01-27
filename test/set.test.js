var $ = require('..');
var test = require('bandage');

// take a few basics from interlude to help testing
var get = (prop) => (el) => el[prop];
var eq2 = (x, y) => x === y;

// a fun definition of equality
var notCoprime = function (a, b) {
  while (b) {
    var temp = b;
    b = a % b;
    a = temp;
  }
  return a > 1;
};

test('comparisons', function *(t) {
  t.eq([2,4,1,3].sort($.compare()), [1,2,3,4], 'compare sorts asc');
  t.eq([2,4,1,3].sort($.compare(+1)), [1,2,3,4], 'compare +1 is asc');
  t.eq([2,4,1,3].sort($.compare(-1)), [4,3,2,1], 'compare -1 desc');

  // compare overloaded
  var cost = (x) => 4*x.a + x.b;

  var objs = [{ a: 1, b: 0 }, { a: 0, b: 3 }]; // first has higher cost
  objs.sort($.compareBy(cost));

  t.eq(objs[0], { a: 0, b: 3 }, 'compare by cost asc (lowest first)');

  objs.sort($.compareBy(cost, +1));
  t.eq(objs[0], { a: 0, b: 3 }, 'compare by cost asc def (lowest first)');

  objs.sort($.compareBy(cost, -1));
  t.eq(objs[0], { a: 1, b: 0 }, 'compare by cost desc (highest first)');

  t.eq($.minimumBy($.compareBy(cost), objs), { a: 0, b: 3 }, 'minimum cost');

  objs.sort($.comparing('a'));
  t.eq(objs[0], { a: 0, b: 3 }, 'comparing prop');

  // never underestimate a lambda
  var money = [{ id: 1, money: 3 }, { id: 2, money: 0 }, { id: 3, money: 3 }];
  t.eq(money.sort((x, y) => (y.money - x.money) || (y.id - x.id)),
    [ { id: 3, money: 3 }, { id: 1, money: 3 }, { id: 2, money: 0 } ],
    'money max first, then id max first'
  );
});

test('maxmin', function *(t) {
  t.equal($.maximum([1,3,2,5,2]), 5, 'max [1,3,2,5,2] === 5');
  t.equal($.minimum([1,3,2,5,2]), 1, 'min [1,3,2,5,2] === 1');

  // generalized
  var maxRes = $.maximumBy($.comparing('length'), [ [2], [1,3,2], [2,3] ]);
  t.eq(maxRes, [1,3,2], 'maxBy returns the element for which length is maximal');
  var maxResCost = $.maximum([ [1,3,2], [2], [2,3] ].map(get('length')));
  t.equal(maxResCost, 3, 'maximum of collects simply returns the value');

  var minRes = $.minimumBy($.comparing('length'), [ [1,3,2], [2], [2,3] ]);
  t.eq(minRes, [2], 'minBy returns the element for which length is maximal');
  var minResCost = $.minimum([ [1,3,2], [2], [2,3] ].map(get('length')));
  t.equal(minResCost, 1, 'minymum of collects simply returns the value');
});

test('equality', function *(t) {
  var eq1 = $.equality(1);
  t.eq(eq1([2,1], [5,1]), true, 'equality on 1');
  t.eq(eq1([2,1], [2,2]), false, '!equality on 1');

  var aEq2 = $.equality('a');
  t.eq(aEq2({ a: 5 }, { a: 3 }), false, '!equality on a');
  t.eq(aEq2({ a: 5 }, {}), false, '!equality on a (failed to exist)');
  t.eq(aEq2({ a: 5 }, { b: 2, a: 5 }), true, 'equality on a');

  var aEqX2 = $.equalityBy((x) => x.a*2);
  t.eq(aEqX2({ a: 5 }, { a: 3 }), false, '!equalityBy cost on a');
  t.eq(aEqX2({ a: 5 }, {}), false, '!equalityBy cost on a (failed to exist)');
  t.eq(aEqX2({ a: 5 }, { b: 2, a: 5 }), true, 'equalityBy cost on a');
});

test('subsetOf', function *(t) {
  t.ok($.isSubsetOf([1,2], [1,2,3]), '[1,2] subset of [1,2,3]');
  t.ok(!$.isSubsetOf([1,2,3], [1,2]), '[1,2,3] not subset of [1,2]');
  t.ok($.isSubsetOf([1,2,3], [1,2,3]), '[1,2,3] subset of [1,2,3]');
  t.ok(!$.isProperSubsetOf([1,2,3], [1,2,3]), '[1,2,3] not proper subset of itself');
  t.ok($.isProperSubsetOf([1,2], [1,2,3]), '[1,2] is a proper subset of [1,2,3]');
  t.ok(!$.isProperSubsetOf([1,2,3], [1,2]), '[1,2,3] is not a proper subset of [1,2]');
  t.ok(!$.isProperSubsetOf([1,2,2], [1,2]), '[1,2,2] is not a proper subset of [1,2]');
  t.ok($.isSubsetOf([1,2,2], [1,2,2,3]), '[1,2,2] subset of [1,2,2,3]');
  t.ok($.isSubsetOf($.unique([1,2,2]), [1,2,3]), 'unique([1,2,2]) subset of [1,2,3]');
});

// ----------------------------------------------------------------------------

test('indexOf', function *(t) {
  var ary = [ { a: 1 }, { a: 2 } ];
  var eqA = (x, y) => x.a === y.a;
  t.eq($.indexOfBy(eqA, ary, { a: 1 }), 0, 'indexOf a el 0');
  t.eq($.indexOfBy(eqA, ary, { a: 3 }),-1, 'indexOf a el oob');

  t.eq($.indexOfBy(notCoprime, [6, 9, 12, 15, 18, 21], 7), 5, 'indexOf by gcd > 1');
});

test('insert', function *(t) {
  t.eq($.insert([1,2,3,4],2), [1,2,2,3,4], 'insert in middle');
  t.eq($.insert([1,2,3,4],5), [1,2,3,4,5], 'insert at end');
  t.eq($.insert([1,2,3,4],0), [0,1,2,3,4], 'insert at beginning');

  var xs = [1,2,3,4,5];
  $.insert(xs, 2);
  t.equal(xs.length, 5+1, 'insert modifies');

  t.eq($.insertBy($.compare(-1), [4,3,2,1], 2), [4,3,2,2,1], 'insert desc mid');
  t.eq($.insertBy($.compare(-1), [4,3,2,1], 0), [4,3,2,1,0], 'insert desc end');
  t.eq($.insertBy($.compare(-1), [4,3,2,1], 5), [5,4,3,2,1], 'insert desc end');

  var ys = [ [5,1], [4,2], [3,3] ];
  var res1 = $.insertBy($.comparing(1), ys.slice(), [8,2]);
  t.eq(res1, [ [5,1], [8,2], [4,2], [3,3] ], 'insertBy comparing (1) mid');
  var res2 = $.insertBy($.comparing(1), ys.slice(), [8,0]);
  t.eq(res2, [ [8,0], [5,1], [4,2], [3,3] ], 'insertBy comparing (1) beg');
  var res3 = $.insertBy($.comparing(1), ys.slice(), [8,4]);
  t.eq(res3, [ [5,1], [4,2], [3,3], [8,4] ], 'insertBy comparing (1) end');
});

test('delete', function *(t) {
  var res1 = $.deleteBy($.equality(1), [[1,3],[2,1],[1,4]], [5,1]);
  t.eq(res1, [[1,3], [1,4]], 'delete by equality(1)');

  var res2 = $.deleteBy($.equality(0), [[1,3],[2,1],[1,4]], [1,999]);
  t.eq(res2, [[2,1], [1,4]], 'delete by equality(0) removes only first');

  t.eq($.delete([1,2,3,4,5], 5), [1,2,3,4], 'delete from range');
  t.eq($.delete([1,2,3], 2), [1,3], 'delete from small range');
  t.eq($.delete([1,1,2,2], 2), [1,1,2], 'delete from duplicate list');
  t.eq($.delete([1,1,2,2], 1), [1,2,2], 'delete from duplicate list');
});

test('intersect', function *(t) {
  t.eq($.intersect([1,2,3,4], [2,4,6,8]), [2,4], 'intersect basic');
  t.eq($.intersect([1,2,2,3,4], [6,4,4,2]), [2,2,4], 'intersect duplicates');

  var res1 = $.intersectBy($.equality(1), [[1,3],[2,1],[1,4]], [[1,2], [2,4]]);
  t.eq(res1, [[1,4]], 'intersectBy crazy, result is in first list');

  t.eq($.intersectBy(notCoprime, [3, 5, 7, 11, 13, 15], [10, 22, 21]),
    [3, 5, 7, 11, 15], // 13 only element in xs without common factors with ys
    'intersect by gcd > 1'
  );
});

test('unique', function *(t) {
  t.eq($.unique([2,3,7,5]), [2,3,7,5], 'unique on unique');
  t.eq($.uniqueBy(eq2, [2,3,7,5]), [2,3,7,5], 'unique on unique');
  t.eq($.unique([1,3,2,4,1,2]), [1,3,2,4], 'unique basic');
  t.eq($.uniqueBy(eq2, [1,3,2,4,1,2]), [1,3,2,4], 'uniqueBy basic');

  t.eq($.unique([1,1,1,1]), [1], 'unique ones basic');
  t.eq($.uniqueBy(eq2, [1,1,1,1]), [1], 'uniqueBy ones basic');

  var res2 = $.uniqueBy($.equality(1), [[1,3],[5,2],[2,3],[2,2]]);
  t.eq(res2, [[1,3],[5,2]], 'uniqueBy equality on 1');

  t.eq($.uniqueBy(notCoprime, [2,3,4,5,6,7,8,9,10,11]), [2,3,5,7,11], 'primes uniqueBy');
});

test('group', function *(t) {
  t.eq($.group([1,3,3,2,3,3]), [[1],[3,3],[2],[3,3]], 'basic group');
  t.eq($.group([1,1,1,1]), [[1,1,1,1]], 'basic group ones');

  var res = $.groupBy($.equality(1), [[1,3],[2,1],[4,1],[2,3]]);
  t.eq(res, [ [[1,3]], [[2,1],[4,1]], [[2,3]] ], 'groupBy equality on 1');

  t.eq($.groupBy(notCoprime, [3, 6, 7, 14, 15, 20]),
    [ [3, 6], [7, 14], [15, 20] ],
    'group by gcd > 1'
  );
});

test('union', function *(t) {
  t.eq($.union([1,3,2,4], [2,3,7,5]), [1,3,2,4,7,5], 'union');
  var res = $.unionBy($.equality(1)
    , [[0,1],[0,3],[0,2],[0,4]]
    , [[0,2],[0,3],[0,7],[0,5]]
  ).map(get(1));
  t.eq(res, [1,3,2,4,7,5], 'unionBy eq(1) works equally well');
});

test('difference', function *(t) {
  t.eq($.difference([1,2,2,3,4], [1,2,3]), [2,4], 'difference simple');
  var xs = [1,2,3,4,5];
  var ys = [1,2,3];
  t.eq($.difference(ys.concat(xs), ys), xs, 'difference prop');

  var res = $.differenceBy($.equality('a')
    , [{a: 1}, {a: 2}, {a: 3}]
    , [{a: 2, b: 1}, {a: 4, b: 2}]
  );
  t.eq(res, [{a: 1}, {a: 3}], 'differenceBy');
});
