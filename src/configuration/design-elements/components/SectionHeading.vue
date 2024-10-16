<template>
    <h2 :style="style"> {{ value }} </h2>
</template>

<script setup>

import { computed } from 'vue'
const props = defineProps({
    value: {
            type: String,
            default: 'Section Heading'
        },
        color: {
            type: String
        },
})

const style = computed(() => `color:${props.color}`)
</script>

<style lang="scss" scoped></style>