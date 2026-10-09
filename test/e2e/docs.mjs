import { readdirSync, readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'

const root = resolve('.')
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? (entry.name.startsWith('.') ? [] : walk(join(dir, entry.name))) : [join(dir, entry.name)])
const pages = walk(join(root, 'docs')).filter(file => file.endsWith('.md'))
const english = pages.filter(file => !file.includes('/zh/')).map(file => file.slice(join(root, 'docs').length + 1)).sort()
const chinese = pages.filter(file => file.includes('/zh/')).map(file => file.slice(join(root, 'docs/zh').length + 1)).sort()
assert.deepEqual(chinese, english, 'Every page must have both language versions')
const dir = mkdtempSync(join(root, '.docs-examples-'))
try {
  const files = []
  for (const page of pages) {
    for (const match of readFileSync(page, 'utf8').matchAll(/```ts\n([\s\S]*?)\n```/g)) {
      const code = match[1]
      // API declaration blocks describe signatures, rather than executable examples.
      if (!code.includes("from 'vmo-onion'")) continue
      const imports = code.split('\n').filter(line => line.startsWith('import ')).join('\n')
      const body = code.split('\n').filter(line => !line.startsWith('import ')).join('\n')
      const file = join(dir, `example-${files.length}.ts`)
      writeFileSync(file, `${imports}\nasync function example() {\n${body}\n}\nvoid example;\n`)
      files.push(file)
    }
  }
  execFileSync(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '--strict', '--noEmit', '--target', 'ES2020', '--module', 'ESNext', '--moduleResolution', 'Bundler', '--skipLibCheck', ...files], { stdio: 'inherit' })
  console.log(`PASS: ${pages.length} bilingual pages; ${files.length} TypeScript examples`)
} finally {
  rmSync(dir, { recursive: true, force: true })
}
