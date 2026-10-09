import { defineConfig } from 'vitepress'

const pages = [
  ['Getting started', '快速开始', 'getting-started'],
  ['Middleware and next()', '中间件与 next()', 'middleware'],
  ['Return values', '返回值规则', 'returns'],
  ['Context cloning', '上下文克隆', 'context'],
  ['Recipes', '实用示例', 'recipes'],
  ['Testing and contributing', '测试与贡献', 'testing']
] as const

export default defineConfig({
  title: 'VmoOnion',
  description: 'Promise-based onion middleware for JavaScript and TypeScript',
  base: process.env.DOCS_BASE || '/',
  cleanUrls: true,
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: `${process.env.DOCS_BASE || '/'}favicon.svg` }]],
  lastUpdated: true,
  locales: {
    root: {
      label: 'English', lang: 'en',
      themeConfig: {
        nav: [{ text: 'Guide', link: '/guide/getting-started' }, { text: 'API', link: '/api' }],
        sidebar: [{ text: 'Guide', items: pages.map(([text, , slug]) => ({ text, link: `/guide/${slug}` })) }, { text: 'Reference', items: [{ text: 'API', link: '/api' }] }],
        footer: { message: 'Released under the MIT License.' }
      }
    },
    zh: {
      label: '简体中文', lang: 'zh-CN', description: '适用于 JavaScript 与 TypeScript 的 Promise 洋葱中间件库',
      themeConfig: {
        nav: [{ text: '指南', link: '/zh/guide/getting-started' }, { text: 'API', link: '/zh/api' }],
        sidebar: [{ text: '指南', items: pages.map(([, text, slug]) => ({ text, link: `/zh/guide/${slug}` })) }, { text: '参考', items: [{ text: 'API', link: '/zh/api' }] }],
        outline: { label: '本页目录' }, docFooter: { prev: '上一页', next: '下一页' },
        lastUpdated: { text: '最后更新' }, langMenuLabel: '语言', returnToTopLabel: '返回顶部', sidebarMenuLabel: '菜单', darkModeSwitchLabel: '主题',
        footer: { message: '基于 MIT 许可证发布。' }
      }
    }
  },
  themeConfig: {
    outline: [2, 3],
    search: { provider: 'local', options: { locales: { zh: { translations: { button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' }, modal: { noResultsText: '未找到结果', resetButtonTitle: '清除搜索', footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' } } } } } } }
  }
})
