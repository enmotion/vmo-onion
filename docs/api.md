# API reference

The public named exports are the `VmoOnion` class and the `MiddleWare` type. Their spelling matches the existing API.

## MiddleWare

The current declaration intentionally retains permissive types for compatibility:

```ts
export type MiddleWare<T extends any> =
  (context: T, next: Function) => any | Promise<any> | Promise<void>
```

`context` is typed as `T`. Call `next()` without arguments; it returns a Promise of the downstream result. `Function` and `any` do not enforce strict result typing.

## new VmoOnion

```ts
constructor(middlewares?: MiddleWare<T>[])
```

Defaults to an empty stack and copies a supplied array. Non-arrays, non-function entries and array holes throw `TypeError`.

## use

```ts
use(func: MiddleWare<T>): this
```

Appends middleware and returns the same instance for chaining. A non-function throws `TypeError`. Active executions are unaffected by additions.

## pipingData

```ts
pipingData(
  data: Record<string, any>,
  middlewares?: MiddleWare<T>[]
): Promise<any>
```

Clones the input, then executes the stack. The second argument **replaces** the instance stack for this call. An empty array runs no middleware and does not change the instance. Validation and cloning failures reject the returned Promise.

The input remains `Record<string, any>` and the result remains `Promise<any>`. The instance generic therefore does not strictly validate `pipingData()` input or result. Callers should keep their input consistent with `T`. See [Return values](./guide/returns) and [Context cloning](./guide/context).

## Errors

| Condition | Error |
| --- | --- |
| Stack is not an array | `TypeError: Middlewares stack must be an array!` |
| Entry is not a function or is a hole | `TypeError: Middleware must be composed of functions!` |
| Repeated next() | `Error: next() called multiple times` |
| Middleware or clone() throws | Original error propagates |

`checkMiddleWares`, `compose` and `getComposedMiddleware` are internal implementation details, not public API.
