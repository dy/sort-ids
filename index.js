export default function sort (arr, ids, precise) {
  if (!arr) return null
  if (ids === false || ids === true) {
    precise = ids
    ids = null
  }

  var l = arr.length

  if (precise == null) precise = Array.isArray(arr) || arr.constructor.BYTES_PER_ELEMENT > 7

  var idMask = Math.min(nextPow2(l) - 1, 0xffffffff)

  var packed = new Float64Array(l)
  var packedInt = new Uint32Array(packed.buffer)

  // pack input to floats
  for (var i = 0, invMask = ~idMask; i < l; i++) {
    packed[i] = arr[i]
    packedInt[i << 1] &= invMask
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

  // check if the sequence is ever-increasing and do final swaps (since there might be missorts)
  if (precise) {
    for (var i = 1; i < ids.length; i++) {
      var left = arr[ids[i]], right = arr[ids[i - 1]]
      if (left < right) {
        var tmp = ids[i]
        ids[i] = ids[i - 1]
        ids[i - 1] = tmp
      }
    }
  }

  return ids
}

// from https://www.npmjs.com/package/next-pow-2: works only with i32 range
function nextPow2 (v) {
  v += v === 0
  --v
  v |= v >>> 1
  v |= v >>> 2
  v |= v >>> 4
  v |= v >>> 8
  v |= v >>> 16
  return v + 1
}
