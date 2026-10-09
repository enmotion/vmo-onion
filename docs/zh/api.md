# API 参考

公开导出为具名类 `VmoOnion` 与类型 `MiddleWare`，拼写与现有版本一致。

## MiddleWare

当前声明保留宽松类型以保持兼容：

```ts
export type MiddleWare<T extends any> =
  (context: T, next: Function) => any | Promise<any> | Promise<void>
```

`context` 类型来自 `T`。`next()` 不需要参数，返回下游结果的 Promise。`Function` 与返回值 `any` 不提供严格的结果检查。

## new VmoOnion

```ts
constructor(middlewares?: MiddleWare<T>[])
```

默认使用空数组；复制传入数组。非数组、非函数元素及数组空位抛出 `TypeError`。

## use

```ts
use(func: MiddleWare<T>): this
```

追加中间件，返回当前实例以支持链式调用。非函数抛出 `TypeError`。执行中的流程不受追加影响。

## pipingData

```ts
pipingData(
  data: Record<string, any>,
  middlewares?: MiddleWare<T>[]
): Promise<any>
```

先克隆输入，再执行流程。第二参数会为本次调用**替换**实例中间件栈；`[]` 表示本次不执行任何中间件，不会改变实例。参数校验与克隆错误通过 Promise 拒绝传播。

输入仍声明为 `Record<string, any>`，结果仍为 `Promise<any>`，因此实例泛型不会严格检查 `pipingData()` 的输入或结果。调用方应维护输入与 `T` 的一致性。详见[返回值规则](./guide/returns)和[上下文克隆](./guide/context)。

## 错误信息

| 条件 | 错误 |
| --- | --- |
| 中间件栈不是数组 | `TypeError: Middlewares stack must be an array!` |
| 中间件不是函数或包含空位 | `TypeError: Middleware must be composed of functions!` |
| 重复调用 next() | `Error: next() called multiple times` |
| 中间件或 clone() 抛错 | 传播原始错误 |

`checkMiddleWares`、`compose`、`getComposedMiddleware` 是内部实现，不属于公开 API。
