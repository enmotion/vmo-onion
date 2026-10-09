import { describe, it, expect } from 'vitest'
import { VmoOnion } from '../index'
import { cloneContext } from '../use.lib/clone-context'

describe('public behavior and regression coverage', () => {
  it('runs the onion in both directions and isolates nested input', async () => {
    const trace: string[] = []
    const input = { nested: { count: 0 } }
    const onion = new VmoOnion([
      async (c, next) => { trace.push('a+'); await next(); trace.push('a-') },
      async (c, next) => { trace.push('b+'); c.nested.count++; await next(); trace.push('b-') }
    ])
    expect(await onion.pipingData(input)).toEqual({ nested: { count: 1 } })
    expect(input.nested.count).toBe(0)
    expect(trace).toEqual(['a+', 'b+', 'b-', 'a-'])
  })
  it('supports empty stacks, early termination and existing return semantics', async () => {
    expect(await new VmoOnion().pipingData({ x: 1 })).toEqual({ x: 1 })
    const onion = new VmoOnion([() => false, () => { throw Error('unreachable') }])
    expect(await onion.pipingData({})).toBe(false)
    for (const result of [null, undefined, 0, '', { replacement: true }]) {
      const pipeline = new VmoOnion([() => result])
      expect(await pipeline.pipingData({ x: 1 })).toEqual(result ?? { x: 1 })
    }
    expect(await new VmoOnion([async (_, next) => { await next() }, () => 42]).pipingData({ x: 1 })).toEqual({ x: 1 })
    expect(await new VmoOnion([(_, next) => next(), () => 42]).pipingData({})).toBe(42)
  })
  it('rejects invalid override stacks and holes', async () => {
    const onion = new VmoOnion()
    await expect(onion.pipingData({}, 'invalid' as any)).rejects.toThrow(TypeError)
    await expect(onion.pipingData({}, [null] as any)).rejects.toThrow(TypeError)
    expect(() => new VmoOnion(new Array(2))).toThrow(TypeError)
    await expect(onion.pipingData({}, new Array(2))).rejects.toThrow(TypeError)
  })
  it('keeps active executions stable while allowing later use and overrides', async () => {
    let release!: () => void
    const gate = new Promise<void>(resolve => { release = resolve })
    const onion = new VmoOnion([async (c, next) => { await gate; await next() }])
    const active = onion.pipingData({ count: 0 })
    onion.use(c => { c.count++ })
    release()
    expect(await active).toEqual({ count: 0 })
    expect(await onion.pipingData({ count: 0 })).toEqual({ count: 1 })
    expect(await onion.pipingData({ count: 0 })).toEqual({ count: 1 })
    expect(await onion.pipingData({ count: 0 }, [])).toEqual({ count: 0 })
    const stack = [async (c: any, next: Function) => { await gate; await next() }]
    const custom = onion.pipingData({ count: 0 }, stack)
    stack.push(async c => { c.count++ })
    expect(await custom).toEqual({ count: 0 })
  })
  it('isolates concurrent dispatch and propagates asynchronous rejection', async () => {
    const onion = new VmoOnion([async (c, next) => { await Promise.resolve(); c.count++; await next() }])
    expect(await Promise.all([onion.pipingData({ count: 0 }), onion.pipingData({ count: 10 })])).toEqual([{ count: 1 }, { count: 11 }])
    await expect(new VmoOnion([async () => { throw Error('async failure') }]).pipingData({})).rejects.toThrow('async failure')
  })
})

describe('context cloning compatibility', () => {
  it('clones Map and Set including keys, cycles and shared references', async () => {
    const item = { value: 1 }
    const input: any = { item, map: new Map([[item, item]]), set: new Set([item]) }
    input.self = input
    input.map.set(input, input.map)
    input.set.add(input.set)
    const result = await new VmoOnion([c => { c.item.value++ }]).pipingData(input)
    expect(item.value).toBe(1)
    expect(result.self).toBe(result)
    expect(result.map.get(result.item)).toBe(result.item)
    expect(result.map.get(result)).toBe(result.map)
    expect(result.set.has(result.item)).toBe(true)
    expect(result.set.has(result.set)).toBe(true)
  })
  it('preserves primitive values, functions, prototypes, arrays and clone hooks', () => {
    class Context { value = 1; method() { return this.value } }
    const fn = () => 1
    const input = { instance: new Context(), array: [null, undefined, fn, 1], hooked: { clone: () => ({ copied: true }) } }
    const result = cloneContext(input)
    expect(result.instance).toBeInstanceOf(Context)
    expect(result.instance).not.toBe(input.instance)
    expect(result.instance.method()).toBe(1)
    expect(result.array).toEqual(input.array)
    expect(result.array).not.toBe(input.array)
    expect(result.array[2]).toBe(fn)
    expect(result.hooked.clone).toBe(input.hooked.clone)
    expect(cloneContext(input.hooked)).toEqual({ copied: true })
  })
  it('preserves existing Date, RegExp and typed-array behavior', () => {
    const date = new Date(123)
    const input = { date, sameDate: date, regex: /abc/gi, bytes: new Uint8Array([1, 2]) }
    const result = cloneContext(input)
    expect(result).toEqual(input)
    expect(result.date).not.toBe(date)
    expect(result.sameDate).toBe(result.date)
    expect(result.regex).not.toBe(input.regex)
    result.bytes[0] = 9
    expect(input.bytes[0]).toBe(1)
  })
  it('propagates failures from the existing custom clone hook', async () => {
    await expect(new VmoOnion().pipingData({ clone() { throw Error('clone failure') } })).rejects.toThrow('clone failure')
  })
})
