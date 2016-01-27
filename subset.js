var $ = {};

// ---------------------------------------------
// Comparison and Equality
// ---------------------------------------------

var eq2 = (x, y) => x === y; // used throughout
$.equality = (prop) => (x, y) => x[prop] === y[prop];
$.equalityBy = (cost) => (x, y) => cost(x) === cost(y);
$.compare = (c) => (x, y) => (c || 1)*(x - y);
$.compareBy = (cost, c) => (x, y) => (c || 1)*(cost(x) - cost(y));
$.comparing = (prop, c) => (x, y) => (c || 1)*(x[prop] - y[prop]);

// ---------------------------------------------
// Max/min + subset checks
// ---------------------------------------------

// max/min
$.maximum = (xs) => Math.max.apply(Math, xs);
$.minimum = (xs) => Math.min.apply(Math, xs);

// generalized max/min - cannot be called on an empty array
$.maximumBy = (cmp, xs) => xs.reduce((max, x) => cmp(x, max) > 0 ? x : max, xs[0]);
$.minimumBy = (cmp, xs) => xs.reduce((min, x) => cmp(x, min) < 0 ? x : min, xs[0]);

// subset checks - does not account for duplicate elements in xs or ys
$.isSubsetOf = (xs, ys) => xs.every((x) => ys.indexOf(x) >= 0);
$.isProperSubsetOf = function (xs, ys) {
  return $.isSubsetOf(xs, ys) && ys.some((y) => xs.indexOf(y) < 0);
};

// ---------------------------------------------
// Set Operations
// ---------------------------------------------

// generalized indexOf
$.indexOfBy = function (eq, xs, x) {
  for (var i = 0, len = xs.length; i < len; i += 1) {
    if (eq(xs[i], x)) {
      return i;
    }
  }
  return -1;
};

// Modifying Array operations
$.insertBy = function (cmp, xs, x) {
  for (var i = 0, len = xs.length; i < len; i += 1) {
    if (cmp(xs[i], x) >= 0) {
      xs.splice(i, 0, x);
      return xs;
    }
  }
  xs.push(x);
  return xs;
};
$.insert = (xs, x) => $.insertBy($.compare(), xs, x);

$.deleteBy = function (eq, xs, x) {
  var idx = $.indexOfBy(eq, xs, x);
  if (idx >= 0) {
    xs.splice(idx, 1);
  }
  return xs;
};
$.delete = (xs, x) => $.deleteBy(eq2, xs, x);

// Pure operations
$.intersectBy = function (eq, xs, ys) {
  return xs.reduce((acc, x) => {
    if ($.indexOfBy(eq, ys, x) >= 0) {
      acc.push(x);
    }
    return acc;
  }, []);
};
$.intersect = (xs, ys) => $.intersectBy(eq2, xs, ys);

$.uniqueBy = function (eq, xs) {
  return xs.reduce((acc, x) => {
    if ($.indexOfBy(eq, acc, x) < 0) {
      acc.push(x);
    }
    return acc;
  }, []);
};
$.unique = (xs) => $.uniqueBy(eq2, xs);

$.groupBy = function (eq, xs) {
  var result = [];
  for (var i = 0, j = 0, len = xs.length; i < len; i = j) {
    for (j = i + 1; j < len && eq(xs[i], xs[j]);) { j += 1; }
    result.push(xs.slice(i, j));
  }
  return result;
};
$.group = (xs) => $.groupBy(eq2, xs);

$.unionBy = function (eq, xs, ys) {
  return xs.concat(xs.reduce($.deleteBy.bind(null, eq), $.uniqueBy(eq, ys)));
};
$.union = (xs, ys) => xs.concat(xs.reduce($.delete, $.unique(ys)));

$.differenceBy = (eq, xs, ys) => ys.reduce($.deleteBy.bind(null, eq), xs.slice());
$.difference = (xs, ys) => ys.reduce($.delete, xs.slice());

// end - export
module.exports = $;
