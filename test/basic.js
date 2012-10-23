var tap = require('tap')
  , test = tap.test
  , $ = require('../');

// take a few basics from interlude to help testing
var get = function (prop) {
  return function (el) {
    return el[prop];
  };
};
var eq2 = function (x, y) {
  return x === y;
}

test("comparison and equality", function (t) {
  // compare
  t.deepEqual([2,4,1,3].sort($.compare()), [2,4,1,3].sort(), "$.compare is default behavior");
  t.deepEqual([2,4,1,3].sort($.compare()), [1,2,3,4], "$.compare is default behavior asc");
  t.deepEqual([2,4,1,3].sort($.compare(+1)), [1,2,3,4], "$.compare is default behavior (asc specified)");
  t.deepEqual([2,4,1,3].sort($.compare(-1)), [4,3,2,1], "$.compare can change direction");

  // compare overloaded
  var cost = function (x) {
    return 4*x.a + x.b;
  };
  var objs = [{a:1, b:0}, {a:0, b:3}]; // first has higher cost
  objs.sort($.compare(cost));

  t.deepEqual(objs[0], {a:0, b:3}, "compare by cost asc (lowest first)");

  objs.sort($.compare(cost, +1))
  t.deepEqual(objs[0], {a:0, b:3}, "compare by cost asc def (lowest first)");

  objs.sort($.compare(cost, -1));
  t.deepEqual(objs[0], {a:1, b:0}, "compare by cost desc (highest first)");

  t.deepEqual($.minimumBy($.compare(cost), objs), {a:0, b:3}, "minimum has smallest cost");

  // comparing
  t.deepEqual([[1,3],[1,2],[1,5]].sort($.comparing(1)), [[1,2],[1,3],[1,5]], "comparing");
  t.deepEqual([{a:2},{a:1}].sort($.comparing('a')), [{a:1}, {a:2}], "comparing objs");

  var money = [{id: 1, money: 3}, {id: 2, money: 0}, {id: 3, money: 3}];
  var res = money.sort($.comparing('money', -1, 'id', -1));
  var resExp = [ { id: 3, money: 3 }, { id: 1, money: 3 }, { id: 2, money: 0 } ];
  t.deepEqual(res, resExp, "money max first, then id max first");

  var res = money.sort($.comparing('money', -1, 'id', +1));
  var resExp = [ { id: 1, money: 3 }, { id: 3, money: 3 }, { id: 2, money: 0 } ];
  t.deepEqual(res, resExp, "money max first, then id min first");

  var res = money.sort($.comparing('money', -1, 'id'));
  var resExp = [ { id: 1, money: 3 }, { id: 3, money: 3 }, { id: 2, money: 0 } ];
  t.deepEqual(res, resExp, "money max first, then id min (default ('+'))");

  // equality
  var eq1 = $.equality(1);
  t.equal(eq1([2,1], [5,1]), true, "equality on 1");
  t.equal(eq1([2,1], [2,2]), false, "!equality on 1");

  aEq2 = $.equality('a');
  t.equal(aEq2({a:5}, {a:3}), false, "!equality on a");
  t.equal(aEq2({a:5}, {}), false, "!equality on a (failed to exist)");
  t.equal(aEq2({a:5}, {b:2, a:5}), true, "equality on a");

  t.end();
});

test("maxBy/minBy", function (t) {
  t.equal($.maximum([1,3,2,5,2]), 5, "max [1,3,2,5,2] === 5");
  t.equal($.minimum([1,3,2,5,2]), 1, "min [1,3,2,5,2] === 1");

  // generalized
  var mbRes = $.maximumBy($.comparing('length'), [ [1,3,2], [2], [2,3] ]);
  t.deepEqual(mbRes, [1,3,2], 'maxBy returns the element for which length is maximal');
  var collectRes = $.maximum([ [1,3,2], [2], [2,3] ].map(get('length')));
  t.equal(collectRes, 3, "maximum of collects simply returns the value");

  var mbRes = $.minimumBy($.comparing('length'), [ [1,3,2], [2], [2,3] ]);
  t.deepEqual(mbRes, [2], 'minBy returns the element for which length is maximal');
  var collectRes = $.minimum([ [1,3,2], [2], [2,3] ].map(get('length')));
  t.equal(collectRes, 1, "minymum of collects simply returns the value");
  t.end();
});


