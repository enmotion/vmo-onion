import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import assert from 'node:assert/strict'
import vm from 'node:vm'

const root = resolve('.')
const dir = mkdtempSync(join(tmpdir(), 'vmo-onion-e2e-'))
const npm = (args, cwd = root) => execFileSync('npm', [...args, '--cache', join(dir, 'cache')], { cwd, encoding: 'utf8' })
try {
  const [pack] = JSON.parse(npm(['pack', '--ignore-scripts', '--json', '--pack-destination', dir]))
  assert(pack.files.some(file => file.path === 'dist/index.d.ts'))
  writeFileSync(join(dir, 'package.json'), '{"private":true,"type":"module"}')
  npm(['install', join(dir, pack.filename), '--offline', '--ignore-scripts', '--legacy-peer-deps', '--no-audit', '--no-fund'], dir)
  const scenario = `
    const input = { count: 0, map: new Map([['x', { value: 1 }]]) };
    const trace = [];
    const onion = new VmoOnion([
      async (c, next) => { trace.push('enter'); await next(); trace.push('exit'); },
      c => { c.count++; c.map.get('x').value++; }
    ]);
    const result = await onion.pipingData(input);
    assert.deepEqual(trace, ['enter', 'exit']);
    assert.equal(result.count, 1);
    assert.equal(input.count, 0);
    assert.equal(input.map.get('x').value, 1);
    assert.equal(result.map.get('x').value, 2);
    await assert.rejects(new VmoOnion([async (_, next) => { await next(); await next(); }]).pipingData({}), /multiple times/);
    assert.equal(await new VmoOnion([() => 42]).pipingData({}), 42);
    assert.deepEqual(await onion.pipingData({ count: 3 }, []), { count: 3 });
  `
  writeFileSync(join(dir, 'consumer.mjs'), `import assert from 'node:assert/strict';\nimport { VmoOnion } from 'vmo-onion';\n${scenario}`)
  writeFileSync(join(dir, 'consumer.cjs'), `const assert = require('node:assert/strict');\nconst { VmoOnion } = require('vmo-onion');\n(async () => {${scenario}})().catch(e => { console.error(e); process.exitCode = 1 });`)
  for (const file of ['consumer.mjs', 'consumer.cjs']) {
    execFileSync(process.execPath, [file], { cwd: dir, stdio: 'inherit' })
    console.log(`PASS installed package: ${file}`)
  }
  writeFileSync(join(dir, 'consumer.mts'), `import { VmoOnion, type MiddleWare } from 'vmo-onion';
    const middleware: MiddleWare<{ count: number }> = async (context, next) => { context.count++; await next(); };
    const onion = new VmoOnion<{ count: number }>([middleware]);
    onion.use(middleware).pipingData({ count: 0 }).then(value => value.count);
  `)
  for (const mode of ['NodeNext', 'Bundler']) {
    execFileSync(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '--strict', '--noEmit', '--target', 'ES2020', '--module', mode === 'NodeNext' ? 'NodeNext' : 'ESNext', '--moduleResolution', mode, 'consumer.mts'], { cwd: dir, stdio: 'inherit' })
    console.log(`PASS installed declarations: ${mode}`)
  }
  const sandbox = vm.createContext({ console })
  vm.runInContext(readFileSync(join(dir, 'node_modules/vmo-onion/dist/vmo-onion.umd.cjs'), 'utf8'), sandbox)
  await vm.runInContext(`(async () => {
    const { VmoOnion } = globalThis['vmo-onion'];
    const result = await new VmoOnion([c => { c.count++ }]).pipingData({ count: 1 });
    if (result.count !== 2) throw Error('UMD global failed');
  })()`, sandbox)
  console.log('PASS UMD browser global (isolated JavaScript context)')
} finally {
  rmSync(dir, { recursive: true, force: true })
}
