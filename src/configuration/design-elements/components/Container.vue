<template>
  <div class="container-fluid">
    <ElementWrapper
        :key="uniqueId"
        v-model:containerElements="container"
        :unique-id="uniqueId"
    />
  </div>
</template>

<script lang="ts" setup>
import {useElementContainer} from '../../../composables/useElementContainer';
import {UniqueIdProp} from '../../../types/builder';
import ElementWrapper from './ElementWrapper.vue';


const props = defineProps<UniqueIdProp>();

const {container} = useElementContainer(props.uniqueId);
</script>

<style scoped>
</style>
