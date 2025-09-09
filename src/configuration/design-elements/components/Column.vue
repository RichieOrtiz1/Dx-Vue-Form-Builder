<template>
  <div class="column p-1">
    <ElementWrapper
        :id="columnContainerId"
        :container-id="columnContainerId"
        v-model="columnChildren"
        :show-default-placeholder="true"
        css-classes="column-drop"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBuilderStore } from '../../stores/builder-store';
import ElementWrapper from './ElementWrapper.vue';
import type { Column, FormElement } from '../../../types/builder';

const props = defineProps<{
  parentId: string;   // uniqueId of the parent (the Columns design element)
  index: number;      // which column
}>();

const store = useBuilderStore();

const columns = computed<Column[]>(() => store.fetchColumns(props.parentId));
const columnChildren = computed<FormElement[]>({
  get: () => columns.value?.[props.index]?.childComponents ?? [],
  set: (updated) => {
    const next = (columns.value ?? []).map((c, i) =>
        i === props.index ? { childComponents: updated } : c
    );
    store.setColumns(props.parentId, next);
  },
});

// stable id for this column wrapper
const columnContainerId = computed(() => `${props.parentId}:col-${props.index}`);
</script>

<style scoped>
.column { min-height: 60px; }
:deep(.column-drop) { min-height: 80px; }
</style>
