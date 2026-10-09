# Return values

`pipingData()` uses the outermost middleware’s return value. Only `null` and `undefined` fall back to the processed, cloned context.

| Outermost return | Final result |
| --- | --- |
| `undefined` / `null` | Cloned context |
| `false` / `0` / `''` | That exact value |
| Object or another non-nullish value | That exact value |
| Empty stack | Cloned context |

## Mutating context

```ts
import { VmoOnion } from 'vmo-onion'

const onion = new VmoOnion<{ count: number }>([
  async (context, next) => { context.count++; await next() },
  context => { context.count++ }
])
console.log(await onion.pipingData({ count: 0 })) // { count: 2 }
```

## Forwarding a downstream result

`await next()` waits for execution but does not automatically forward its result. Use `return next()` or `return await next()` to forward it.

```ts
import { VmoOnion } from 'vmo-onion'

const forward = new VmoOnion<{ count: number }>([
  (_, next) => next(),
  () => ({ replacement: true })
])
console.log(await forward.pipingData({ count: 0 })) // { replacement: true }

const discard = new VmoOnion<{ count: number }>([
  async (_, next) => { await next() },
  () => ({ replacement: true })
])
console.log(await discard.pipingData({ count: 0 })) // { count: 0 }
```

## Reassignment and cloning

Assigning `context = anotherObject` only changes a local variable. It does not replace the context seen by other middleware. Return the new object and forward the result through outer middleware to change the final result. Returned replacement objects are not cloned again.
