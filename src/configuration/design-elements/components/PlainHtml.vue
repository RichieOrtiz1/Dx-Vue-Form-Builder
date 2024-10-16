<template>
    <div v-html="value"></div>
</template>

<script setup>

defineProps({
    value: {
        type: String,
        default: '<p> Html Item </p>'
    }
})

</script>
