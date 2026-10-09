import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"","description":"","frontmatter":{"layout":"home","markdownStyles":false,"hero":{"name":"VmoOnion","text":"Promise 洋葱中间件","tagline":"顺序进入，逆序返回。用一个上下文组织同步和异步处理流程。","actions":[{"theme":"brand","text":"快速开始","link":"/zh/guide/getting-started"},{"theme":"alt","text":"API 参考","link":"/zh/api"}]},"features":[{"title":"可控的执行流程","details":"使用 next() 继续处理，或提前返回。支持同步函数和异步中间件。"},{"title":"上下文隔离","details":"克隆普通对象、数组、Map 和 Set，并保留循环与共享引用结构。"},{"title":"兼容 JavaScript 与 TypeScript","details":"提供 ESM、CommonJS、UMD 与类型声明，保持简洁的公开 API。"}]},"headers":[],"relativePath":"zh/index.md","filePath":"zh/index.md","lastUpdated":1791575927000}');
const _sfc_main = { name: "zh/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("zh/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
