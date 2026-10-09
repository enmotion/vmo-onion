# 中间件与 next()

中间件本身就是函数，接收 `context` 和 `next`，无需再返回一个中间件函数。

## 洋葱顺序

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

末层的 `next()` 返回解析为 `undefined` 的 Promise。同步中间件也受支持，直接返回值或 `return next()` 即可。

## 提前终止

不调用 `next()`，后续中间件就不会执行。已经进入的外层仍会继续执行 `await next()` 后面的代码。

## 错误传播

必须 `await next()` 或 `return next()` 才能等待下游完成并传播其错误。遗漏等待时，流程可能提前结束，下游拒绝可能成为未处理的 Promise 拒绝。

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

每个中间件在同一次执行中只能调用一次 `next()`。重复调用会拒绝并报错 `next() called multiple times`。同步抛错和已等待的异步拒绝都能通过 `pipingData()` 的 Promise 捕获。

## 执行栈快照

一次执行使用组合时的数组快照。执行期间调用 `use()`，只影响之后开始的流程。传入临时中间件数组后再修改原数组，也不会影响正在进行的调用。并发调用拥有独立的调度状态和克隆上下文；中间件闭包里的共享变量仍由调用方负责。
