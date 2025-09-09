<template>
  <div class="container-fluid">
    <div class="row flex-grow-1 h-100">
      <!-- Sidebar -->
      <div class="col-md-3 vh-100 d-flex flex-column bg-white">
        <div class="custom-tabs" role="tablist" aria-label="Builder palettes">
          <button
              v-for="(tab, index) in controlTabs"
              :key="tab.id"
              role="tab"
              :aria-selected="selectedTabIndex === index"
              :class="{ active: selectedTabIndex === index }"
              class="tab-button"
              @click="selectedTabIndex = index"
          >
            {{ tab.text }}
          </button>
        </div>

        <div class="custom-list" role="list">
          <DraggableControlItem
              v-for="item in buildElementsDataSource"
              :key="item.type || item.title || item.icon"
              :descriptor="item"
              role="listitem"
          />
        </div>
      </div>

      <!-- Main canvas -->
      <div class="col-md-9 flex-grow-1 p-3 d-flex flex-column">
        <div class="form-canvas">
          <ElementWrapper
              :id="rootId"
              :container-id="rootId"
              v-model="store.formElements"
              :show-default-placeholder="true"
              css-classes="main-container"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, useId, computed } from 'vue';
import themes from 'devextreme/ui/themes';
import DraggableControlItem from './DraggableControlItem.vue';
import { elementTypes } from '../configuration/form-components';
import { designElements } from '../configuration/design-elements/design-elements';
import { useBuilderStore } from '../configuration/stores/builder-store';
import ElementWrapper from '../configuration/design-elements/components/ElementWrapper.vue';

themes.current('material.teal.light');

const store = useBuilderStore();
const rootId = useId();

const controlTabs = ref([
  { id: 0, text: 'Controls', dataSource: elementTypes },
  { id: 1, text: 'Design',   dataSource: designElements },
]);
const selectedTabIndex = ref(0);
const buildElementsDataSource = computed(() => controlTabs.value[selectedTabIndex.value].dataSource);
</script>


<style lang="scss" scoped>
.custom-tabs {
  display: flex;
  border-bottom: 1px solid #ccc;
  margin-bottom: 10px;
}
.tab-button {
  padding: 10px 15px;
  cursor: pointer;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-weight: bold;
}
.tab-button.active {
  border-bottom: 2px solid #007bff;
  color: #007bff;
}

.custom-list {
  overflow-y: auto;
  height: 100%;
  padding: 10px;
}
.draggable-wrapper {
  margin-bottom: 10px;
  user-select: none;
  cursor: grab;
}
.draggable-wrapper:active {
  cursor: grabbing;
}

.form-canvas {
  position: relative;
  background-color: white;
  height: calc(100vh - 50px);
  padding: 25px;
  overflow-y: auto;
}

:deep(.main-container) {
  min-height: 100%;
  width: 100%;
}
</style>
