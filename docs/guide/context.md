# Context cloning

Each `pipingData()` call clones its input before invoking middleware. Middleware in that call shares the cloned context.

## Supported values

| Type | Behavior |
| --- | --- |
| Objects and class instances | Copy own enumerable string keys, preserve prototype |
| Arrays | Clone elements, preserve length and holes |
| Map | Recursively clone keys and values |
| Set | Recursively clone members |
| Date, RegExp, typed arrays | Retain Ramda cloning behavior |
| Primitives and functions | Preserve value or function reference |
| Unsupported objects such as Promise and WeakMap | Retain existing reference behavior |

Graphs of objects, arrays, Map and Set preserve cycles and shared references. Symbol keys and non-enumerable properties are not copied. Class private fields and external resources are not guaranteed to remain usable. Property descriptors are not preserved; reading enumerable getters invokes them.

```ts
import { VmoOnion } from 'vmo-onion'

const item = { value: 1 }
const input = { item, map: new Map([['item', item]]) }
const result = await new VmoOnion<typeof input>([
  context => { context.map.get('item')!.value++ }
]).pipingData(input)
console.log(input.item.value) // 1
console.log(result.item.value) // 2
console.log(result.map.get('item') === result.item) // true
```

## Custom clone() hook

For compatibility, a `clone()` method on the root input supplies the clone result. That hook owns its copying and isolation policy. If it throws, `pipingData()` rejects. A nested ordinary object’s `clone()` method is copied as a function property rather than invoked.

## Boundaries and cost

There is no public cloning configuration option. Function closures, unsupported objects and custom hooks may still share state. Deep copying large inputs costs time and memory; it is not a memory-leak prevention mechanism. Keep context limited to data needed by the pipeline.
