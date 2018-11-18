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

  // pack input to floats
  for (var i = 0; i < l; i++) {
    var id = packedInt[i << 1]
    packed[i] = arr[i]
    packedInt[i << 1] &= ~idMask
  }

  // write id as insignificant part of fraction (more input length, more precision loss)
  if (ids) {
    for (var i = 0; i < l; i++) {
      packedInt[i << 1] |= ids[i]
    }
  } else {
    for (var i = 0; i < l; i++) {
      packedInt[i << 1] |= i
    }
  }

  if (!ids) ids = new Uint32Array(l)

  // do native sort
  packed = packed.sort()

  for (var i = 0; i < l; i++) {
    ids[i] = packedInt[i << 1] & idMask
  }

  pool.freeDouble(packed)

  return ids
}

