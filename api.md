# Subset API
Subset export several basic and generalized set operations for JavaScript Arrays.

This is in general a pure functional library, but a couple of functions does modify the input (`insert` and `delete` only). The generalized versions accept general notions of equality which is explored immediately below.

## Generalized Equality
An equality function is a function that takes two elements and return whether or not they are equal. These can be constructed by lambdas in ES6, but two shorthands exist:

### $.equality(prop) :: (x, y) -> Boolean
This function creates an equality function based on a property name. It will return true if and only if the value of the property listed is the same for both x and y.

```js
var lenEquals = $.equality('length');
lenEquals([1,3,5], [2,4,6]); // true
lenEquals([1,3,5], [2,4]); // false
```

### $.equalityBy(cost) :: (x, y) -> Boolean
This function creates an equality function based on a cost function. It will return true if and only if `cost(x) === cost(y)`.

```js
var steve = { name: 'Steve', money: 30000, rank: 5 };
var peter = { name: 'Peter', money: 30000, rank: 3 };
var steve2 = { name: 'Clone', money: 30000, rank: 5 };
var equallyCool = $.equalityBy((x) => x.money + '::' + x.status);
equallyCool(steve, peter); // false
equallyCool(steve, steve2); // true
```

In this case the check is actually comparing two strings with an arbitrary separator (and the value of money is stringified on each side).

This method of forcing string comparison works quite well in javascript, but if you find this practice barbaric, lambdas is your friend.

## Generalized Comparison
A comparison function is a function that takes two elements and returns a a positive number if the first is greater, or a negative number if the first is smaller (or zero if no difference). These functions are typically passed to [Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).

These are often created via lambdas in ES6, but a shorthands exist.

### $.compare([ord]) :: (x, y) -> Number
This creates a comparison function for numbers, or other types where `x.valueOf()` provides a sensible ordering.

When pased to `Array.prototype.sort`, it will sort the array _numerically_ as opposed to the default ECMA behaviour of turning the elements into strings, then sorting them _lexicographically_. This helps avoid common sorting mistakes:

```js
[1,4,3,2].sort(); // [1,2,3,4] (expected)
[2, 100, 10, 4].sort(); // [10, 100, 2, 4] (wtf!)

[1,4,3,2].sort($.compare()); // [1,2,3,4] (expected)
[2, 100, 10, 4].sort($.compare()); // [2, 4, 10, 100] (expected..)
```

The ord parameter is there to optionally reverse the sort.

```js
[2, 100, 10, 4].sort($.compare(-1)); // [100, 10, 4, 2]
```

Note that you can override the `valueOf` method for a class to gain the ability to use `compare` with any type.

### $.compareBy(costFn [, ord]) :: (x, y) -> Number
An overloaded variant of compare that takes a cost function to minimize (or any function that you may wish to maximize or minimize).

```js
var cost = (x) => 4*x.a + x.b;

var objs = [ { a: 1, b: 0 }, { a: 0, b: 3 } ]; // first has higher cost
objs.sort($.compareBy(cost));     // [ { a: 0, b: 3 }, { a: 1, b: 0 } ]
objs.sort($.compareBy(cost, +1)); // [ { a: 0, b: 3 }, { a: 1, b: 0 } ]
objs.sort($.compareBy(cost, -1)); // [ { a: 1, b: 0 }, { a: 0, b: 3 } ]
```

The `ord` parameter can be used to optionally reverse the sort. Note that `compareBy` is equivalent to `compare` with the cost function `(x) => +x` (i.e. `valueOf`).

### $.comparing(prop [, ord]) :: (x, y) -> Number
A special case of `compareBy` that compares the values of a property.

```js
// compare index 1
[[1,3], [2,2],[3,4]].sort($.comparing(1)); // [ [2,2], [1,3], [3,4] ]
var users = [{ id: 1, money: 3 }, { id: 2, money: 0 }, { id: 3, money: 3 }];
users.sort($.comparing('money'));
// [ { id: 2, money: 0 }, { id: 1, money: 3 }, { id: 3, money: 3 } ]
```

For anything more advanced than this, you are better of writing a lambda that compares properties pairwise. Due to the nature of `||` in javascript you could actually write the following:

```js
var comparator = (x, y) => (x.money - y.money) || (y.id - x.id);
users.sort(comparator);
// [ { id: 2, money: 0 }, { id: 3, money: 3 }, { id: 1, money: 3 } ]
```

