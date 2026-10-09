# Recipes

## Validation and transformation

Throw on invalid input. Downstream middleware only runs after validation succeeds.

```ts
import { VmoOnion, type MiddleWare } from 'vmo-onion'

type Context = { name: string; greeting?: string }
const validate: MiddleWare<Context> = (context, next) => {
  context.name = context.name.trim()
  if (!context.name) throw new Error('name is required')
  return next()
}
const onion = new VmoOnion<Context>([validate])
  .use(context => { context.greeting = `Hello, ${context.name}` })
console.log(await onion.pipingData({ name: ' Alice ' }))
// { name: 'Alice', greeting: 'Hello, Alice' }
```

## Override a pipeline for one call

```ts
import { VmoOnion } from 'vmo-onion'

const onion = new VmoOnion<{ count: number }>()
  .use(context => { context.count++ })
console.log(await onion.pipingData({ count: 0 }, [
  context => { context.count += 10 }
])) // { count: 10 }
console.log(await onion.pipingData({ count: 0 })) // { count: 1 }
```

## Async work and finally

`finally` runs even if downstream work fails. The caller catches the original rejection.

```ts
import { VmoOnion } from 'vmo-onion'

const onion = new VmoOnion<{ id: number; label?: string }>([
  async (_, next) => {
    const start = Date.now()
    try { await next() }
    finally { console.log('elapsed ms:', Date.now() - start) }
  },
  async context => {
    context.label = await Promise.resolve(`item-${context.id}`)
  }
])
try {
  console.log(await onion.pipingData({ id: 7 })) // { id: 7, label: 'item-7' }
} catch (error) {
  console.error(error)
}
```

There is no built-in retry, cancellation, timeout or middleware removal API. Retrying by calling the same `next()` twice is rejected. Retry an independent task or a separate `pipingData()` call instead.
