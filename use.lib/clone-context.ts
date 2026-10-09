import { clone } from 'ramda'

/** Preserve the existing clone hook and prototypes, while isolating Map/Set graphs. */
export function cloneContext<T>(value: T, seen = new Map<object, unknown>()): T {
  if (value === null || typeof value !== 'object') return value
  if (seen.has(value)) return seen.get(value) as T
  if (seen.size === 0 && typeof (value as any).clone === 'function') return clone(value)

  let result: any
  if (value instanceof Map) {
    result = new Map()
    seen.set(value, result)
    value.forEach((item, key) => result.set(cloneContext(key, seen), cloneContext(item, seen)))
  } else if (value instanceof Set) {
    result = new Set()
    seen.set(value, result)
    value.forEach(item => result.add(cloneContext(item, seen)))
  } else if (Object.prototype.toString.call(value) === '[object Object]' || Array.isArray(value)) {
    result = Array.isArray(value) ? new Array(value.length) : Object.create(Object.getPrototypeOf(value))
    seen.set(value, result)
    Object.keys(value).forEach(key => {
      Object.defineProperty(result, key, {
        value: cloneContext((value as any)[key], seen),
        enumerable: true, configurable: true, writable: true
      })
    })
  } else {
    result = clone(value)
    seen.set(value, result)
  }
  return result
}
