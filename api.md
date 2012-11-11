# Subset API
Subset export several basic and generalized set operations for JavaScript Arrays.
The generalized versions work best with the additionally supplied generalized equality and comparison functions.


## Generalized Equality
This function is created primarily for the generalized set operations further down.
### $.equality(props..) :: (x, y -> x 'equality on props' y)
This is a special function that creates an equality testing function based on
properties to test on. It will return true if and only if all the properties listed
are the same for both x and y.

```js
var lenEquals = $.equality('length');
lenEquals([1,3,5], [2,4,6]); // true
lenEquals([1,3,5], [2,4]); // false

var steve = {name: 'Steve', money: 30000, status: "Awesome"};
var peter = {name: 'Peter', money: 30000, status: "Depressed"};
var steve2 = {name: 'Clone', money: 30000, status: "Awesome"};
var equallyCool = $.equality('money', 'status');
equallyCool(steve, peter); // false
equallyCool(steve, steve2); // true
```

## Generalized Comparison
These functions help generate
[compare functions](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/sort)
for `Array.prototype.sort`.

### $.compare([ord]) :: (x, y -> x `compare` y)
This creates a function which returns the numeric difference between x and y,
optionally multiplying by minus one if the ord parameter is set to `-1` for
descending order. The default ord parameter `+1` for ascending order may be omitted.

When passed to `Array.prototype.sort`, it will sort the array _numerically_
as opposed to the default ECMA behaviour of turning the elements into strings then
sorting them _lexicographically_. This helps avoid common sorting mistakes:

```js
[1,4,3,2].sort(); // [1,2,3,4] (expected)
[2, 100, 10, 4].sort(); // [10, 100, 2, 4] (wtf!)

[1,4,3,2].sort($.compare()); // [1,2,3,4] (expected)
[2, 100, 10, 4].sort($.compare()); // [2, 4, 10, 100] (expected..)
```

### $.compare(costFn [, ord]) :: (x, y -> cost(x) `compare` cost(y))
An overloaded variant of compare that takes a cost function to minimize (or any function that you may wish to maximize or minimize).

The extra `ord` parameter (similarly) defines what order you want values ordered in:

- `+1` : ascending on cost (x with lowest cost first)
- `-1` : descending on cost (x with highest cost first)

```js
var cost = function (x) {
  return 4*x.a + x.b;
};
var objs = [{a:1, b:0}, {a:0, b:3}]; // first has higher cost
objs.sort($.compare(cost));     // [{a:0, b:3}, {a:1, b:0}]
objs.sort($.compare(cost), +1); // [{a:0, b:3}, {a:1, b:0}]
objs.sort($.compare(cost), +1); // [{a:1, b:0}, {a:0, b:3}]
```


### $.comparing(prop [, ord [, ..]]) :: (x, y -> x 'compare props' y)
This creates a numeric compare function returning the numeric difference between
any (or: the) included property which is not zero.
If all properties are identical, it returns zero.

Pass in the name(s) of a (numeric) property the
elements to be sorted all have, along with the direction of comparison for each
property: `+1` for ascending (default), `-1` for descending.
The default last ord parameter can be omitted, but it is recommended included.
For multiple property sort, the arguments go pairwise: prop1, ord1, prop2, ord2, ...
making the ord parameters are necessary.

```js
[[1,3], [2,2],[3,4]].sort($.comparing(1)); // [ [2,2], [1,3], [3,4] ]

var money = [{id: 1, money: 3}, {id: 2, money: 0}, {id: 3, money: 3}];
// sort by money asc. first, then id desc.
money.sort($.comparing('money', +1, 'id', -1));
// [ { id: 2, money: 0 }, { id: 3, money: 3 }, { id: 1, money: 3 } ]
```

