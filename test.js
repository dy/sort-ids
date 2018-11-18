'use strict'

var t = require('tape')
var sort = require('./')
var range = require('array-range')
var rearrange = require('array-rearrange')
var now = require('performance-now')

var N = 100000


t('sort arr input', t => {
	var arr = [0x0, 0xf, 0xff, 0xfff, 0xffff, 0xfffff, 0xffffff, 0xfffffff, 0xffffffff]
	t.deepEqual(unpack(sort(arr), arr), new Float64Array(arr).sort(), 'checkpoints')

	var arr = new Array(N)
	for (var i = 0; i < arr.length; i++) {
		arr[i] = Math.random() * 0xffffffff
	}
	t.deepEqual(unpack(sort(arr), arr), new Float64Array(arr).sort())

	t.end()
})
t('sort uint32 input low', t => {
	var arr = new Uint32Array(N)
	for (var i = 0; i < arr.length; i++) {
		arr[i] = Math.random() * 0x7fefffff
	}

	t.deepEqual(unpack(sort(arr), arr), new Float64Array(arr).sort())

	t.end()
})
t('sort uint32 input full', t => {
	var arr = new Uint32Array([0x0, 0xf, 0xff, 0xfff, 0xffff, 0xfffff, 0xffffff, 0xfffffff, 0xffffffff])
	t.deepEqual(unpack(sort(arr), arr), new Float64Array(arr).sort(), 'checkpoints')

	var arr = new Uint32Array([ 3459521841, 2545901525 ])
	t.deepEqual(unpack(sort(arr), arr), new Float64Array(arr).sort(), 'checkpoints')

	var arr = new Uint32Array(N)
	for (var i = 0; i < arr.length; i++) {
		arr[i] = Math.random() * 0xffffffff
	}

	t.deepEqual(unpack(sort(arr), arr), new Float64Array(arr).sort())

	t.end()
})
t('sort uint16 input', t => {
	var arr = new Uint16Array(N)
	for (var i = 0; i < arr.length; i++) {
		arr[i] = Math.random() * 0xffff
	}

	t.deepEqual(unpack(sort(arr), arr), new Float64Array(arr).sort())
	t.end()
})
t('sort uint8 input', t => {
	var arr = new Uint8Array(N)
	for (var i = 0; i < arr.length; i++) {
		arr[i] = Math.random() * 0xff
	}

	t.deepEqual(unpack(sort(arr), arr), new Float64Array(arr).sort())
	t.end()
})
t('sort float64 input', t => {
	var arr = new Float64Array(N)
	for (var i = 0; i < arr.length; i++) {
		arr[i] = Math.random() * Number.MAX_VALUE
	}

	t.deepEqual(unpack(sort(arr), arr), new Float64Array(arr).sort())
	t.end()
})
t('sort float32 input', t => {
	var arr = new Float32Array(N)
	for (var i = 0; i < arr.length; i++) {
		arr[i] = Math.random() * 3.4028234663852886e+38
	}

	t.deepEqual(unpack(sort(arr), arr), new Float64Array(arr).sort())
	t.end()
})

t('sort uint32 input with ids', t => {
	var arr = new Uint32Array(N)
	for (var i = 0; i < arr.length; i++) {
		arr[i] = Math.random() * 0x7fefffff
	}

	var ids = range(N)

	t.deepEqual(unpack(sort(arr, ids), arr), new Float64Array(arr).sort())

	t.end()
})


function unpack(ids, arr) {
	var narr = arr.slice()
	for (var i = 0; i < ids.length; i++) {
		narr[i] = arr[ids[i]]
	}

	return narr
}



t.skip('bench', t => {
	var N = 1e6
	var arr = new Float64Array(N)
	for (var i = 0; i < arr.length; i++) {
		arr[i] = Math.random() * Number.MAX_VALUE
	}

	// baseline
	var z = arr.slice()
	var zTime = now()
	z.sort()
	zTime = now() - zTime

	// sort with function
	var a = arr.slice()
	var aTime = now()
	a.sort((a, b) => a - b)
	aTime = now() - aTime

	// sort by ids (readme)
	var b = arr.slice()
	var bTime = now()
	var ids = sort(b)
	bTime = now() - bTime

	// rearrange (adds to the time)
	var iTime = now()
	rearrange(b, ids)
	iTime = now() - iTime

	console.log(aTime,  bTime)
	t.ok(aTime > bTime)

	t.end()
})
