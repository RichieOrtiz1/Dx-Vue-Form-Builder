<template>
  <DxSortable
      v-model:data="childElements"
      :class="cssClasses"
      drop-feedback-mode="indicate"
      filter=".container-sortable-item"
      group="formItemGroup"
      @add="onFieldAdded($event)"
      @remove="onRemoved($event)"
      @reorder="onItemDropped($event)"
      @drag-start="onDragStart($event)"
      @drag-end="onDragEnd($event)"
  >
    <div v-if="childElements.length === 0" class="h-100 d-flex justify-content-center align-items-center placeholder-container">
      <p class="text-center" style="max-width: 50%">Drag sections, columns, or controls here to build your form</p>
    </div>
    <div v-for="(field, index) in childElements"
         :key="`ctrl-${index}`"
         :class="
         {
           'editing': editingField === field && !isDragging,

           'field-edit-wrapper': !isDragging
         }"
         class="d-flex flex-column bg-white"
         @click="editField(field)"
    >
      <OnClickOutside class="container-sortable-item" @trigger="controlBarOutsideClick(field)">
        <div class="control-bar row flex-row"
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
            :is="field.control"
            v-if="field.type === 'control'"
            :id="field.uniqueId"
            :key="field.uniqueId"
            v-bind="field.props"
        />
        <component
            :is="field.control"
            v-if="field?.type === 'design-element' && isStandardControl(field)"
            :id="field.uniqueId"
            :key="field.uniqueId"
            v-bind="field.props"
        />
        <component
            v-if="!isStandardControl(field)"
            :is="field.control"
            :id="field.uniqueId"
            :key="field.uniqueId"
            v-bind="field.props"
        />
      </OnClickOutside>
    </div>
  </DxSortable>
</template>

<script lang="ts" setup>
import {ref, defineProps, computed} from 'vue';
import {DxSortable, DxSortableTypes} from 'devextreme-vue/sortable';
import {DxButtonGroup, DxButtonGroupTypes} from 'devextreme-vue/button-group';
import {OnClickOutside} from '@vueuse/components';
import {FormElement} from '../../../types/builder';
import {useDraggingTracking} from '../../../composables/useDragging';

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
  }
});

const emit = defineEmits(['update:containerElements']);

const childElements = computed({
  get: () => containerElements || [],
  set: (value: FormElement[]) => {
    emit('update:containerElements', value);
  }
});

const dragTracker = useDraggingTracking();
const isDragging = computed(() => dragTracker.isDragging.value);

const fieldEditButtons = ref([{
  icon: 'copy',
  hint: 'Clone',
  operation: 'Clone'

}, {
  icon: 'trash',
  hint: 'Delete',
  operation: 'Delete'
}]);

const editingField = ref<FormElement | null>(null);

const controlBarOutsideClick = (field: FormElement) => {
  if (editingField.value === field) {
    editingField.value = null;
  }
};


const cloneFormItem = (item: FormElement) => {
  let clonedItem = Object.assign({}, item);
  clonedItem.uniqueId = generateUniqueValue();
  return clonedItem;
};

const onFieldAdded = (e: DxSortableTypes.AddEvent) => {
  const newElement = cloneFormItem(e.itemData);
  childElements.value.splice(e.toIndex, 0, newElement);
  //e.toData.splice(e.toIndex, 0, cloneFormItem(e.itemData));
};

const onDragStart = (e: DxSortableTypes.DragStartEvent) => {
  dragTracker.start();
  e.itemData = e.fromData[e.fromIndex];
};

const onDragEnd = (_e: DxSortableTypes.DragEndEvent) => {
  dragTracker.end();
};

const onItemDropped = (e: DxSortableTypes.ReorderEvent) => {
  e.fromData.splice(e.fromIndex, 1);
  e.toData.splice(e.toIndex, 0, e.itemData);
};

const onRemoved = (e: DxSortableTypes.RemoveEvent) => {
  childElements.value.splice(e.fromIndex, 1);
  e.fromData.splice(e.fromIndex, 1);
};

const generateKey = (item: FormElement, index: number) => {
  return `${item}${index}`;
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

const isStandardControl = (field: FormElement) => {
  const exclusionList = ['ElementContainer', 'Col2', 'Col3', 'Col4'];
  return !exclusionList.includes(field.name);
};

</script>

<style lang="scss">
.control-bar {
  display: none;
}

.placeholder-container {
  background-color: whitesmoke;
}

@mixin edit-control {
  z-index: 100;
  background-color: white;
  border: 3px dashed #5a52f0;
  position: relative;

  .control-bar{
    display: flex;
    flex-direction: row;
  }
  :hover {
    cursor: pointer;
  }

}

.editing {
 // @include edit-control;
}

.field-edit-wrapper:hover {
  //@include edit-control;
}

</style>
