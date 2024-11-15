<script setup lang="ts">
import VmoOnion from '@lib';
const onion = new VmoOnion();
onion.use(function(){
  // console.log('1')
  return async function(context,next){
    context.count = context.count || 0;
    console.log(JSON.stringify(context));
    await next();
    context.count = 0;
    console.log(JSON.stringify(context));
  }
});
onion.use(function(){
  // console.log('2')
  return async (context,next)=>{
    context.count = context.count+1;
     console.log(JSON.stringify(context));
    await next();
    console.log(JSON.stringify(context));
    context.count = context.count-1;
  }
})
onion.use(function(){
  // console.log('3')
  return async (context,next)=>{
    context.count = context.count+1;
     console.log(JSON.stringify(context));
    await next();
     console.log(JSON.stringify(context));
    context.count = context.count-1;
  }
})
onion.use(function(){
  // console.log('4')
  return async (context,next)=>{
    return new Promise((resolve)=>{
      setTimeout(async ()=>{
        context.count = context.count+1;
        console.log(JSON.stringify(context));
        await next();
        console.log(JSON.stringify(context));
        context.count = context.count-1;
        resolve(context)
      },2000)
    })
  }
});
onion.use(function(){
  // console.log('4')
  return async (context)=>{
    return new Promise((resolve)=>{
      setTimeout(async ()=>{
        context.name = 'mod'
        resolve(context)
      },2000)
    })
  }
});
onion.pipingData({count:0}).then(res=>{
  console.log(res)
})
</script>

<template>
  <!-- <div class="flex flex-col flex-grow items-center justify-center">
    <vmo-button perfix="ssee">aaaa</vmo-button>
  </div> -->
</template>

<style>
html,body{
    height: 100%;
    display: flex;
    flex-grow: 1;
}
</style>
