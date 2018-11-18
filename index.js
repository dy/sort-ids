'use strict'

var pool = require('typedarray-pool')
var dtype = require('compute-dtype')

module.exports = function sort (arr, ids) {
  var l = arr.length

  var packed = pool.mallocDouble(l)
  var packedInt = new Uint32Array(packed.buffer)

  var type = dtype(arr)
  var min = Infinity, max = -Infinity

  // pack ids → uint32 as first 32 bits of 52-bit float64 fraction
  if (ids) {
    for (var i = 0; i < l; i++) {
      packedInt[i << 1] = ids[i]
    }
  } else {
    for (var i = 0; i < l; i++) {
      packedInt[i << 1] = i
    }
  }

  // low types are packed easily
  if (type === 'uint8' || type === 'uint16') {
    packDirectly()
  }
  else {
    // find limits
    for (var i = 0; i < l; i++) {
      if (min > arr[i]) min = arr[i]
      if (max < arr[i]) max = arr[i]
    }

    if (type === 'uint32' && max < 0x7fefffff) packDirectly()
    else if (min === 0 && max === 1) packScaled()
    else packNormalized()
  }

  // do native sort
  packed = packed.sort()

  // unpack ids back
  if (!ids) ids = new Uint32Array(l)
  for (var i = 0; i < l; i++) {
    ids[i] = packedInt[i << 1]
  }

  pool.freeDouble(packed)

  return ids

  function packDirectly() {
    for (var i = 0; i < l; i++) {
      packedInt[(i << 1) + 1] = arr[i]
    }
  }
  function packScaled() {
    for (var i = 0; i < l; i++) {
      packedInt[(i << 1) + 1] = 0x7fefffff * arr[i]
    }
  }
  function packNormalized() {
    var mult = 0x7fefffff / (max - min)
    for (var i = 0; i < l; i++) {
      packedInt[(i << 1) + 1] = mult * (arr[i] - min)
    }
  }
}

