# Subset
[![npm status](http://img.shields.io/npm/v/subset.svg)](https://www.npmjs.org/package/subset)
[![build status](https://secure.travis-ci.org/clux/subset.svg)](http://travis-ci.org/clux/subset)
[![dependency status](https://david-dm.org/clux/subset.svg)](https://david-dm.org/clux/subset)
[![coverage status](http://img.shields.io/coveralls/clux/subset.svg)](https://coveralls.io/r/clux/subset)

Subset provides basic and generalized set operations for JavaScript.
They are inspired by a subset of the interface to Haskell's [Data.List](https://hackage.haskell.org/package/base/docs/Data-List.html), but optimized for JavaScript semantics.

The new ES6 `Set` class is not particularly helpful for doing set operations on general objects (as their only version of equality is `===`), and this module provides a general alternative for people who want to do the same-ish things on arrays.

## Usage
Use it with qualified imports with the yet unfinished module `import` syntax or attach it to the short variable of choice. For selling points, here's how it will look with ES7 modules.

```js
import { equality, union, unionBy, intersect, unique, uniqueBy, insert, delete, group } from 'autonomy'

intersect([1,2,3,4], [2,4,6,8]); // [ 2, 4 ]

union([1,3,5], [4,5,6]); // [ 1, 3, 5, 4, 6 ]
unionBy(equality('a'), [{ a: 1 }, { a: 3 }], [{ a: 2 }, { a: 3 }]);
// [ { a: 1 }, { a: 3 }, { a: 2 } ]

unique([1,3,2,4,1,2]); // [ 1, 3, 2, 4 ]

var notCoprime = (x, y) => gcd(x, y) > 1;
var primes = uniqueBy(notCoprime, range(2, 11)); // [ 2, 3, 5, 7, 11 ]

group([1,2,2,3,5,5,2]); // [ [1], [2,2], [3], [5,5], [2] ]

insert([1,2,3,4], 3); // [ 1, 2, 3, 3, 4 ]

delete([1,2,3,2,3], 2); // [ 1, 3, 2, 3 ]
```

Read the [full API](https://github.com/clux/subset/blob/master/api.md).

Note that it is often useful to get it with the larger utility library [interlude](https://github.com/clux/interlude) for which it was made.

## License
MIT-Licensed. See LICENSE file for details.
