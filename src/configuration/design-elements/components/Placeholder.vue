<template>
  <div
       class="h-100 d-flex justify-content-center align-items-center placeholder-container"
       :class="{ 'highlight': highlight }">
    <p class="text-center" style="max-width: 50%">Drag sections, columns, or controls here to build your form</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  highlight: Boolean
})
</script>



<style scoped lang="scss">
.placeholder-container {
  padding-top: 30%;
  background-color: whitesmoke;
  transition: background-color 0.2s ease;

  &.highlight {
    background-color: #e8f0fe;
    border-color: #007bff;
  }
}
</style>