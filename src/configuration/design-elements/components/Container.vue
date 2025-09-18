<template>
  <div class="design-container p-2 border rounded bg-light"  @mousedown.self="store.setSelected(null)">
    <div v-if="title" class="mb-2 fw-bold">{{ title }}</div>
    <ElementWrapper
        :id="id"
        v-model="container"
        :container-id="id"
        :show-default-placeholder="true"
        css-classes="inner-container"
    />
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import {useBuilderStore} from '../../stores/builder-store';
import ElementWrapper from './ElementWrapper.vue';
import type {FormElement} from '../../../types/builder';

const props = defineProps<{ id: string; title?: string }>();
const store = useBuilderStore();

const container = computed<FormElement[]>({
  get: () => store.fetchChildComponents(props.id),
  set: updated => store.setChildComponents(props.id, updated),
});

</script>

<style scoped>
.design-container {
  min-height: 80px;
}

:deep(.inner-container) {
  min-height: 160px;
}

/* easier to hit when empty */
</style>
