var $ = {};

// ---------------------------------------------
// Comparison and Equality
// ---------------------------------------------

$.equality = function () {
  var pargs = arguments;
  return function (x, y) {
    for (var i = 0, len = pargs.length; i < len; i += 1) {
      if (x[pargs[i]] !== y[pargs[i]]) {
        return false;
      }
    }
    return true;
  };
};

$.compare = function (c, c2) {
  if (typeof c === 'function') {
    c2 = c2 || 1;
    return function (x, y) {
      return c2 * (c(x) - c(y));
    };
  }
  c = c || 1;
  return function (x, y) {
    return c * (x - y);
  };
};

// result of this can be passed directly to Array::sort
$.comparing = function () {
  var args = arguments;
  return function (x, y) {
    for (var i = 0, len = args.length; i < len; i += 2) {
      var factor = args[i + 1] || 1;
      if (x[args[i]] !== y[args[i]]) {
        return factor * (x[args[i]] - y[args[i]]);
      }
    }
    return 0;
  };
};

// helper for set functions
$.indexOfBy = function (eq, xs, x) {
  for (var i = 0, len = xs.length; i < len; i += 1) {
    if (eq(xs[i], x)) {
      return i;
    }
  }
  return -1;
};

// default equality, like `operators` eq2
var eq2 = (x, y) => x === y;

// ---------------------------------------------
// Operations
// ---------------------------------------------

// max/min + generalized
$.maximum = (xs) => Math.max.apply(Math, xs);
$.minimum = (xs) => Math.min.apply(Math, xs);

// TODO: dont crash on zero? haskell does this too..
$.maximumBy = (cmp, xs) => xs.reduce((max, x) => cmp(x, max) > 0 ? x : max, xs[0]);
$.minimumBy = (cmp, xs) => xs.reduce((min, x) => cmp(x, min) < 0 ? x : min, xs[0]);

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

// "Set" operations
$.intersectBy = function (eq, xs, ys) {
  return xs.reduce((acc, x) => {
    if ($.indexOfBy(eq, ys, x) >= 0) {
      acc.push(x);
    }
    return acc;
  }, []);
};
$.intersect = (xs, ys) => $.intersectBy(eq2, xs, ys);

$.nubBy = function (eq, xs) {
  return xs.reduce((acc, x) => {
    if ($.indexOfBy(eq, acc, x) < 0) {
      acc.push(x);
    }
    return acc;
  }, []);
};
$.nub = (xs) => $.nubBy(eq2, xs);


$.groupBy = function (eq, xs) {
  var result = []
    , j, sub;
  for (var i = 0, len = xs.length; i < len; i = j) {
    sub = [xs[i]];
    for (j = i + 1; j < len && eq(xs[i], xs[j]); j += 1) {
      sub.push(xs[j]);
    }
    result.push(sub);
  }
  return result;
};
$.groupBy = function (eq, xs) {
  var result = []
    , j, sub;
  for (var i = 0, len = xs.length; i < len; i = j) {
    sub = [xs[i]];
    for (j = i + 1; j < len && eq(xs[i], xs[j]); j += 1) {
      sub.push(xs[j]);
    }
    result.push(sub);
  }
  return result;
};
$.group = (xs) => $.groupBy(eq2, xs);

$.unionBy = function (eq, xs, ys) {
  return xs.concat(xs.reduce($.deleteBy.bind(null, eq), $.nubBy(eq, ys)));
};
$.union = (xs, ys) => xs.concat(xs.reduce($.delete, $.nub(ys)));

$.differenceBy = (eq, xs, ys) => ys.reduce($.deleteBy.bind(null, eq), xs.slice());
$.difference = (xs, ys) => ys.reduce($.delete, xs.slice());

// These now assume no duplicates
$.isSubsetOf = (xs, ys) => xs.every((x) => ys.indexOf(x) >= 0);
$.isProperSubsetOf = function (xs, ys) {
  return $.isSubsetOf(xs, ys) && ys.some((y) => xs.indexOf(y) < 0);
};

// end - export
module.exports = $;
