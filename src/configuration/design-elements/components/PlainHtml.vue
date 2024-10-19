<template>
    <div v-html="value"></div>
</template>

<script setup lang="ts">

defineProps({
    value: {
        type: String,
        default: '<p> Html Item </p>'
    }
})

</script>
