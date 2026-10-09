import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"","description":"","frontmatter":{"layout":"home","markdownStyles":false,"hero":{"name":"VmoOnion","text":"Promise onion middleware","tagline":"Enter in order, unwind in reverse. Organize synchronous and asynchronous steps around one context.","actions":[{"theme":"brand","text":"Get started","link":"/guide/getting-started"},{"theme":"alt","text":"API reference","link":"/api"}]},"features":[{"title":"Control the flow","details":"Continue with next() or return early. Compose synchronous and asynchronous middleware."},{"title":"Isolated context","details":"Clone objects, arrays, Map and Set while preserving cycles and shared references."},{"title":"JavaScript and TypeScript","details":"ESM, CommonJS, UMD and declarations behind a small, compatible public API."}]},"headers":[],"relativePath":"index.md","filePath":"index.md","lastUpdated":1791575927000}');
const _sfc_main = { name: "index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
