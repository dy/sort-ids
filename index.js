'use strict'

var pool = require('typedarray-pool')
var dtype = require('compute-dtype')
var nextPow2 = require('next-pow-2')

module.exports = function sort (arr, ids) {
  var l = arr.length
  var idMask = Math.min(nextPow2(l) - 1, 0xffffffff)
  var idBits = idMask.toString(2).length

  // we use free bits from ids part to store values as well
  var freeBits = 32 - idBits

  // 2 → 0b11, 3 → 0b111 ...
  var freeMask = freeBits == 31 ? 0x7fffffff : ((1 << freeBits) - 1)

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

  if (!ids) ids = new Uint32Array(l)

  // low types are packed easily
  if (type === 'uint8' || type === 'uint16') {
    packDirectly()
  }
  // if input length allows for packing unnormalized
  else if (type === 'uint32' && freeBits >= 3) {
    packShifted()
  }
  else {
    // find limits
    for (var i = 0; i < l; i++) {
      if (min > arr[i]) min = arr[i]
      if (max < arr[i]) max = arr[i]
    }

    // we can pack up until infinity
    if (type === 'uint32' && max < 0x7ff00000) packDirectly()
    else packNormalized()
  }

  // do native sort
  packed = packed.sort()

  for (var i = 0; i < l; i++) {
    ids[i] = packedInt[i << 1] & idMask
  }

  pool.freeDouble(packed)

  return ids

  function packDirectly() {
    for (var i = 0; i < l; i++) {
      // we use only hi part
      packedInt[(i << 1) + 1] = arr[i]
    }
  }
  function packShifted() {
    for (var i = 0; i < l; i++) {
      var v = arr[i]

      // write part of value to free bits of low part
      packedInt[i << 1] |= (v & freeMask) << idBits

      // write rest to hi part
      packedInt[(i << 1) + 1] = v >>> freeBits
    }
  }
  function packNormalized() {
    var range = max - min
    for (var i = 0; i < l; i++) {
      // replace insignificant part with id
      var v = (arr[i] - min) / range
      var id = packedInt[i << 1]
      packed[i] = v
      packedInt[i << 1] &= ~idMask
      packedInt[i << 1] |= id
    }
  }
}

