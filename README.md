# vmo-onion

`vmo-onion` is a middleware processing class based on the onion model, designed to execute a series of middleware functions in sequence. This library is suitable for scenarios where requests or data streams need to be processed step-by-step, with each processing step controlling the execution of subsequent steps.


## Documentation

Complete bilingual VitePress documentation:

[简体中文](https://enmotion.github.io/vmo-onion/zh/) · [English](https://enmotion.github.io/vmo-onion/)

- [简体中文](docs/zh/index.md) · [快速开始](docs/zh/guide/getting-started.md) · [API](docs/zh/api.md)
- [English](docs/index.md) · [Getting started](docs/guide/getting-started.md) · [API](docs/api.md)

```sh
npm run docs:dev
npm run docs:build
npm run docs:preview
```


## Installation

```
npm i vmo-onion
```

## Usage

### Import the Library

Ensure your project supports ES6 module syntax. You can import the library using the following code:

```javascript
import { VmoOnion } from 'vmo-onion'
```

### Define Middleware

Middleware is a function return a function that takes two parameters: a context object and a next function. Each middleware can choose whether to call next to pass control to the next middleware.

```javascript
const middleware1 = async function (context, next) {
  console.log('Middleware 1 start')
  context.value = 1
  await next()
  context.value = 1
  console.log('Middleware 1 end')
}

const middleware2 = async function (context, next) {
  console.log('Middleware 2 start')
  context.value = 2
  context.value = 2
  console.log('Middleware 2 end')
}
```

##### Note: Middleware functions can be synchronous or asynchronous (returning a Promise).

### Create `vmo-onion` Instance

You can initialize a `vmo-onion` instance with an array of middleware functions.

```javascript
const onion = new VmoOnion([middleware1, middleware2])
```

Alternatively, you can initialize an empty instance and add middleware using the use method:

```javascript
const onion = new VmoOnion()
onion.use(middleware1)
onion.use(middleware2)
```

### Process Data

Use the `pipingData` method to process data. This method takes a context object and an optional array of middleware functions, and returns a `Promise` that resolves to the processed context object.

```javascript
const contextData = { value: 0 }

onion
  .pipingData(contextData)
  .then(data => console.log('Final Context:', data))
  .catch(err => console.error('Error:', err))
```

In this example, control will flow through the middleware in the following order: middleware1 -> middleware2. Each middleware will return from its subsequent middleware in reverse order.

### Example

A simple application of the processing flow might look like this:

```typescript
import { VmoOnion } from 'vmo-onion'
import type { MiddleWare } from 'vmo-onion'

// create an instance of VmoOnion
const onion = new VmoOnion<{ value: number }>()

// 定义中间件
const middleware1: MiddleWare<{ value: number }> = async function (context, next) {
  console.log('Middleware 1: first step')
  context.value += 1
  await next()
  console.log('Middleware 1: final step')
}

const middleware2: MiddleWare<{ value: number }> = async function (context, next) {
  console.log('Middleware 2: first step')
  context.value += 1
  console.log('Middleware 2: final step')
}

// use middleware
onion.use(middleware1)
onion.use(middleware2)

// init context
const initialContext = { value: 0 }

onion
  .pipingData(initialContext)
  .then(context => {
    console.log('Processed Context:', context) // { value: 2 }
  })
  .catch(err => {
    console.error('Error:', err)
  })
```

Expected output:

```
Middleware 1: first step
Middleware 2: first step
Middleware 2: final step
Middleware 1: final step
Processed Context: { value: 2 }
```

### Error Handling

If any middleware throws an exception or returns a rejected `Promise`, the error will be caught in the `catch` handler of the `pipingData` method.

```javascript
const errorMiddleware = (context, next) => {
  console.log('Error Middleware')
  throw new Error('Something went wrong!')
}

onion.use(errorMiddleware)

onion
  .pipingData({})
  .then(() => console.log('Process completed successfully.'))
  .catch(error => console.error('Error caught:', error)) // Error caught: Error: Something went wrong!
```

### API

#### Class VmoOnion

##### Constructor

- new VmoOnion([middlewares]): Creates a VmoOnion instance and optionally initializes an array of middleware functions.
  - middlewares: An array of middleware functions to be executed in sequence. If not provided, it initializes as an empty array.
- Also, you can define the Context type with TS by following the steps below

```typescript
import { VmoOnion } from 'vmo-onion'
import type { MiddleWare } from 'vmo-onion'

const onion = new VmoOnion<{ name: string; age: number }>([])
// From now on, the middleware must accept parameters with the Context type as {name: string, age: number}
// or
const sampleMiddleWare: MiddleWare<{ name: string; age: number }> = (context, next) => {
  //.....
}
```

##### Instance Methods

- use(func): Adds a middleware function to the middleware stack.

  - func: The middleware function.

- pipingData(data, [middlewares]): Processes the context object through the middleware stack.

  - data: The context object to be modified step-by-step by the middleware.
  - middlewares: Optional, an array of middleware functions to be executed. Defaults to the middleware array initialized in the instance.

##### Private Methods

- checkMiddleWares(middlewares): Checks if the middleware array is valid, i.e., whether it is an array of functions.

  - middlewares: The middleware array.

- compose(middlewares): Composes the middleware array into a single function that executes all middleware in sequence.

  -middlewares: The middleware array.

##### Error Handling Mechanism

The library ensures that `next()` is not called multiple times, preventing infinite recursion. When this occurs, the library rejects the `Promise` with the error message `next() called multiple times`.


## Compatibility and verification

The public API and return semantics are unchanged: `use()` is chainable, an optional
middleware array replaces the instance stack for that call, and the outermost
middleware result is returned unless it is `null` or `undefined`, in which case the
cloned context is returned. Use `return next()` to forward a downstream result.
Always await or return `next()` to propagate asynchronous completion and errors.

Each composed stack is a snapshot. Middleware added during an active execution
applies to subsequent executions. Sparse middleware arrays are rejected.
Context cloning preserves object prototypes, cycles and shared references and
isolates Map keys/values and Set entries. The existing root `clone()` hook remains
supported. Functions and unsupported opaque values (such as Promise and WeakMap)
retain their existing reference behavior; cloning is not a memory-leak guarantee.

- `npm run coverage`: all core source files must reach 100% statements, branches,
  functions and lines.
- `npm run test:e2e`: build, pack, install into a temporary consumer, execute ESM
  and CommonJS scenarios, compile TypeScript consumers in NodeNext and Bundler
  modes, and check the UMD global in an isolated JavaScript context.
- `npm run check`: run coverage and package end-to-end verification.
- Real browser verification: after building, run `npm run dev` and open
  `/test/e2e/browser.html`. Both ESM and UMD run the same regression scenario;
  the page reports PASS or FAIL. This browser check is separate from the Node
  package test.
