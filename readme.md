# sort-ids [![test](https://github.com/dy/sort-ids/actions/workflows/test.yml/badge.svg)](https://github.com/dy/sort-ids/actions/workflows/test.yml)

Sort input array, return sorted ids of the array items, keeping the initial array unchanged.

Useful to perform linked sorting of multiple arrays, where linked array[s] should be sorted the same way as the primary one.

[![npm install sort-ids](https://nodei.co/npm/sort-ids.png?mini=true)](https://npmjs.org/package/sort-ids/)

```js
import sortIds from 'sort-ids'
import reorder from 'array-rearrange'

const rates = [.12, .47, .52, .97, ...sourceNumbers]
const names = ['John', 'Alexa', 'Jimmy', 'Kate', ...linkedItems]

const ids = sortIds(rates)

const sortedRates = reorder(rates, ids)
const sortedNames = reorder(names, ids)
```

## `ids = sortIds(array, ids?, precise=true)`

Calculate ids corresponding to sorted input array. The input array isn't changed. Optionally pass input `ids` - some initial order of ids. `precise` flag makes sure no missorts took place and resolves them, if any. Disabling that can save `~30ms` for `1e6` items input arrays.

See also [array-rearrange](https://ghub.io/array-rearrange) for reordering input array based on a list of ids.

## Motivation

This package is >= 6 times faster compared to sorting function. That is achieved by packing input `value - id` pairs into a single `float64` value and performing native sort on that _Float64Array_, then unpacking the `ids` back.


## Acknowledgement

The idea was proposed by [Robert Monfera](https://github.com/monfera) for [snap-points-2d](https://ghub.io/snap-points-2d) and eventually implemented. But there may be other applications, like [sorting colors](https://twitter.com/winkerVSbecks/status/1063919602038685697) etc.

## License

(c) 2018 Dmitry Iv. MIT License
