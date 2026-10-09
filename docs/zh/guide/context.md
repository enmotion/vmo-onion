# 上下文克隆

每次 `pipingData()` 在调用中间件前克隆输入。同一次执行的中间件共享该克隆对象。

## 支持范围

| 数据类型 | 行为 |
| --- | --- |
| 普通对象、类实例 | 复制自有可枚举字符串键，保留原型 |
| 数组 | 克隆元素，保留长度和空位 |
| Map | 递归克隆键和值 |
| Set | 递归克隆成员 |
| Date、RegExp、类型化数组 | 沿用 Ramda 的克隆行为 |
| 基本类型、函数 | 保留值或函数引用 |
| Promise、WeakMap 等不支持的对象 | 保留原有引用行为 |

普通对象、数组、Map、Set 构成的图保留循环与共享引用。克隆不复制符号键或不可枚举属性，也不保证类的私有字段或外部资源可用。对象属性描述符不保留；读取可枚举 getter 会执行 getter。

```ts
import { VmoOnion } from 'vmo-onion'

const item = { value: 1 }
const input = { item, map: new Map([['item', item]]) }
const result = await new VmoOnion<typeof input>([
  context => { context.map.get('item')!.value++ }
]).pipingData(input)
console.log(input.item.value) // 1
console.log(result.item.value) // 2
console.log(result.map.get('item') === result.item) // true
```

## 自定义 clone() 钩子

为保持兼容，输入根对象存在 `clone()` 方法时，库使用其返回值。该钩子负责自己的复制策略和引用隔离；抛错会使 `pipingData()` 拒绝。嵌套普通对象的 `clone()` 方法作为普通函数属性复制，不自动调用。

## 边界与成本

没有公开的克隆配置选项。函数闭包、不支持的对象及自定义钩子仍可能共享状态。大量数据的深拷贝会消耗时间和内存；这不是内存泄漏防护机制。将上下文控制在流程实际需要的数据范围内。