## Set Operations
The meat of the module.

### $.indexOfBy(eq, xs, x) :: Number
A generalized version of `Array.prototype.indexOf` that takes a custom equality test.

```js
$.indexOfBy((x, y) => x.a === y.a, [ { a: 1 }, { a: 2 } ], { a: 1 }); // 0
$.indexOfBy((x, y) => x.a === y.a, [ { a: 1 }, { a: 2 } ], { a: 3 }); // -1
```

### $.intersect(xs, ys) :: zs
The `intersect` function takes the intersection of two arrays.

```js
$.intersect([1,2,3,4], [2,4,6,8]); // [ 2, 4 ]
```

If the first array contains duplicates, so will the result.

```js
$.intersect([1,2,2,3,4], [6,4,4,2]); //  [ 2, 2, 4 ]
```

It is a special case of `intersectBy` with generic equality (`===`) as the equality test.

### $.intersectBy(eq, xs, ys) :: zs
The generalized version of `intersect`.

```js
$.intersectBy((x, y) => x.a === y.a, [{ a: 1 }, { a: 4, b: 0 }], [{ a: 2 }, { a: 4, b: 1 }]);
// [ { a: 4, b: 0 } ]
```

Note that elements from the first array is chosen if an element exists in the other that is equal.

### $.unique(xs) :: ys
The unique function removes duplicate elements from an array. In particular, it keeps only the first occurrence of each element.

```js
$.unique([1,3,2,4,1,2]); // [ 1, 3, 2, 4 ]
```

It is a special case of `uniqueBy`, with generic equality (`===`) as the equality test.

### $.uniqueBy(eq, xs) :: ys
The generalized version of `unique`.

```js
var notCoprime = (x, y) => gcd(x, y) > 1;
var primes = $.uniqueBy(notCoprime, $.range(2, 11)); // [ 2, 3, 5, 7, 11 ]
```

