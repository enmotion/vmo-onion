# 实用示例

## 校验与加工

校验不通过时抛错；只有通过校验才进入下一层。

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

## 临时替换流程

```ts
import { VmoOnion } from 'vmo-onion'

const onion = new VmoOnion<{ count: number }>()
  .use(context => { context.count++ })
console.log(await onion.pipingData({ count: 0 }, [
  context => { context.count += 10 }
])) // { count: 10 }
console.log(await onion.pipingData({ count: 0 })) // { count: 1 }
```

## 异步任务与 finally

下游失败时，`finally` 仍会执行；外部捕获原始拒绝。

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

库没有内置重试、取消、超时或中间件移除 API。同一中间件重复调用 `next()` 做重试会被拒绝；需要重试时，应重试独立任务或另一次 `pipingData()` 调用。
