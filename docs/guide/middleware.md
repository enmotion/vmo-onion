# Middleware and next()

A middleware is a function receiving `context` and `next`. It does not need to return another middleware function.

## Onion order

```ts
import { VmoOnion } from 'vmo-onion'

const trace: string[] = []
const onion = new VmoOnion<Record<string, any>>([
  async (_, next) => {
    trace.push('A: enter')
    await next()
    trace.push('A: exit')
  },
  async (_, next) => {
    trace.push('B: enter')
    await next()
    trace.push('B: exit')
  }
])
await onion.pipingData({})
console.log(trace) // ['A: enter', 'B: enter', 'B: exit', 'A: exit']
```

At the end of the stack, `next()` resolves to `undefined`. Synchronous middleware is also supported: return a value or use `return next()`.

## Short-circuiting

Skip `next()` to stop downstream middleware. Outer middleware that has already entered still resumes after its `await next()`.

## Error propagation

Always `await next()` or `return next()` to wait for downstream work and propagate errors. Otherwise the pipeline may finish early and downstream rejections may become unhandled.

```ts
import { VmoOnion } from 'vmo-onion'

const onion = new VmoOnion<Record<string, any>>([
  async (context, next) => {
    try { await next() }
    catch (error) { context.error = String(error) }
  },
  () => { throw new Error('processing failed') }
])
const result = await onion.pipingData({ error: '' })
```

A middleware may call `next()` only once per execution. Repeated calls reject with `next() called multiple times`. Synchronous throws and awaited asynchronous rejections propagate through the Promise returned by `pipingData()`.

## Stack snapshots

Each execution uses a snapshot of the composed array. Calling `use()` during execution affects subsequent pipelines. Mutating a supplied override array does not affect the active call. Concurrent calls have independent dispatch state and cloned contexts; shared variables captured by middleware remain the caller’s responsibility.
