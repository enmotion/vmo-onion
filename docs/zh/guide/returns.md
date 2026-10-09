# 返回值规则

`pipingData()` 使用最外层中间件的返回值。仅当该值是 `null` 或 `undefined` 时，返回加工后的克隆上下文。

| 最外层返回值 | 最终结果 |
| --- | --- |
| `undefined` / `null` | 克隆上下文 |
| `false` / `0` / `''` | 原样返回该值 |
| 对象或其他非空值 | 原样返回该值 |
| 没有中间件 | 克隆上下文 |

## 修改上下文

```ts
import { VmoOnion } from 'vmo-onion'

const onion = new VmoOnion<{ count: number }>([
  async (context, next) => { context.count++; await next() },
  context => { context.count++ }
])
console.log(await onion.pipingData({ count: 0 })) // { count: 2 }
```

## 传递下游结果

`await next()` 等待执行，但不会自动转发下游返回值。要转发，请使用 `return next()` 或 `return await next()`。

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

## 重新赋值与克隆

在中间件里写 `context = anotherObject` 只改变局部变量，不会替换其他中间件的上下文。显式返回新对象并逐层转发结果，才会改变最终返回值。中间件返回的新对象不经过额外克隆。
