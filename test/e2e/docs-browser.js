// Playwright scenario: run against `npm run docs:preview -- --port 4173`.
// Can also be loaded by the connected browser tool via its filename argument.
async (page) => {
  const base = 'http://127.0.0.1:4173'
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`) })
  const paths = ['', 'api', ...['getting-started', 'middleware', 'returns', 'context', 'recipes', 'testing'].map(slug => `guide/${slug}`)]
  await page.setViewportSize({ width: 1440, height: 1000 })
  for (const prefix of ['', 'zh/']) {
    for (const path of paths) {
      const response = await page.goto(`${base}/${prefix}${path}`)
      if (response.status() !== 200) throw Error(`HTTP ${response.status()}: ${prefix}${path}`)
      await page.locator('.VPNavBarTranslations').waitFor()
      if (path && !(await page.locator('h1').innerText()).trim()) throw Error(`Missing heading: ${path}`)
      const expected = prefix ? 'zh-CN' : 'en'
      if (await page.locator('html').getAttribute('lang') !== expected) throw Error(`Wrong language: ${path}`)
    }
  }
  await page.goto(`${base}/zh/guide/getting-started`)
  await page.locator('.VPNavBarTranslations').hover()
  await page.getByRole('link', { name: 'English', exact: true }).click()
  await page.waitForURL(url => url.pathname === '/guide/getting-started')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  const search = page.locator('input[type=search]')
  await search.fill('cloning')
  await page.locator('.VPLocalSearchBox .result').first().waitFor()
  await search.press('Enter')
  await page.waitForURL(url => url.pathname === '/guide/context')
  await page.locator('.VPNavBarTranslations').hover()
  await page.getByRole('link', { name: '简体中文', exact: true }).click()
  await page.waitForURL(url => url.pathname === '/zh/guide/context')
  await page.getByRole('button', { name: '搜索文档', exact: true }).click()
  await search.fill('克隆')
  await page.locator('.VPLocalSearchBox .result').first().waitFor()
  if (!(await page.locator('.VPLocalSearchBox').innerText()).includes('上下文克隆')) throw Error('Missing Chinese search result')
  await page.keyboard.press('Escape')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${base}/zh/guide/getting-started`)
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error('Mobile horizontal overflow')
  if (errors.length) throw Error(errors.join('\n'))
  return 'PASS: 16 pages, language switching in both directions, English/Chinese search, mobile layout, no page errors'
}
