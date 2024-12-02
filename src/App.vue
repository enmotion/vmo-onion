<script setup lang="ts">
import VmoOnion from '@lib'
import md5 from 'md5'
const onion = new VmoOnion<Record<string, any>>()
onion.use(function () {
  // console.log('1')
  return async function (context, next) {
    context.count = context.count || 0
    console.log(JSON.stringify(context))
    context = await next()
    console.log(JSON.stringify(context))
    return context
  }
})
onion.use(function () {
  // console.log('2')
  return async (context, next) => {
    context.count = context.count + 1
    console.log(JSON.stringify(context))
    context = await next()
    console.log(JSON.stringify(context))
    context.count = context.count - 1
    return context
  }
})
onion.use(function () {
  // console.log('3')
  return async (context, next) => {
    context.count = context.count + 1
    console.log(JSON.stringify(context))
    context = await next()
    console.log(JSON.stringify(context))
    context.count = context.count - 1
    return context
  }
})
onion.use(function () {
  // console.log('4')
  return async (context, next) => {
    return new Promise(resolve => {
      setTimeout(async () => {
        context.count = context.count + 1
        console.log(JSON.stringify(context))
        context = await next()
        console.log(context, 'context')
        console.log(JSON.stringify(context))
        context.count = context.count - 1
        resolve(context)
      }, 200)
    })
  }
})
const queue: {
  [key: string]: {
    promises: { resolve: Function; reject: Function }[]
    data: any | null
    status: 'padding' | 'fullfilled'
    expired?: number
  }
} = {}
onion.use(function () {
  // console.log('4')
  return async context => {
    const hash = md5(JSON.stringify(context))
    if (queue[hash] && (!queue[hash].expired || Date.now() < queue[hash].expired)) {
      if (queue[hash].status == 'fullfilled') {
        context.response = queue[hash].data
        return {
          count: 0,
          response: queue[hash].data
        }
      } else {
        console.warn('length:', queue[hash].promises.length)
        return new Promise((resolve, reject) => {
          queue[hash].promises.push({
            resolve,
            reject
          })
        })
      }
    } else {
      queue[hash] = {
        promises: [],
        data: null,
        status: 'padding'
      }
      return new Promise((resolve, reject) => {
        queue[hash].promises.push({
          resolve,
          reject
        })
        setTimeout(async () => {
          queue[hash].data = { test: context.count }
          queue[hash].status = 'fullfilled'
          queue[hash].expired = Date.now() + (queue[hash].expired ?? 1000)
          console.error('add prop data be {test:1}', hash)
          queue[hash].promises.forEach(item => {
            item.resolve({
              ...context,
              response: queue[hash].data
            })
          })
        }, 200)
      })
    }
  }
})
onion.pipingData({ count: 0 }).then(res => {
  console.log(res, '1')
})
onion.pipingData({ count: 1 }).then(res => {
  console.log(res, '2')
})
onion.pipingData({ count: 0 }).then(res => {
  console.log(res, '3')
})
onion.pipingData({ count: 0 }).then(res => {
  console.log(res, '4')
})
onion.pipingData({ count: 0 }).then(res => {
  console.log(res, '5')
})
setTimeout(() => {
  onion.pipingData({ count: 0 }).then(res => {
    console.log(res, '6')
  })
}, 1000)
setTimeout(() => {
  onion.pipingData({ count: 0 }).then(res => {
    console.log(res, '7')
  })
}, 2000)
</script>

<template>
  <!-- <div class="flex flex-col flex-grow items-center justify-center">
    <vmo-button perfix="ssee">aaaa</vmo-button>
  </div> -->
</template>

<style>
html,
body {
  height: 100%;
  display: flex;
  flex-grow: 1;
}
</style>
