import { describe, it, expect } from 'vitest'
import VmoOnion from '../use.lib/index'

describe('test', () => {
  it('should throw TypeError if middlewares is not an array', () => {
    expect(() => new VmoOnion('not an array' as any)).toThrow(TypeError)
    expect(() => new VmoOnion('not an array' as any)).toThrow('Middlewares stack must be an array!')
  })
  it('should throw TypeError if middlewares contain non-function elements', () => {
    expect(() => new VmoOnion([1, 2, 3] as any)).toThrow(TypeError)
    expect(() => new VmoOnion([1, 2, 3] as any)).toThrow('Middleware must be composed of functions!')
  })
  it('should initialize with an empty array if no middlewares are provided', () => {
    const vmoOnion = new VmoOnion()
    expect((vmoOnion as any).middlewares).toEqual([])
  })
  it('should add middleware correctly', () => {
    const vmoOnion = new VmoOnion()
    const middleware = () => (context, next) => Promise<void>
    vmoOnion.use(middleware)
    expect((vmoOnion as any).middlewares).toEqual([middleware])
  })
  it('should throw TypeError if middleware to be added is not a function', () => {
    const vmoOnion = new VmoOnion()
    expect(() => vmoOnion.use('not a function' as any)).toThrow(TypeError)
    expect(() => vmoOnion.use('not a function' as any)).toThrow('Middleware must be composed of functions!')
  })

  it('should handle errors in middlewares', async () => {
    const vmoOnion = new VmoOnion()
    const errorMiddleware = () => {
      throw new Error('Middleware error')
    }

    vmoOnion.use(errorMiddleware)

    await expect(vmoOnion.pipingData({})).rejects.toThrow('Middleware error')
  })
  it('should handle next() call multiple times correctly', async () => {
    const vmoOnion = new VmoOnion()
    const middleware = function () {
      return async function (context, next) {
        await next()
        await next()
      }
    }
    vmoOnion.use(middleware as any)
    await expect(vmoOnion.pipingData({})).rejects.toThrow('next() called multiple times')
  })
  it('should handle custom middlewares array in pipingData', async () => {
    const vmoOnion = new VmoOnion()
    const middleware1 = function () {
      return async function (context, next) {
        console.log(context)
        context.counter = 1
        await next()
      }
    }
    const middleware2 = function () {
      return async function (context, next) {
        context.counter++
      }
    }
    const result = await vmoOnion.pipingData({}, [middleware1, middleware2])
    expect(result.counter).toBe(2)
  })
  it('should execute middlewares in order with use setting', async () => {
    const onion = new VmoOnion()
    const mockMiddleware = function () {
      return async function (context, next) {
        return new Promise((resolve, reject) => {
          context.counter = context.counter || 0
          context.counter++
          setTimeout(async () => {
            await next()
            resolve(context)
          }, 100)
        })
      }
    }
    onion.use(mockMiddleware)
    onion.use(mockMiddleware)
    onion.use(mockMiddleware)
    const result = await onion.pipingData({ counter: 0 })
    expect(result.counter).toBe(3)
  })
  it('should execute middlewares in order with init middleware', async () => {
    const mockMiddleware = function () {
      return async function (context, next) {
        return new Promise((resolve, reject) => {
          context.counter = context.counter || 0
          context.counter++
          setTimeout(async () => {
            await next()
            resolve(context)
          }, 100)
        })
      }
    }
    const onion = new VmoOnion([mockMiddleware, mockMiddleware, mockMiddleware])
    const result = await onion.pipingData({ counter: 0 })
    expect(result.counter).toBe(3)
  })
  it('should finally change context index with init setting', async () => {
    const mockMiddleware = function () {
      return async function (context, next) {
        return new Promise((resolve, reject) => {
          context.counter = context.counter || 0
          context.counter++
          setTimeout(async () => {
            context = await next()
            resolve(context)
          }, 100)
        })
      }
    }
    const onion = new VmoOnion([
      mockMiddleware,
      mockMiddleware,
      function () {
        return async function (context, next) {
          return new Promise((resolve, reject) => {
            setTimeout(async () => {
              await next()
              resolve({ counter: 12 })
            }, 100)
          })
        }
      }
    ])
    const result = await onion.pipingData({ counter: 0 })
    expect(result.counter).toBe(12)
  })
  it('should update context index with init setting', async () => {
    const mockMiddleware = function () {
      return async function (context, next) {
        return new Promise((resolve, reject) => {
          context.counter = context.counter || 0
          context.counter++
          setTimeout(async () => {
            context = await next()
            resolve(null)
          }, 100)
        })
      }
    }
    const onion = new VmoOnion([
      mockMiddleware,
      mockMiddleware,
      function () {
        return async function (context, next) {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve({ counter: 12 })
            }, 2000)
          })
        }
      }
    ])
    const result = await onion.pipingData({ counter: 0 })
    expect(result.counter).toBe(2)
  })
})
