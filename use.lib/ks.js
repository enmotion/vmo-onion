/*
 * @Author: enmotion
 * @Date: 2021-03-01 23:02:11
 * @LastEditTime: 2021-04-14 01:37:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \mod-onion\src\index.js
 */
"use strict";
class ModOnion{
    constructor($middleware){
        this.#checkStack($middleware);
        this.middlewares = $middleware||[]
    }
    #checkStack($middleware=[]){
        if (!Array.isArray($middleware)){
            throw new TypeError('Middlewares stack must be an array!')
        } 
        for (const fn of $middleware) {
            if (typeof fn !== 'function'){
                throw new TypeError('Middleware must be composed of functions!')
            } 
        }
    }
    compose($middleware) {
        this.#checkStack($middleware)
        return function(context, next) {
            let index = -1;
            return dispatch(0);
            function dispatch(i) {
                if (i <= index) return Promise.reject(new Error('next() called multiple times'));
                index = i;
                let fn = $middleware[i];       
                
                if (i === $middleware.length) fn = next;        
                if (!fn) return Promise.resolve();
                try {                   
                    return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
                } catch (err) {
                    return Promise.reject(err);
                }
            }
        };        
    }    
    use(func){
        if (typeof func !== 'function'){
            throw new TypeError('Middleware must be composed of functions!');
        } 
        this.middlewares.push(func);
    }
    async pipingData(data,$middleware){
        try{
            await this.compose($middleware||this.middlewares)(data);
            return Promise.resolve(data)
        }catch(err){
            return Promise.reject(err)
        }
    }   
}
export default ModOnion;