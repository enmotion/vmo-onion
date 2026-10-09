# Getting started

VmoOnion organizes step-by-step data processing. The core library does not require Vue or a browser.

## Installation

Ramda is a declared peer dependency. Installing it explicitly also supports package managers that do not install peers automatically.

```sh
npm install vmo-onion ramda@^0.30.0
```

## Your first pipeline

```ts
import { VmoOnion } from 'vmo-onion'

const onion = new VmoOnion<{ value: number }>()
onion
  .use(async (context, next) => {
    context.value += 1
    await next()
    context.value *= 2
  })
  .use(context => { context.value += 2 })

const input = { value: 0 }
const result = await onion.pipingData(input)
console.log(result) // { value: 6 }
console.log(input)  // { value: 0 }
```

## Module formats

Use the named import above for ESM and TypeScript. For CommonJS:

```js
const { VmoOnion } = require('vmo-onion')
const onion = new VmoOnion()
onion.pipingData({ value: 1 }).then(console.log)
```

When loading `dist/vmo-onion.umd.cjs` directly in a browser, access the class through `globalThis['vmo-onion'].VmoOnion`. Serve the file with a JavaScript MIME type. Prefer ESM when using a bundler.

## Next steps

Read [Middleware and next()](./middleware), [Return values](./returns) and the [API](../api).
