<template>
  <div class="container">
    <ElementWrapper
        :key="componentUid"
        :id="id"
        v-model:container-elements="container.elements"
    />
  </div>
</template>

<script setup lang="ts">
import {defineProps, useId} from 'vue';
import ElementWrapper from './ElementWrapper.vue';
import {useElementContainer} from '../../../composables/useElementContainer';

const componentUid = useId();


const {id} = defineProps({
  id: {
    required: true,
    type: String
  }
});

const {container} = useElementContainer(id);

</script>

<style scoped lang="scss">

</style>