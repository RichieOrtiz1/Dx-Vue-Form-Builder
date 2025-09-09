<template>
  <div class="design-container p-2 border rounded bg-light">
    <div v-if="title" class="mb-2 fw-bold">{{ title }}</div>

    <ElementWrapper
        :id="id"
        :container-id="id"
        v-model="container"
        :show-default-placeholder="true"
        css-classes="inner-container"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBuilderStore } from '../../stores/builder-store';
import ElementWrapper from './ElementWrapper.vue';
import type { FormElement } from '../../../types/builder';

const props = defineProps<{
  id: string;                   // uniqueId of THIS container element
  title?: string;
}>();

const store = useBuilderStore();

const container = computed<FormElement[]>({
  get: () => store.fetchChildComponents(props.id),
  set: (updated) => store.setChildComponents(props.id, updated),
});
</script>

<style scoped>
.design-container { min-height: 80px; }
:deep(.inner-container) { min-height: 120px; }
</style>
