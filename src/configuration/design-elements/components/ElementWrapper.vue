<template>
  <div class="d-flex flex-grow-1">
    <DxSortable
        v-model:data="childElements"
        :class="calculatedClasses"
        drop-feedback-mode="indicate"
        filter=".container-sortable-item"
        group="formItemGroup"
        @add="onFieldAdded"
        @remove="onRemoved"
        @reorder="onReorder"
        @drag-start="onDragStart"
        @drag-end="onDragEnd"
    >
      <div v-if="showDefaultPlaceholder && childElements.length === 0"
           class="h-100 d-flex justify-content-center align-items-center placeholder-container">
        <p class="text-center" style="max-width: 50%">Drag sections, columns, or controls here to build your form</p>
      </div>
      <div v-else>
        <slot name="placeholder"/>
      </div>
      <div v-for="(field, index) in childElements"
           :key="`ctrl-${index}`"
           :class="
         {
           'editing': editingField === field && !isDragging,
           'bottom-padding': isDragging,
           'field-edit-wrapper': !isDragging
         }"
           class="d-flex flex-column bg-white"
           @click="editField(field)"
      >
        <OnClickOutside class="container-sortable-item" @trigger="controlBarOutsideClick(field)">
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
    </DxSortable>
  </div>

</template>

<script lang="ts" setup>
import {computed, defineProps, ref, watch} from 'vue';
import {DxSortable, DxSortableTypes} from 'devextreme-vue/sortable';
import {DxButtonGroup, DxButtonGroupTypes} from 'devextreme-vue/button-group';
import {OnClickOutside} from '@vueuse/components';
import {ElementClassification, FormElement} from '../../../types/builder';
import {useDraggingTracking} from '../../../composables/useDragging';
import {resolveControlComponent} from '../../form-components';
import {resolveDesignComponent} from "../design-elements";
import {useCloned} from "@vueuse/core";

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

const {isDragging, start, end} = useDraggingTracking();

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
  start();
  e.itemData = e.fromData[e.fromIndex];
};

const onDragEnd = (_e: DxSortableTypes.DragEndEvent) => {
  end();
};

const onReorder = (e: DxSortableTypes.ReorderEvent) => {
  e.fromData.splice(e.fromIndex, 1);
  e.toData.splice(e.toIndex, 1, e.itemData);
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
  console.log(isDragging.value);
});
</script>

<style scoped lang="scss">
.control-bar {
  display: none;
}

.placeholder-container {
  background-color: whitesmoke;
}

