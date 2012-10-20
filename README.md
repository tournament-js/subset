# Subset [![Build Status](https://secure.travis-ci.org/clux/subset.png)](http://travis-ci.org/clux/subset)
Subset provides basic and generalized set operations for JavaScript.
They are inspired by a subset of the interface to Haskell's [Data.List](http://www.haskell.org/ghc/docs/latest/html/libraries/base/Data-List.html), but optimized for JavaScript semantics and performance.


## Usage
Attach it to the short variable of choice:

```javascript
var $ = require('subset');
```

and fire up the set engine:

```javascript
$.union([1,3,5], [4,5,6]); // [ 1, 3, 5, 4, 6 ]
$.unionBy($.equality('a'), [{a:1},{a:3}], [{a:2},{a:3}]);
// [ { a: 1 }, { a: 3 }, { a: 2 } ]

$.intersect([1,2,3,4], [2,4,6,8]); // [ 2, 4 ]

$.nub([1,3,2,4,1,2]); // [ 1, 3, 2, 4 ]

$.group([1,2,2,3,5,5,2]); // [ [1], [2,2], [3], [5,5], [2] ]

$.insert([1,2,3,4], 3); // [ 1, 2, 3, 3, 4 ]

$.delete([1,2,3,2,3], 2); // [ 1, 3, 2, 3 ]

var nested = [[1,3,2], [2], [2,3]];
$.maximumBy($.comparing('length'), nested); // [ 1, 3, 2 ]

nested.sort($.comparing('length')); // [ [ 2 ], [ 2, 3 ], [ 1, 3, 2 ] ]

[2, 100, 10, 4].sort(); // [10, 100, 2, 4] <- default lexicographical order
[2, 100, 10, 4].sort($.compare()); // [2, 4, 10, 100] <- sensible numerical order
```

Read the [full API](https://github.com/clux/subset/blob/master/api.md).

Note that it is often useful to get it with the larger utility library:
[interlude](https://github.com/clux/interlude) for which it was made.

## Installation

```bash
$ npm install subset
```

## Running tests
Install development dependencies

```bash
$ npm install
```

Run the tests

```bash
$ npm test
```

## License
MIT-Licensed. See LICENSE file for details.
