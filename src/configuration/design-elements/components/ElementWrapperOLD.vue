<template>
  <div class="d-flex flex-grow-1">
    <DxSortable
        :key="useId()"
        v-model:data="childElements"
        :class="calculatedClasses"
        drop-feedback-mode="indicate"
        filter=".container-sortable-item"
        group="formItemGroup"
        drag-direction="both"
        @add="onFieldAdded"
        @remove="onRemoved"
        @reorder="onReorder"
        @drag-start="onDragStart"
        @drag-end="onDragEnd"
    >

      <Placeholder
          v-if="childElements.length === 0"
          :highlight="isDragging"
      />
<div v-for="(field, index) in childElements">
  <div
      :key="`ctrl-${index}`"
      :class="{
             'editing': editingField === field,

           }"
      class="d-flex flex-column bg-white container-sortable-item field-edit-wrapper"
      @click="editField(field)"
  >
    <OnClickOutside @trigger="controlBarOutsideClick(field)">
      <div style="min-height: 1px">
        <div class="control-bar"
             @click="editField(field)">
          <DxButtonGroup
              :key="generateKey(field, index + 1)"
              :items="fieldEditButtons"
              key-expr="operation" position="after"
              styling-mode="text"
              @item-click="fieldOperationSelected($event, field)"/>
          <span class="fw-bold">Control Type: {{ field.title }}</span>
        </div>
        <component
            :is="resolveComponent(field)"
            :id="field.uniqueId"
            :key="field.uniqueId"
            v-bind="field.props"
        />
      </div>
    </OnClickOutside>
  </div>
</div>

    </DxSortable>
  </div>
</template>

<script lang="ts" setup>
import {computed, defineProps, ref, watch, useId} from 'vue';
import {DxSortable, DxSortableTypes} from 'devextreme-vue/sortable';
import {DxButtonGroup, DxButtonGroupTypes} from 'devextreme-vue/button-group';
import {OnClickOutside} from '@vueuse/components';
import {ElementClassification, FormElement} from '../../../types/builder';
import {useDraggingTracking} from '../../../composables/useDragging';
import {resolveControlComponent} from '../../form-components';
import {resolveDesignComponent} from "../design-elements";
import {useCloned} from "@vueuse/core";
import Placeholder from './Placeholder.vue';
import {useBuilderStore} from '../../stores/builder-store.ts';
import {storeToRefs} from 'pinia';


const store = useBuilderStore();
const {isDragging} = storeToRefs(store);
const {cssClasses, containerElements} = defineProps({
  id: {
    required: true,
    type: String
  },
  cssClasses: {
    type: String,
    default: ''
  },
  containerElements: {
    type: Array as () => FormElement[],
    required: true
  },
  showDefaultPlaceholder: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:containerElements']);
const childElements = computed({
  get: () => containerElements || [],
  set: (value: FormElement[]) => {
    emit('update:containerElements', value);
  }
});

const fieldEditButtons = ref([
  { icon: 'copy', hint: 'Clone', operation: 'Clone' },
  { icon: 'trash', hint: 'Delete', operation: 'Delete' }
]);

const editingField = ref<FormElement | null>(null);
const controlBarOutsideClick = (field: FormElement) => {
  if (editingField.value === field) {
    editingField.value = null;
  }
};

const cloneFormItem = (item: FormElement) => {
  const {cloned} = useCloned(item);
  cloned.value.uniqueId = generateUniqueValue();
  return cloned.value;
};

const onFieldAdded = (e: DxSortableTypes.AddEvent) => {
  let item = e.itemData;
  if (!item) {
    item = e.fromData.splice(e.fromIndex - 1, 1)[0];
  }
  e.toData.splice(e.toIndex, 0, cloneFormItem(item));
};

const onDragStart = (e: DxSortableTypes.DragStartEvent) => {
  isDragging.value = true;
  e.itemData = e.fromData[e.fromIndex];
};

const onDragEnd = (_e: DxSortableTypes.DragEndEvent) => {
 isDragging.value = false;
};

const onReorder = (e: DxSortableTypes.ReorderEvent) => {
  e.fromData.splice(e.fromIndex, 1);
  e.toData.splice(e.toIndex, 0, e.itemData);
};

const onRemoved = (e: DxSortableTypes.RemoveEvent) => {
  e.fromData.splice(e.fromIndex, 1);
};

const generateKey = (item: FormElement, index: number) => {
  return `${item.uniqueId}.${index}`;
};

const editField = (field: FormElement) => {
  editingField.value = field;
};

const fieldOperationSelected = (e: DxButtonGroupTypes.ItemClickEvent, selectedField: FormElement) => {
  let index = childElements.value.indexOf(selectedField);
  if (e.itemData.operation === 'Delete') {
    childElements.value.splice(index, 1);
  } else {
    childElements.value.splice(index + 1, 0, cloneFormItem(selectedField));
  }
  e.event?.stopPropagation();
};

const generateUniqueValue = () => {
  return (Date.now() + Math.random()).toString();
};

const calculatedClasses = computed(() => {
  return isDragging.value ? `${cssClasses} bottom-padding` : cssClasses;
});

const resolveComponent = (element: FormElement) => {
  return element.classification === ElementClassification.CONTROL ?
      resolveControlComponent(element.type) : resolveDesignComponent(element.type);
};

watch(() => isDragging.value, (newValue) => {
  if (newValue) {
    editingField.value = null;
  }
});
</script>

<style scoped lang="scss">
.bottom-padding {
  padding-bottom: 10px;
  padding-top: 10px;
  flex-grow: 1;
}

.control-bar {
  display: none;
}

.editing, .field-edit-wrapper:hover {
  background-color: white;
  border: 1px solid lightsteelblue;
  position: relative;

  .control-bar {
    display: flex;
    justify-content: space-between;
    padding-right: 10px;
    background-color: lightsteelblue;
    color: white;

    .dx-icon {
      color: white;
    }
  }
  :hover {
    cursor: pointer;
  }
}

.dx-sortable-dragging.dx-sortable-clone {
  position: fixed !important; /* Allow the clone to move freely */
  top: 0;
  left: 0;
  box-sizing: border-box;
  opacity: 0.9;
  z-index: 2147483647; /* Ensure it's on top of other elements */
}
</style>