@mixin edit-control {
  z-index: 100;
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

.editing {
  @include edit-control;
}

.field-edit-wrapper:hover {
  @include edit-control;
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
    padding: 25px;
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

.bottom-padding {
  padding-bottom: 10px;
  padding-top: 10px;
}
</style>



<!--<template>-->
<!--  <div class="d-flex flex-grow-1">-->
<!--    <DxSortable-->
<!--        v-model:data="childElements"-->
<!--        :class="calculatedClasses"-->
<!--        drop-feedback-mode="indicate"-->
<!--        filter=".container-sortable-item"-->
<!--        group="formItemGroup"-->
<!--        @add="onFieldAdded"-->
<!--        @remove="onRemoved"-->
<!--        @reorder="onReorder"-->
<!--        @drag-start="onDragStart"-->
<!--        @drag-end="onDragEnd"-->
<!--    >-->
<!--      <div v-if="showDefaultPlaceholder && childElements.length === 0"-->
<!--           class="h-100 d-flex justify-content-center align-items-center placeholder-container">-->
<!--        <p class="text-center" style="max-width: 50%">Drag sections, columns, or controls here to build your form</p>-->
<!--      </div>-->
<!--      <div v-else>-->
<!--        <slot name="placeholder"/>-->
<!--      </div>-->
<!--      <div v-for="(field, index) in childElements"-->
<!--           :key="`ctrl-${index}`"-->
<!--           :class="-->
<!--         {-->
<!--           'editing': editingField === field && !isDragging,-->
<!--           'bottom-padding': isDragging,-->
<!--           'field-edit-wrapper': !isDragging-->
<!--         }"-->
<!--           class="d-flex flex-column bg-white"-->
<!--           @click="editField(field)"-->
<!--      >-->
<!--        <OnClickOutside class="container-sortable-item" @trigger="controlBarOutsideClick(field)">-->
<!--          <div style="min-height: 1px">-->
<!--            <div class="control-bar"-->
<!--                 @click="editField(field)">-->
<!--              <DxButtonGroup-->
<!--                  :key="generateKey(field, index + 1)"-->
<!--                  :items="fieldEditButtons"-->
<!--                  key-expr="operation" position="after"-->
<!--                  styling-mode="text"-->
<!--                  @item-click="fieldOperationSelected($event, field)"/>-->
<!--              <span class="fw-bold">Control Type: {{ field.title }}</span>-->
<!--            </div>-->
<!--            <component-->
<!--                :is="resolveComponent(field)"-->
<!--                :id="field.uniqueId"-->
<!--                :key="field.uniqueId"-->
<!--                v-bind="field.props"-->
<!--            />-->
<!--          </div>-->
<!--        </OnClickOutside>-->
<!--      </div>-->
<!--    </DxSortable>-->
<!--  </div>-->

<!--</template>-->

<!--<script lang="ts" setup>-->
<!--import {computed, defineProps, ref, watch} from 'vue';-->
<!--import {DxSortable, DxSortableTypes} from 'devextreme-vue/sortable';-->
<!--import {DxButtonGroup, DxButtonGroupTypes} from 'devextreme-vue/button-group';-->
<!--import {OnClickOutside} from '@vueuse/components';-->
<!--import {ElementClassification, FormElement} from '../../../types/builder';-->
<!--import {useDraggingTracking} from '../../../composables/useDragging';-->
<!--import {resolveControlComponent} from '../../form-components';-->
<!--import {resolveDesignComponent} from "../design-elements";-->
<!--import {useCloned} from "@vueuse/core";-->

<!--const {cssClasses, containerElements} = defineProps({-->
<!--  id: {-->
<!--    required: true,-->
<!--    type: String-->
<!--  },-->
<!--  cssClasses: {-->
<!--    type: String,-->
<!--    default: ''-->
<!--  },-->
<!--  containerElements: {-->
<!--    type: Array as () => FormElement[],-->
<!--    required: true-->
<!--  },-->
<!--  showDefaultPlaceholder: {-->
<!--    type: Boolean,-->
<!--    default: false-->
<!--  }-->
<!--});-->

<!--const emit = defineEmits(['update:containerElements']);-->

<!--const childElements = computed({-->
<!--  get: () => containerElements || [],-->
<!--  set: (value: FormElement[]) => {-->
<!--    emit('update:containerElements', value);-->
<!--  }-->
<!--});-->

<!--const {isDragging, start, end} = useDraggingTracking();-->

<!--const fieldEditButtons = ref([{-->
<!--  icon: 'copy',-->
<!--  hint: 'Clone',-->
<!--  operation: 'Clone'-->

<!--}, {-->
<!--  icon: 'trash',-->
<!--  hint: 'Delete',-->
<!--  operation: 'Delete'-->
<!--}]);-->

<!--const editingField = ref<FormElement | null>(null);-->

<!--const controlBarOutsideClick = (field: FormElement) => {-->
<!--  if (editingField.value === field) {-->
<!--    editingField.value = null;-->
<!--  }-->
<!--};-->


<!--const cloneFormItem = (item: FormElement) => {-->
<!--  const {cloned} = useCloned(item);-->
<!--  cloned.value.uniqueId = generateUniqueValue();-->
<!--  return cloned.value;-->
<!--};-->

<!--const onFieldAdded = (e: DxSortableTypes.AddEvent) => {-->
<!--  let item = e.itemData;-->
<!--  if (!item) {-->
<!--    item = e.fromData.splice(e.fromIndex - 1, 1)[0];-->
<!--  }-->
<!--  e.toData.splice(e.toIndex, 0, cloneFormItem(item));-->
<!--};-->

<!--const onDragStart = (e: DxSortableTypes.DragStartEvent) => {-->
<!--  start();-->
<!--  e.itemData = e.fromData[e.fromIndex];-->
<!--};-->

<!--const onDragEnd = (_e: DxSortableTypes.DragEndEvent) => {-->
<!--  end();-->
<!--};-->

<!--const onReorder = (e: DxSortableTypes.ReorderEvent) => {-->
<!--  e.fromData.splice(e.fromIndex, 1);-->
<!--  e.toData.splice(e.toIndex, 1, e.itemData);-->
<!--};-->

<!--const onRemoved = (e: DxSortableTypes.RemoveEvent) => {-->
<!--  e.fromData.splice(e.fromIndex, 1);-->
<!--};-->

<!--const generateKey = (item: FormElement, index: number) => {-->
<!--  return `${item.uniqueId}.${index}`;-->
<!--};-->

<!--const editField = (field: FormElement) => {-->
<!--  editingField.value = field;-->
<!--};-->


<!--const fieldOperationSelected = (e: DxButtonGroupTypes.ItemClickEvent, selectedField: FormElement) => {-->
<!--  let index = childElements.value.indexOf(selectedField);-->

<!--  if (e.itemData.operation === 'Delete') {-->
<!--    childElements.value.splice(index, 1);-->
<!--  } else {-->
<!--    childElements.value.splice(index + 1, 0, cloneFormItem(selectedField));-->
<!--  }-->

<!--  e.event?.stopPropagation();-->
<!--};-->


<!--const generateUniqueValue = () => {-->
<!--  return (Date.now() + Math.random()).toString();-->
<!--};-->


<!--const calculatedClasses = computed(() => {-->
<!--  return isDragging.value ? `${cssClasses} bottom-padding` : cssClasses;-->
<!--});-->

<!--const resolveComponent = (element: FormElement) => {-->
<!--  return element.classification === ElementClassification.CONTROL ?-->
<!--      resolveControlComponent(element.type) : resolveDesignComponent(element.type);-->
<!--};-->


<!--watch(() => isDragging.value, (newValue) => {-->
<!--  if (newValue) {-->
<!--    editingField.value = null;-->
<!--  }-->
<!--  console.log(isDragging.value);-->
<!--});-->
<!--</script>-->

<!--<style scoped lang="scss">-->
<!--.control-bar {-->
<!--  display: none;-->
<!--}-->

<!--.placeholder-container {-->
<!--  background-color: whitesmoke;-->
<!--}-->

<!--@mixin edit-control {-->
<!--  z-index: 100;-->
<!--  background-color: white;-->
<!--  border: 1px solid lightsteelblue;-->
<!--  position: relative;-->

<!--  .control-bar {-->
<!--    display: flex;-->
<!--    justify-content: space-between;-->
<!--    padding-right: 10px;-->
<!--    background-color: lightsteelblue;-->
<!--    color: white;-->

<!--    .dx-icon {-->
<!--      color: white;-->
<!--    }-->
<!--  }-->
<!--  :hover {-->
<!--    cursor: pointer;-->
<!--  }-->

<!--}-->

<!--.editing {-->
<!--  @include edit-control;-->
<!--}-->

<!--.field-edit-wrapper:hover {-->
<!--  @include edit-control;-->
<!--}-->

<!--$form-placeholder-color: #888;-->
<!--$form-placeholder-font-size: 1.2rem;-->
<!--$form-placeholder-border-color: #ccc;-->

<!--.form-canvas {-->
<!--  height: 100%;-->
<!--  position: relative;-->
<!--  overflow-y: auto;-->
<!--  padding: 25px;-->

<!--  .placeholder-text {-->
<!--    position: absolute;-->
<!--    top: 50%;-->
<!--    left: 50%;-->
<!--    transform: translate(-50%, -50%);-->
<!--    font-size: $form-placeholder-font-size;-->
<!--    color: $form-placeholder-color;-->
<!--  }-->

<!--  .form-canvas {-->
<!--    height: 100%;-->
<!--    display: flex;-->
<!--    flex-direction: column;-->
<!--    overflow-y: auto; /* Allows scroll inside the form canvas */-->
<!--  }-->

<!--}-->


<!--.form-scroll-box {-->
<!--  flex-grow: 1; /* Ensures this box takes available space */-->
<!--  overflow-y: auto; /* Enables scrolling */-->
<!--  scrollbar-width: thin; /* For Firefox */-->

<!--  &::-webkit-scrollbar {-->
<!--    width: 6px; /* For WebKit browsers */-->
<!--  }-->

<!--  &::-webkit-scrollbar-thumb {-->
<!--    background-color: rgba(0, 0, 0, 0.3);-->
<!--    border-radius: 3px;-->
<!--  }-->
<!--}-->

<!--.bottom-padding {-->
<!--  padding-bottom: 10px;-->
<!--  padding-top: 10px;-->
<!--}-->
<!--</style>-->