test("list operations", function (t) {
  // insert
  t.deepEqual($.insert([1,2,3,4],2), [1,2,2,3,4], "insert in middle");
  t.deepEqual($.insert([1,2,3,4],5), [1,2,3,4,5], "insert at end");
  t.deepEqual($.insert([1,2,3,4],0), [0,1,2,3,4], "insert at beginning");

  var xs = [1,2,3,4,5];
  $.insert(xs, 2);
  t.equal(xs.length, 5+1, "insert modifies");

  t.deepEqual($.insertBy($.compare(-1), [4,3,2,1], 2), [4,3,2,2,1], "insert desc mid");
  t.deepEqual($.insertBy($.compare(-1), [4,3,2,1], 0), [4,3,2,1,0], "insert desc end");
  t.deepEqual($.insertBy($.compare(-1), [4,3,2,1], 5), [5,4,3,2,1], "insert desc end");

  var xs = [ [5,1], [4,2], [3,3] ];
  var res = $.insertBy($.comparing(1), xs.slice(), [8,2]);
  t.deepEqual(res, [ [5,1], [8,2], [4,2], [3,3] ], "insertBy comparing (1) mid");
  var res = $.insertBy($.comparing(1), xs.slice(), [8,0]);
  t.deepEqual(res, [ [8,0], [5,1], [4,2], [3,3] ], "insertBy comparing (1) beg");
  var res = $.insertBy($.comparing(1), xs.slice(), [8,4]);
  t.deepEqual(res, [ [5,1], [4,2], [3,3], [8,4] ], "insertBy comparing (1) end");

  // delete
  var res = $.deleteBy($.equality(1), [[1,3],[2,1],[1,4]], [5,1]);
  t.deepEqual(res, [[1,3], [1,4]], "delete by equality(1)");

  var res = $.deleteBy($.equality(0), [[1,3],[2,1],[1,4]], [1,999]);
  t.deepEqual(res, [[2,1], [1,4]], "delete by equality(0) removes only first");

  t.deepEqual($.delete([1,2,3,4,5], 5), [1,2,3,4], "delete from range");
  t.deepEqual($.delete([1,2,3], 2), [1,3], "delete from small range");
  t.deepEqual($.delete([1,1,2,2], 2), [1,1,2], "delete from duplicate list");
  t.deepEqual($.delete([1,1,2,2], 1), [1,2,2], "delete from duplicate list");


  // non-modifying
  // intersect
  var eq = $.equality('length');
  t.deepEqual($.intersect([1,2,3,4], [2,4,6,8]), [2,4], "intersect basic");
  t.deepEqual($.intersect([1,2,2,3,4], [6,4,4,2]), [2,2,4], "intersect duplicates");

  var res = $.intersectBy($.equality(1), [[1,3],[2,1],[1,4]], [[1,2], [2,4]]);
  t.deepEqual(res, [[1,4]], "intersectBy crazy, result is in first list");

  // nub
  t.deepEqual($.nub([2,3,7,5]), [2,3,7,5], "nub on unique");
  t.deepEqual($.nubBy(eq2, [2,3,7,5]), [2,3,7,5], "nub on unique");
  t.deepEqual($.nub([1,3,2,4,1,2]), [1,3,2,4], "nub basic");
  t.deepEqual($.nubBy(eq2, [1,3,2,4,1,2]), [1,3,2,4], "nubBy basic");

  t.deepEqual($.nub([1,1,1,1]), [1], "nub ones basic");
  t.deepEqual($.nubBy(eq2, [1,1,1,1]), [1], "nubBy ones basic");

  var res = $.nubBy($.equality(1), [[1,3],[5,2],[2,3],[2,2]]);
  t.deepEqual(res, [[1,3],[5,2]], "nubBy equality on 1");

  var notCoprime = function (a, b) {
    while (b) {
      var temp = b;
      b = a % b;
      a = temp;
    }
    return a > 1;
  };
  t.deepEqual($.nubBy(notCoprime, [2,3,4,5,6,7,8,9,10,11]), [2,3,5,7,11], "primes nubBy");

  // group
  t.deepEqual($.group([1,3,3,2,3,3]), [[1],[3,3],[2],[3,3]], "basic group");
  t.deepEqual($.group([1,1,1,1]), [[1,1,1,1]], "basic group ones");

  var res = $.groupBy($.equality(1), [[1,3],[2,1],[4,1],[2,3]]);
  t.deepEqual(res, [ [[1,3]], [[2,1],[4,1]], [[2,3]] ], "groupBy equality on 1");

  // union
  t.deepEqual($.union([1,3,2,4], [2,3,7,5]), [1,3,2,4,7,5], "union");
  var res = $.unionBy($.equality(1)
    , [[0,1],[0,3],[0,2],[0,4]]
    , [[0,2],[0,3],[0,7],[0,5]]
  ).map(get(1));
  t.deepEqual(res, [1,3,2,4,7,5], "unionBy eq(1) works equally well");

  // difference
  t.deepEqual($.difference([1,2,2,3,4], [1,2,3]), [2,4], "difference simple");
  var xs = [1,2,3,4,5];
  var ys = [1,2,3];
  t.deepEqual($.difference(ys.concat(xs), ys), xs, "difference prop");

  var res = $.differenceBy($.equality('a')
    , [{a:1}, {a:2}, {a:3}]
    , [{a:2, b:1}, {a:4, b:2}]
  );
  t.deepEqual(res, [{a:1}, {a:3}], "differenceBy");
  t.end();
});


test("isSubsetOf", function (t) {
  t.ok($.isSubsetOf([1,2], [1,2,3]), "[1,2] subset of [1,2,3]");
  t.ok(!$.isSubsetOf([1,2,3], [1,2]), "[1,2,3] not subset of [1,2]");
  t.ok($.isSubsetOf([1,2,3], [1,2,3]), "[1,2,3] subset of [1,2,3]");
  t.ok(!$.isSubsetOf([1,2,3], [1,2,3], true), "[1,2,3] not proper subset of itself");
  t.ok($.isSubsetOf([1,2], [1,2,3], true), "[1,2] is a proper subset of [1,2,3]");
  t.ok(!$.isSubsetOf([1,2,3], [1,2], true), "[1,2,3] is not a proper subset of [1,2]");
  t.ok(!$.isSubsetOf([1,2,2], [1,2], true), "[1,2,2] is not a proper subset of [1,2]");
  t.ok($.isSubsetOf([1,2], [1,2,2], true), "[1,2] is a proper subset of [1,2,2]");
  t.ok(!$.isSubsetOf([1,2,2], [1,2,3]), "[1,2,2] not subset of [1,2,3]");
  t.ok($.isSubsetOf([1,2,2], [1,2,2,3]), "[1,2,2] subset of [1,2,2,3]");
  t.ok($.isSubsetOf($.nub([1,2,2]), [1,2,3]), "nub([1,2,2]) subset of [1,2,3]");

  t.end();
});
