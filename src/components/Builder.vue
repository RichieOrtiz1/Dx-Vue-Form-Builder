<template>
  <div class="container-fluid min-vh-100">
    <div class="row flex-grow-1 h-100">
      <div class="col-md-3 vh-100 d-flex flex-column bg-white">
        <DxTabs
            :ref="controlTabRef"
            :data-source="controlTabs"
            :selected-index="0"
            key-expr="id"
            styling-mode="secondary"
            @option-changed="tabSelectionChanged"
        />
        <DxList
            :data-source="buildElementsDataSource"
            :search-enabled="true"
            :search-expr="['title', 'description']"
            itemTemplate="listItemTemplate"
            key-expr="id"
            show-scrollbar="always"
        >
          <template #listItemTemplate="{ data: item }">
            <DraggableControlItem :descriptor="item"/>
          </template>

          <DxItemDragging
              :data="buildElementsDataSource"
              group="formItemGroup"
              handle=".card, .dx-list-reorder-handle"
              @drag-start="onControlListDragStart"
              @drag-end="onControlListDragEnd"
          />
        </DxList>
      </div>

      <div key="formConfiguration" class="col-auto flex-grow-1 h-100 p-3 d-flex flex-column">
        <div class="form-canvas flex-grow-1 position-relative bg-white d-flex">
          <ElementWrapper :id="useId()" css-classes="d-flex flex-column vh-100 form-scroll-box" :container-elements="store.formElements"/>
        </div>
      </div>
    </div>
  </div>
</template>


<script lang="ts" setup>
import {ref, useId} from 'vue';
import DxList, {DxItemDragging} from 'devextreme-vue/list';
import DxTabs from 'devextreme-vue/tabs';
import type {DxSortableTypes} from 'devextreme-vue/sortable';
import themes from 'devextreme/ui/themes';
import DraggableControlItem from './DraggableControlItem.vue';
import {ElementTypeDataSource} from '../configuration/form-components';
import {DesignElementsDataSource} from '../configuration/design-elements/design-elements';
import DataSource from 'devextreme/data/data_source';
import {useBuilderStore} from '../configuration/stores/builder-store';
import {useDraggingTracking} from '../composables/useDragging';
import ElementWrapper from '../configuration/design-elements/components/ElementWrapper.vue';


// Store
const store = useBuilderStore();
const dragTracker = useDraggingTracking();

// Themes
themes.current('material.teal.light');

// Data Sources
const buildElementsDataSource = ref([]);
const controlTabRef = ref(null);

const controlTabs = ref(
    new DataSource({
      key: 'id',
      store: [
        {
          id: 0,
          text: 'Controls',
          dataSource: ElementTypeDataSource,
        },
        {
          id: 1,
          text: 'Design',
          dataSource: DesignElementsDataSource,
        },
      ],
    })
);

// Event Handlers
const onControlListDragStart = (e: any) => {
  dragTracker.start();
  const dataSource = e.component.getDataSource().items();
  e.itemData = dataSource[e.fromIndex];
};

const onControlListDragEnd = (_e: DxSortableTypes.DragEndEvent) => {
  dragTracker.end();
};

const tabSelectionChanged = (e: any) => {
  if (e.name === 'selectedItem' && e.value !== e.previousValue) {
    buildElementsDataSource.value = e.value.dataSource;
  }
};
</script>

<style lang="scss" scoped>

:deep(.dx-list-item) {
  table-layout: auto;
}

</style>

<style lang="scss">

body {
  overflow: hidden;
  background-color: rgba(61, 171, 245, 0.09);
}


$form-placeholder-color: #888;
$form-placeholder-font-size: 1.2rem;
$form-placeholder-border-color: #ccc;

.form-canvas {
  height: 100%;
  position: relative;
  overflow-y: auto;
  padding: 25px;

  .placeholder-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: $form-placeholder-font-size;
    color: $form-placeholder-color;
  }

  .form-canvas {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto; /* Allows scroll inside the form canvas */
  }

}


.form-scroll-box {
  flex-grow: 1; /* Ensures this box takes available space */
  overflow-y: auto; /* Enables scrolling */
  scrollbar-width: thin; /* For Firefox */

  &::-webkit-scrollbar {
    width: 6px; /* For WebKit browsers */
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
  }
}
</style>
