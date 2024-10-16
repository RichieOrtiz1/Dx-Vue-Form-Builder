<template>
    <h1 :style="style"> {{ value }} </h1>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
    value: {
            type: String,
            default: 'Main Heading'
        },
        color: {
            type: String
        },
})

const style = computed(() => `color:${props.color}`)

</script>

<style lang="scss" scoped>

</style>