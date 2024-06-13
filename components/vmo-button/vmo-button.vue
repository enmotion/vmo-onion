<template>
  <div class="button">
    {{ perfix }}-<slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { ButtonParams } from './types';

export default defineComponent({
  props: {
    params:{
      type: Object as PropType<ButtonParams>,
      default:()=>({})
    },
    perfix: {
      type: String as PropType<string>,
      default: 'skekr'
    }
  }
})
</script>

<style scoped>
.button {
  @apply p-[10px] flex flex-row bg-red-700 rounded-[10px] border-[2px] text-white cursor-pointer hover:bg-blue-300 transition-all duration-300
}
</style>