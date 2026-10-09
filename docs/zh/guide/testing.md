# 测试与贡献

## 本地准备

```sh
npm ci
npm run test:run
npm run coverage
npm run test:e2e
npm run docs:check
```

## 检查范围

| 命令 | 验证内容 |
| --- | --- |
| `npm run test:run` | 单元与兼容性回归测试 |
| `npm run coverage` | 入口和全部核心源码，逐文件四项覆盖率门槛均为 100% |
| `npm run test:e2e` | 构建、打包、临时安装、ESM/CJS 使用、NodeNext/Bundler 类型检查、隔离 JS 环境的 UMD 全局入口 |
| `npm run check` | 覆盖率与包级 E2E |
| `npm run docs:check` | 构建核心库，校验双语页面对应关系和 TypeScript 示例，再构建文档 |
| `npm run docs:build` | 中英文文档静态构建及死链检查 |

覆盖率不代表已经验证所有可能的输入组合。包级测试离线安装本次生成的包，使用 `--legacy-peer-deps`；它验证打包产物，不验证自动安装 peer dependency 的行为。

## 真实浏览器回归

运行以下命令，然后打开 `http://localhost:1980/test/e2e/browser.html`：

```sh
npm run build
npm run dev
```

页面对 ESM 和 UMD 执行同一组场景：洋葱顺序、Map/Set 隔离、运行栈快照、后续 use() 和重复 next()。两项应均显示 PASS，根元素的 `data-status` 为 `passed`。此浏览器检查与 Node 包级测试分开执行。

## 文档开发与部署

```sh
npm run docs:dev
npm run docs:build
npm run docs:preview
```

构建结果在 `docs/.vitepress/dist`。部署到子路径时，通过环境变量设置 base，并在相同 base 下预览：

```sh
DOCS_BASE=/vmo-onion/ npm run docs:build
DOCS_BASE=/vmo-onion/ npm run docs:preview
```

中英文页面结构保持一致；新功能、行为变化和示例必须同步更新两个语言版本。提交前运行测试与文档构建，保留公开 API 兼容性。发布包前 `prepack` 自动构建核心库，文档不随 npm 包发布。

VitePress 配置参考[官方多语言文档](https://vuejs.github.io/vitepress/v1/guide/i18n)。

浏览器文档回归脚本位于 `test/e2e/docs-browser.js`，可由连接的 Playwright 工具加载；验证 16 页、双向语言切换、双语搜索、移动端溢出及浏览器错误。该检查不包含在 `docs:check` 中。
