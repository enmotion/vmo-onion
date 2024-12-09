# vmo-onion

`vmo-onion` is a middleware processing class based on the onion model, designed to execute a series of middleware functions in sequence. This library is suitable for scenarios where requests or data streams need to be processed step-by-step, with each processing step controlling the execution of subsequent steps.

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
const middleware1 = function () {
  return async function (context, next) {
    console.log('Middleware 1 start')
    context.value = 1
    await next()
    context.value = 1
    console.log('Middleware 1 end')
  }
}

const middleware2 = function () {
  return async function (context, next) {
    console.log('Middleware 2 start')
    context.value = 2
    context.value = 2
    console.log('Middleware 2 end')
  }
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
const middleware1: MiddleWare<{ value: number }> = function () {
  return async function (context, next) {
    console.log('Middleware 1: first step')
    context.value += 1
    await next()
    console.log('Middleware 1: final step')
  }
}

const middleware2: MiddleWare<{ value: number }> = function () {
  return async function (context, next) {
    console.log('Middleware 2: first step')
    context.value += 1
    console.log('Middleware 2: final step')
  }
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

<!-- ### 异步中间件

中间件还可以是异步的，返回 Promise 以更好地处理异步任务。

```javascript
const asyncMiddleware = (context, next) => {
  console.log('Async Middleware: First step')
  return new Promise(resolve => {
    setTimeout(() => {
      context.asyncValue = 'Processed after 1 second'
      resolve(next()) // resolve(next()) 调用下一个中间件
    }, 1000)
  }).then(() => {
    console.log('Async Middleware: Final step')
  })
}

// 添加异步中间件
onion.use(asyncMiddleware)

// 使用带有异步中间件的数据
const asyncContext = { value: 0 }

onion
  .pipingData(asyncContext)
  .then(context => {
    console.log('Async Processed Context:', context)
  })
  .catch(error => {
    console.error('Error:', error)
  })
``` -->

### Error Handling

If any middleware throws an exception or returns a rejected `Promise`, the error will be caught in the `catch` handler of the `pipingData` method.

```javascript
const errorMiddleware = function () {
  return (context, next) => {
    console.log('Error Middleware')
    throw new Error('Something went wrong!')
  }
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