## Operations
In the following section, an argument named *cmp* denotes a comparison function
created by `comparing`, `compare`, or manually.
An argument named *eq* denotes an equality function created by `equality`, manually, or another module like `eq2` from [interlude](https://github.com/clux/interlude).

### $.maximum(xs) :: Number
### $.minimum(xs) :: Number
### $.maximumBy(cmp, xs) :: xs[maxidx]
### $.minimumBy(cmp, xs) :: xs[minidx]

If ordering is not based on a single numeric property, or you want the element
containing this property, then `$.maximumBy` is appropriate: Pass in a comparison
function and it will return the element which compares favorably against all
elements in `xs`.

To simply get the maximum return value of a property,
consider collecting up the values first then applying the faster `maximum` function.
Collecting first is going to be faster, but this implies loosing the association
between the original element.

```js
$.maximum([1,3,2,5]); // 5

var nested = [[1,3,2], [2], [2,3]];
$.maximum($.pluck('length', nested)); // 3
$.maximumBy($.comparing('length'), nested); // [ 1, 3, 2 ]
```

Note that unlike `$.maximum` which returns `-Infinity` in the case of an empty
Array, `$.maximumBy` returns `undefined` as this is the only thing possible
without knowing the structure of the elements in the array.
Similarly for `$.minimum` and `$.minimumBy`.

### $.intersect(xs, ys) :: zs
The 'intersect' function takes the intersection of two arrays.
For example,

```js
$.intersect([1,2,3,4], [2,4,6,8]); // [ 2, 4 ]
```

If the first array contains duplicates, so will the result.

```js
$.intersect([1,2,2,3,4], [6,4,4,2]); //  [ 2, 2, 4 ]
```

It is a special case of 'intersectBy', which allows the programmer to
supply their own equality test.

### $.intersectBy(eq, xs, ys) :: zs
The non-overloaded version of `intersect`.

```js
$.intersectBy($.equality('a'), [{a:1}, {a:4, b:0}], [{a:2}, {a:4, b:1}]);
// [ { a: 4, b: 0 } ]
```

### $.nub(xs) :: ys
The nub function removes duplicate elements from an array.
In particular, it keeps only the first occurrence of each element.
(The name nub means _essence_.) It exploits the extra performance of `Array.prototype.indexOf` but would otherwise have been a special case of `nubBy`, which allows the programmer to supply their own equality test.

```js
$.nub([1,3,2,4,1,2]); // [ 1, 3, 2, 4 ]
```

### $.nubBy(eq, xs) :: ys
The generalized version of `nub`.

```js
var notCoprime = $($.gcd, $.gt(1));
var primes = $.nubBy(notCoprime, $.range(2, 11)); // [ 2, 3, 5, 7, 11 ]
```

Here the definition of equality is *a and b have common factors*.
Note the `range` and `$` functions from [interlude](https://github.com/clux/interlude).

### $.group(xs) :: ys
The group function takes an array and returns an array of arrays such that
the flattened result is equal to `xs`.
Moreover, each subarray is constructed by grouping the _consecutive_ equal elements
in `xs`. For example,

```js
$.group([1,2,2,3,5,5,2]); // [ [1], [2,2], [3], [5,5], [2] ]
```

In particular, if `xs` is sorted, then the result is sorted
when comparing on the first sub element, i.e. `$.comparing(0)`.
It is a special case of groupBy, which allows the programmer to supply
their own equality test.

### $.groupBy(eq, xs) :: ys
The non-overloaded version of `group`.

```js
$.groupBy($.equality('a'), [{a:1}, {a:4, b:1}, {a:4, b:0}, {a:1}]);
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
It is a special case of unionBy, which allows the programmer to supply
their own equality test.

### $.unionBy(eq, xs, ys) :: zs
The non-overloaded version of `union`.

```js
$.unionBy($.equality('a'), [{a:1},{a:3}], [{a:2},{a:3}]);
// [ { a: 1 }, { a: 3 }, { a: 2 } ]
```

### $.difference(xs, ys) :: zs
Returns the difference between xs and ys; xs \ ys.
The first occurrence of each element of ys in turn (if any) has been
removed from xs. Thus `$.difference(ys.concat(xs), ys) equals xs`.

It is a special case of differenceBy, which allows the programmer to supply
their own equality test.

```js
$.difference([1,2,2,3], [2,3,4]); // [ 1, 2 ]
```

### $.differenceBy(eq, xs, ys) :: zs
The non-overloaded version of `difference`.

```js
$.differenceBy($.equality('a'), [{a:1}, {a:2}], [{a:2}, {a:3}]);
// [ { a: 1 } ]
```

### $.insert(xs, x) :: xs
The insert function takes an element and an array and inserts the element
into the array at the last position where it is still less than or equal
to the next element. In particular, if the array is sorted before the call,
the result will also be sorted.

It is a special case of `insertBy`,
which allows the programmer to supply their own comparison function.

```
$.insert([1,2,3,4], 3)
[ 1, 2, 3, 3, 4 ]
```

### $.insertBy(cmp, xs, x) :: xs
The non-overloaded version of `insert`.

```js
$.insertBy($.comparing('a'), [{a:1}, {a:2}, {a:3}], {a:3, n:1})
// [ { a: 1 },
//   { a: 2 },
//   { a: 3, n: 1 },
//   { a: 3 } ]
```

### $.delete(xs, x) :: xs
Removes the first occurrence of `x` from its array argument `xs`.

```js
$.delete([1,2,3,2,3], 2); // [ 1, 3, 2, 3 ]
```

Behaviourally equivalent to the generalized
version `deleteBy` with `$.eq2` as the supplied equality test, but
this special case implementation uses `Array.prototype.indexOf` and is faster.

### $.deleteBy(eq, xs, x) :: xs
The generalized version of `delete`.

```js
$.deleteBy($.equality('a'), [{a:1},{a:2},{a:3},{a:2}], {a:2})
// [ { a: 1 }, { a: 3 }, { a: 2 } ]
```

#### Warning: delete/insert modifies
For efficiency; `delete`, `insert`, `deleteBy`, `insertBy` all modify the
passed in array. To return an independent result, modify a shallow copy instead:

```js
var xs = [1,2,3,4];
$.insert(xs, 2); // [ 1, 2, 2, 3, 4 ]
xs; // [ 1, 2, 2, 3, 4 ]

xs = [1,2,3,4]; // reset
$.insert(xs.slice(), 2); // [ 1, 2, 2, 3, 4 ]
xs; // [ 1, 2, 3, 4 ]
```

#### NB2: delete/difference only removes one per request
The delete functions only remove the first instance.
To delete all, `Array.prototype.filter` is best suited:

```js
var xs = [1,2,2,3,4];
xs.filter($.notElem([2,3])); // [ 1, 4 ]
$.difference(xs, [2,3]); // [ 1, 2, 4 ]

xs.filter($.neq(2)); // [ 1, 3, 4 ]
$.delete(xs, 2); // [ 1, 2, 3, 4 ]
```

Here `notElem`, and `neq` are simple functions from [interlude](https://github.com/clux/interlude).


### $.isSubsetOf(xs, ys [, proper]) :: Boolean
Checks if `xs` is a subset of `ys`, and optionally, if it is a proper subset.

```js
$.isSubsetOf([1,2], [1,2,3]); // true
$.isSubsetOf([1,2,3], [1,2]); // false
$.isSubsetOf([1,2,3], [1,2,3]); // true
$.isSubsetOf([1,2,3], [1,2,3], true); // false (not proper subset)
```

Note that duplicates count as a separate element, so if you want true set behaviour, ensure that everything passed satisfies `x === $.nub(x)` by either calling it explicitly or modelling it well.

```js
$.isSubsetOf([1,2,2], [1,2,3]); // false
$.isSubsetOf([1,2,2], [1,2,2,3]); // true
$.isSubsetOf($.nub([1,2,2]), [1,2,3]); // true
```
