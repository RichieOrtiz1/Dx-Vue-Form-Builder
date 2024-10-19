<template>
  <div class="mt-3 mb-2 d-flex">
    <!-- Sortable for the Columns -->
    <DxSortable
        :key="componentUid"
        :group="componentUid"
        class="d-flex flex-wrap gap-2 w-100"
        drop-feedback-mode="indicate"
        item-orientation="horizontal"
        group="formItemGroup"
        @reorder="onReorderColumns"
    >
      <!-- Render columns -->
      <div v-for="(column, index) in columnContainer.columns" :key="generateKey(index)" class="sortable-item col">
        <!-- Sortable for components inside the column -->
        <DxSortable
            :key="`components-${generateKey(index)}`"
            class="d-flex flex-column gap-2 w-100"
            item-orientation="horizontal"
            @reorder="onReorderComponents(index)"
        >
          <ElementWrapper
              v-for="(component, compIndex) in column.childComponents"
              v-if="column.childComponents.length > 0"
              :id="component.uniqueId"
              :key="compIndex"
              v-model:container-elements="column.childComponents"
          />
          <div v-else class="h-100 d-flex justify-content-center align-items-center placeholder-container">
            <p class="text-center" style="max-width: 50%">Drag sections, columns, or controls here to build your
              form
            </p>
          </div>
        </DxSortable>
      </div>
    </DxSortable>
  </div>
</template>

<script lang="ts" setup>
import {defineProps, useId} from 'vue';
import {DxSortable, type DxSortableTypes} from 'devextreme-vue/sortable';
import ElementWrapper from './ElementWrapper.vue';
import {useColumns} from '../../../composables/useColumns';

// Define props with TypeScript types
const {id, colCount} = defineProps<{
  id: string;
  colCount: number;
}>();

// Initialize the component UID
const componentUid = useId();
const generateKey = (index: number) => `col-${componentUid}-${index}`;

// Use the composable to get the column container (with .value to ensure reactivity)
const {columnContainer} = useColumns(id, colCount);

// Handle reorder of entire columns
const onReorderColumns = (e: DxSortableTypes.ReorderEvent) => {
  const movedColumn = columnContainer.value.columns.splice(e.fromIndex, 1)[0];
  columnContainer.value.columns.splice(e.toIndex, 0, movedColumn);

  // Trigger reactivity by updating the reference
  columnContainer.value.columns = [...columnContainer.value.columns];
};

// Handle reorder of components within a specific column
const onReorderComponents = (columnIndex: number) => (e: DxSortableTypes.ReorderEvent) => {
  const movedComponent = columnContainer.value.columns[columnIndex].childComponents.splice(e.fromIndex, 1)[0];
  columnContainer.value.columns[columnIndex].childComponents.splice(e.toIndex, 0, movedComponent);

  // Trigger reactivity by updating the reference
  columnContainer.value.columns[columnIndex].childComponents = [...columnContainer.value.columns[columnIndex].childComponents];
};
</script>

<style scoped>
/* Add any custom styles here */
</style>