Here the definition of equality is *a and b have common factors*, and later occurances with common factors are excluded.
Note the `range` from [interlude](https://github.com/clux/interlude).

### $.group(xs) :: ys
The group function takes an array and returns an array of arrays such that the flattened result is equal to `xs`.
Moreover, each subarray is constructed by grouping the _consecutive_ equal elements in `xs`. For example,

```js
$.group([1,2,2,3,5,5,2]); // [ [1], [2,2], [3], [5,5], [2] ]
```

In particular, if `xs` is sorted, then the flattened result is sorted.
It is a special case of `groupBy`, with generic equality (`===`) as the equality test.

### $.groupBy(eq, xs) :: ys
The generalized version of `group`.

```js
$.groupBy((x,y) => x.a === y.a, [{ a : 1 }, { a: 4, b: 1 }, { a: 4, b: 0 }, { a: 1 }]);
// [ [ { a: 1 } ],
//   [ { a: 4, b: 1 }, { a: 4, b: 0 } ],
//   [ { a: 1 } ] ]
```

### $.union(xs, ys) :: zs
The union function returns the array union of the two arrays.

```js
$.union([1,3,5], [4,5,6]); // [ 1, 3, 5, 4, 6 ]
```

Duplicates, and elements of the first array, are removed from the the second array,
but if the first array contains duplicates, so will the result.
It is a special case of `unionBy`, with generic equality (`===`) as the equality test.

### $.unionBy(eq, xs, ys) :: zs
The generalized version of `union`.

```js
$.unionBy((x,y) => x.a === y.a, [{ a: 1 }, { a: 3 }], [{ a: 2 }, { a: 3 }]);
// [ { a: 1 }, { a: 3 }, { a: 2 } ]
```

### $.difference(xs, ys) :: zs
Returns the difference between `xs` and `ys`, in set notation: `xs \ ys`.
The first occurrence of each element of `ys` in turn (if any) has been
removed from `xs`. Thus `$.difference(ys.concat(xs), ys)` equals `xs` (in the `deepEqual` sense).

```js
$.difference([1,2,2,3], [2,3,4]); // [ 1, 2 ]
```

It is a special case of `differenceBy`, with generic equality (`===`) as the equality test.

### $.differenceBy(eq, xs, ys) :: zs
The generalized version of `difference`.

```js
$.differenceBy((x,y) => x.a === y.a, [{ a: 1 }, { a: 2 }], [{ a: 2 }, { a: 3 }]);
// [ { a: 1 } ]
```

### $.insert(xs, x) :: xs
The insert function takes an element `x` and an array `xs` and inserts the element into the array at the last position where it is still less than or equal
to the next element. In particular, if the array is sorted before the call, the result will also be sorted.

```js
$.insert([1,2,3,4], 3);
[ 1, 2, 3, 3, 4 ]
```

It is a special case of `insertBy`, with generic numeric ordering as the comparator.

### $.insertBy(cmp, xs, x) :: xs
The generalized version of `insert`.

```js
$.insertBy($.comparing('a'), [{ a: 1 }, { a: 2 }, { a: 3 }], { a: 3, n: 1 });
// [ { a: 1 }, { a: 2 }, { a: 3, n: 1 }, { a: 3 } ]
```

### $.delete(xs, x) :: xs
Removes the *first* occurrence of `x` from its array argument `xs`.

```js
$.delete([1,2,3,2,3], 2); // [ 1, 3, 2, 3 ]
```

It is a special case of `deleteBy`, with generic equality (`===`) as the equality test.

### $.deleteBy(eq, xs, x) :: xs
The generalized version of `delete`.

```js
$.deleteBy((x,y) => x.a === y.a, [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 2 }], { a: 2 });
// [ { a: 1 }, { a: 3 }, { a: 2 } ]
```

#### Warning: delete/insert modifies
To maintain javascript conventions; `delete`, `insert`, `deleteBy`, `insertBy` all modify the passed in array. To return an independent result, pass in a copy instead:

```js
var xs = [1,2,3,4];
$.insert(xs, 2); // [ 1, 2, 2, 3, 4 ]
xs; // [ 1, 2, 2, 3, 4 ]

xs = [1,2,3,4]; // reset
$.insert(xs.slice(), 2); // [ 1, 2, 2, 3, 4 ]
xs; // [ 1, 2, 3, 4 ]
```

Note that `slice` provides a *shallow* copy (objects and arrays inside an array are copied by reference), but this is sufficient for an array of numbers.

#### Warning: delete/difference only removes one per request
The delete functions only remove the first instance.
To delete all, `Array.prototype.filter` is best suited:

```js
var xs = [1,2,2,3,4];
xs.filter((x) => [2,3].indexOf(x) < 0); // [ 1, 4 ]
$.difference(xs, [2,3]); // [ 1, 2, 4 ]

xs.filter((x) => x !== 2); // [ 1, 3, 4 ]
$.delete(xs, 2); // [ 1, 2, 3, 4 ]
```

## Extras
Max/min helpers and generalized versions are provided.
### $.maximum(xs) :: Number
### $.minimum(xs) :: Number
These functions are simple wrapper around `Math.max` and `Math.min`

```js
$.maximum([1,3,2,5]); // 5
$.minimum([]); // Infinity
```

### $.maximumBy(cmp, xs) :: Maximal x
### $.minimumBy(cmp, xs) :: Minimal x
For picking maximal values not based on numeric value, or if you simply want the element containing the maximal value of a property (say), then these functions are appropriate.

```js
var nested = [[1,3,2], [2], [2,3]];
$.maximum(nested.map((x) => x.length)); // 3
$.maximumBy($.comparing('length'), nested); // [ 1, 3, 2 ]
```

Note that unlike `maximum` which returns `-Infinity` in the case of an empty
Array, `maximumBy` has nothing sensible to return since the structure of the type passed in is unknown.

```js
$.minimumBy($.comparing('something'), []); // undefined
```

### $.isSubsetOf(xs, ys) :: Boolean
Checks if `xs` is a subset of `ys`.

```js
$.isSubsetOf([1,2], [1,2,3]); // true
$.isSubsetOf([1,2,3], [1,2]); // false
$.isSubsetOf([1,2,3], [1,2,3]); // true (but not a proper subset)
```

### $.isProperSubsetOf(xs, ys) :: Boolean
Checks if `xs` is a *strict* suset of `ys`.

```js
$.isProperSubsetOf([1,2], [1,2,3]); // true
$.isProperSubsetOf([1,2,3], [1,2]); // false
$.isProperSubsetOf([1,2,3], [1,2,3]); // false
```

#### NB: isSubset functions assume no duplicates
For this reason you will see:

- `[1,2,2]` is counted as a subset of `[1,2]`
- `[1,2]` is not a proper subset of `[1,2,2]`

So think of all arguments to these functions as equivalent to being wrapped in `unique`.
