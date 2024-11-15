# VmoOnion 中间件处理库

`VmoOnion` 是一个基于洋葱模型的中间件处理类，用于按顺序执行一系列中间件函数。该库适用于需要逐步处理请求或数据流且每个处理步骤都能控制后续步骤执行的场景。

## 安装

当前库还未发布到 npm 或其他公共仓库，您可以直接克隆或复制此代码到项目中使用。

## 使用方法

### 导入库

确保您的项目支持 ES6 模块语法。您可以使用以下代码导入库：

```javascript
import VmoOnion from './path_to_vmo_onion';
```
### 定义中间件
中间件是一个接收两个参数的函数：上下文对象和一个 next 函数。每个中间件可以选择是否调用 next 来传递控制到下一个中间件。

```javascript
const middleware1 = (context, next) => {
  console.log('Middleware 1 start');
  context.value = 1;
  return next().then(() => {
    console.log('Middleware 1 end');
  });
};

const middleware2 = (context, next) => {
  console.log('Middleware 2 start');
  context.value = 2;
  return next().then(() => {
    console.log('Middleware 2 end');
  });
};
```

##### 注意：中间件函数可以是同步或异步（返回 Promise）。

### 创建 `VmoOnion` 实例

您可以通过一个中间件数组来初始化 `VmoOnion` 实例。
```javascript
const onion = new VmoOnion([middleware1, middleware2]);
```
或者，您可以初始化空实例并在之后通过 use 方法添加中间件：
```javascript
const onion = new VmoOnion();
onion.use(middleware1);
onion.use(middleware2);
```
### 处理数据
使用 `pipingData` 方法来处理数据。该方法接收一个上下文对象和一个可选的中间件数组，并返回一个 `Promise`，该 `Promise` 解析为处理后的上下文对象。
```javascript
const contextData = {value: 0};

onion.pipingData(contextData)
  .then(data => console.log('Final Context:', data))
  .catch(err => console.error('Error:', err));
```

在这个例子中，控制将按以下顺序通过中间件：middleware1 -> middleware2。每个中间件之后会从其后的中间件反向返回。

### 示例

一个处理流程简单的应用可能如下所示：
```javascript
import VmoOnion from './path_to_vmo_onion';

// 创建一个 VmoOnion 实例
const onion = new VmoOnion();

// 定义中间件
const middleware1 = (context, next) => {
  console.log('Middleware 1: first step');
  context.value = 1;
  return next().then(() => {
    console.log('Middleware 1: final step');
  });
};

const middleware2 = (context, next) => {
  console.log('Middleware 2: first step');
  context.value = 2;
  return next();
};

// 使用中间件
onion.use(middleware1);
onion.use(middleware2);

// 定义初始上下文
const initialContext = { value: 0 };

// 执行中间件处理
onion.pipingData(initialContext)
  .then(context => {
    console.log('Processed Context:', context); // { value: 2 }
  })
  .catch(err => {
    console.error('Error:', err);
  });
```
预期输出：
```
Middleware 1: first step
Middleware 2: first step
Middleware 1: final step
Processed Context: { value: 2 }
```

### 异步中间件
中间件还可以是异步的，返回 Promise 以更好地处理异步任务。
```javascript
const asyncMiddleware = (context, next) => {
  console.log('Async Middleware: First step');
  return new Promise((resolve) => {
    setTimeout(() => {
      context.asyncValue = 'Processed after 1 second';
      resolve(next()); // resolve(next()) 调用下一个中间件
    }, 1000);
  }).then(() => {
    console.log('Async Middleware: Final step');
  });
};

// 添加异步中间件
onion.use(asyncMiddleware);

// 使用带有异步中间件的数据
const asyncContext = { value: 0 };

onion.pipingData(asyncContext)
  .then(context => {
    console.log('Async Processed Context:', context);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```
### 错误处理
如果任一中间件抛出异常或返回拒绝的 Promise，该错误将在 pipingData 方法的 catch 处理程序中被捕获。
```javascript
const errorMiddleware = (context, next) => {
  console.log('Error Middleware');
  throw new Error('Something went wrong!');
};

onion.use(errorMiddleware);

onion.pipingData({})
  .then(() => console.log('Process completed successfully.'))
  .catch(error => console.error('Error caught:', error)); // Error caught: Error: Something went wrong!
```
### API
#### 类 VmoOnion
##### 构造函数
- new VmoOnion([middlewares])：创建一个 VmoOnion 实例并可选地初始化中间件数组。
   - middlewares 一个包含中间件函数的数组，按顺序执行。如果未提供，则初始化为空数组。
##### 实例方法
- use(func)：将一个中间件函数添加到中间件栈中。

   - func 中间件函数。
- pipingData(data, [middlewares])：通过中间件栈处理数据上下文。

   - data 上下文对象，会被中间件逐步修改。
   - middlewares 可选，要执行的中间件数组。默认使用实例化时的中间件数组。
##### 私有方法
- checkMiddleWares(middlewares)：检查中间件数组是否合法，即是否为函数的数组。

   - middlewares 中间件数组。
- compose(middlewares)：将中间件数组组合成一个函数，该函数按顺序执行所有中间件。

   -middlewares 中间件数组。
##### 错误处理机制
库确保不会多次调用 `next()` 导致无限递归。当发生这种情况时，库会以错误信息 `next() called multiple times` 拒绝 `Promise`。