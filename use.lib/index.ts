/*
 * @Author: enmotion
 * @Date: 2024-06-13 23:02:11
 * @LastEditTime: 2024-06-13 23:02:11
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \mod-onion\src\index.js
 */
'use strict'
import { clone } from 'ramda'
export type MiddleWare<T extends any> = (
  ...arg: any
) => (context: T, next: Function) => any | Promise<any> | Promise<void>
/**
 * @class VmoOnion
 * @description 实现一个基于洋葱模型的中间件处理类，用于按顺序执行一系列中间件函数。
 */
export default class VmoOnion<T extends any> {
  private middlewares: MiddleWare<T>[]
  private composedMiddleware: Function | null = null
  /**
   * @constructor
   * @param {MiddleWare[]} [middlewares=[]] - 初始中间件数组
   * @description 构造函数，初始化中间件数组，并检查中间件的合法性。
   */
  constructor(middlewares?: MiddleWare<T>[]) {
    this.checkMiddleWares(middlewares ?? [])
    this.middlewares = middlewares?.map(mid => mid) ?? []
  }
  /**
   * @private
   * @method checkMiddleWares
   * @param {MiddleWare[]} middlewares - 中间件数组
   * @throws {TypeError} - 如果 middlewares 不是数组或包含非函数元素，则抛出 TypeError
   * @description 检查传入的中间件数组是否合法，必须是一个数组且所有元素都是函数。
   */
  private checkMiddleWares(middlewares: MiddleWare<T>[]) {
    if (!Array.isArray(middlewares)) {
      throw new TypeError('Middlewares stack must be an array!')
    }

    if (!middlewares.every(fn => typeof fn === 'function')) {
      throw new TypeError('Middleware must be composed of functions!')
    }
  }
  /**
   * @private
   * @method compose
   * @param {MiddleWare[]} middlewares - 中间件数组
   * @returns {(context: Record<string, any>, next: MiddleWare) => any} - 组合后的中间件执行函数
   * @description 组合中间件数组，返回一个函数，该函数接收上下文对象和下一个中间件，并按顺序执行所有中间件。
   */
  private compose(middlewares: MiddleWare<T>[]): Function {
    this.checkMiddleWares(middlewares)
    return function (context: T, next: MiddleWare<T>) {
      let index = -1
      return dispatch(0)
      /**
       * @function dispatch
       * @param {number} i - 当前执行的中间件索引
       * @returns {Promise<any>} - 返回一个 Promise，用于异步处理中间件执行结果
       * @description 递归执行中间件，确保每个中间件只执行一次。
       */
      function dispatch(i: number): any {
        try {
          if (i <= index) return Promise.reject(new Error('next() called multiple times'))
          index = i
          let fn = middlewares[i]?.()
          if (i === middlewares.length) fn = next
          /**
           * 此处 【!fn】是作为代码健壮性考量，当洋葱皮核心层继续 调用 next 时，发现层级index 无法再匹配到任何 next 方法，则会直接返回结果。
           * 避免了核心层误写了 await next() 方法出现的报错，等同自动识别并修正这种错误情况！
           */
          if (!fn) return Promise.resolve()
          return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
        } catch (err) {
          return Promise.reject(err)
        }
      }
    }
  }
  /**
   * @public
   * @method use
   * @param {MiddleWare} func - 需要添加的中间件函数
   * @throws {TypeError} - 如果传入的 func 不是函数，则抛出 TypeError
   * @description 添加一个新的中间件函数到中间件数组中。
   */
  public use(func: MiddleWare<T>) {
    if (typeof func !== 'function') {
      throw new TypeError('Middleware must be composed of functions!')
    }
    this.middlewares.push(func)
    this.composedMiddleware = null // 当添入了新的中间件后，则会清理之前的缓存组合
  }
  /**
   * @public
   * @method pipingData
   * @param {Record<string, any>} data - 传递给中间件的上下文数据
   * @param {MiddleWare[]} [middlewares=this.middlewares] - 可选的中间件数组
   * @returns {Promise<Record<string, any>>} - 返回一个 Promise，包含处理后的数据
   * @description 执行中间件流程，处理传入的上下文数据，并返回处理后的数据。
   */
  public async pipingData(data: Record<string, any>, middlewares?: MiddleWare<T>[]) {
    try {
      const d = clone(data) // 此处深度复制 data 是为了防止数据污染与内存泄漏的可能
      if (!!middlewares) {
        this.checkMiddleWares(middlewares)
        return (await this.compose(middlewares)(d)) ?? d //根据设计目的, 有时中间件类似流水线加工，不会返回具体的数据，而是流式加工数据，那么则需要返回 d
      } else {
        return (await this.getComposedMiddleware()(d)) ?? d //根据设计目的, 有时中间件类似流水线加工，同上
      }
    } catch (err) {
      return Promise.reject(err)
    }
  }
  /**
   * @private
   * @method getComposedMiddleware
   * @returns {Function} 返回的最终组合方法
   */
  private getComposedMiddleware(): Function {
    if (!this.composedMiddleware) {
      this.composedMiddleware = this.compose(this.middlewares)
    }
    return this.composedMiddleware
  }
}
