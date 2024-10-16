<template>
    <h3 :style="style"> {{ value }} </h3>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
    value: {
            type: String,
            default: 'Sub Heading'
        },
        color: {
            type: String
        },
})

const style = computed(() => `color:${props.color}`)
</script>

<style lang="scss" scoped></style>