// Run in a browser after importing the ESM bundle or loading the UMD global.
async function verifyBrowser(VmoOnion) {
  const assert = (condition, message) => { if (!condition) throw new Error(message) }
  const trace = []
  const input = { map: new Map([['x', { value: 1 }]]), set: new Set([{ value: 1 }]) }
  const onion = new VmoOnion([
    async (c, next) => { trace.push('enter'); await next(); trace.push('exit') },
    c => { c.map.get('x').value++; [...c.set][0].value++ }
  ])
  const result = await onion.pipingData(input)
  assert(trace.join(',') === 'enter,exit', 'onion order')
  assert(result.map.get('x').value === 2 && input.map.get('x').value === 1, 'Map isolation')
  assert([...result.set][0].value === 2 && [...input.set][0].value === 1, 'Set isolation')
  let release
  const gate = new Promise(resolve => { release = resolve })
  const pipeline = new VmoOnion([async (c, next) => { await gate; await next() }])
  const pending = pipeline.pipingData({ count: 0 })
  pipeline.use(c => { c.count++ })
  release()
  assert((await pending).count === 0, 'active stack snapshot')
  assert((await pipeline.pipingData({ count: 0 })).count === 1, 'subsequent use')
  let rejected = false
  try { await new VmoOnion([async (_, next) => { await next(); await next() }]).pipingData({}) }
  catch (error) { rejected = error.message === 'next() called multiple times' }
  assert(rejected, 'duplicate next rejection')
  return 'PASS: onion order, Map/Set isolation, active stack snapshot, subsequent use, duplicate next'
}
