# 快速开始

VmoOnion 用于组织逐步处理数据的流程。核心库不要求使用 Vue 或浏览器。

## 安装

Ramda 是当前包声明的 peer dependency；显式安装可兼容不会自动安装 peer 的包管理器。

```sh
npm install vmo-onion ramda@^0.30.0
```

## 第一个流程

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

## 模块格式

ESM 和 TypeScript 使用上面的具名导入。CommonJS 使用：

```js
const { VmoOnion } = require('vmo-onion')
const onion = new VmoOnion()
onion.pipingData({ value: 1 }).then(console.log)
```

浏览器直接加载 UMD 产物 `dist/vmo-onion.umd.cjs` 后，通过 `globalThis['vmo-onion'].VmoOnion` 访问类；静态服务器应以 JavaScript MIME 类型提供该文件。使用打包工具时优先采用 ESM。

## 下一步

阅读[中间件与 next()](./middleware)、[返回值规则](./returns)和 [API](../api)。
