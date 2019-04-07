# sort-ids [![unstable](https://img.shields.io/badge/stability-unstable-green.svg)](http://github.com/badges/stability-badges) [![Build Status](https://travis-ci.org/dy/sort-ids.svg?branch=master)](https://travis-ci.org/dy/sort-ids)

Sort input array, return sorted ids of the array items, keeping the initial array unchanged.

Useful to perform linked sorting of multiple arrays, where linked array[s] should be sorted the same way as the primary one.

[![npm install sort-ids](https://nodei.co/npm/sort-ids.png?mini=true)](https://npmjs.org/package/sort-ids/)

```js
var sortIds = require('sort-ids')
var reorder = require('array-rearrange')

var rates = [.12, .47, .52, .97, ...sourceNumbers]
var names = ['John', 'Alexa', 'Jimmy', 'Kate', ...linkedItems]

var ids = sortIds(rates)

var sortedRates = reorder(a, ids)
var sortedNames = reorder(b, ids)
```

## `ids = sortIds(array, ids?, precise=true)`

Calculate ids corresponding to sorted input array. Optionally pass input `ids` array. `precise` flag makes sure no missorts took place and resolves them, if any. Disabling that can save `~30ms` for `1e6` items input arrays.

See also [array-rearrange](https://ghub.io/array-rearrange) for reordering input array based on a list of ids.

## Motivation

This package is >= 6 times faster compared to sorting function. That is achieved by packing input `value - id` pairs into a single `float64` value and performing native sort on that _Float64Array_, then unpacking the `ids` back.


## Acknowledgement

The idea was proposed by [Robert Monfera](https://github.com/monfera) for [snap-points-2d](https://ghub.io/snap-points-2d) and eventually implemented. But there may be other applications, like [sorting colors](https://twitter.com/winkerVSbecks/status/1063919602038685697) etc.

## License

(c) 2018 Dmitry Yv. MIT License
