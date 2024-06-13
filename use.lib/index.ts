/*
 * @Author: enmotion
 * @Date: 2024-06-13 23:02:11
 * @LastEditTime: 2024-06-13 23:02:11
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \mod-onion\src\index.js
 */
"use strict";
export type MiddleWare =(...arg:any)=>(context:Record<string,any>,next:Function)=>any;

export default class VmoOnion{
  private middlewares:MiddleWare[];
  constructor(middlewares?:MiddleWare[]){
    this.checkMiddleWares(middlewares||[]);
    this.middlewares = middlewares||[]
  };
  private checkMiddleWares(middlewares:MiddleWare[]){
    if (!Array.isArray(middlewares)){
      throw new TypeError('Middlewares stack must be an array!')
    } 
    for (const fn of middlewares) {
      if (typeof fn !== 'function'){
        throw new TypeError('Middleware must be composed of functions!')
      } 
    }
  };
  private compose(middlewares:MiddleWare[]):Function {
    console.log(middlewares)
    this.checkMiddleWares(middlewares)
    return function(context:Record<string,any>, next:MiddleWare) {
      let index = -1;
      return dispatch(0);
      function dispatch(i:number):any {       
        if (i <= index) return Promise.reject(new Error('next() called multiple times'));
        index = i;
        let fn = middlewares[i]();
        if (i === middlewares.length) fn = next;        
        if (!fn) return Promise.resolve();
        try {
          // console.log(fn,i,i+1)
          return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
        }catch (err) {
          return Promise.reject(err);
        }
      }
    };        
  };
  public use(func:MiddleWare){
    if (typeof func !== 'function'){
      throw new TypeError('Middleware must be composed of functions!');
    } 
    this.middlewares.push(func);
  };
  public async pipingData(data:Record<string,any>,middlewares?:MiddleWare[]){
    try{
      await this.compose(middlewares||this.middlewares)(data);
      return Promise.resolve(data)
    }catch(err){
      return Promise.reject(err)
  }
  };
}