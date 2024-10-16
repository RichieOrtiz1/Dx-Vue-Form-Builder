<template>

<!--
  <div class="row">
    <div class="container-fluid"
    >

    </div>
  </div>
-->
  <div class="control-bar"  v-if="!isDragging">
    <DxButtonGroup
        :items="fieldEditButtons"
        key-expr="operation" position="after"
        styling-mode="text"
        @item-click="containerOperationSelected($event)"/>
    <span class="fw-bold">Control Type: Container</span>
  </div>
  <DxSortable
      :data="containerElements"
      class="d-flex pb-2 pt-2 mb-2 container-fluid flex-column element-container_no-content"
      group="formItemGroup"
      @add="onFieldAdded($event)"
      @reorder="onItemDropped($event)"
      @drag-start="onDragStart($event)"
      @drag-end="onDragEnd($event)"
      @remove="onRemoved($event)"
      drop-feedback-mode="indicate"
  >
    <template #dragTemplate="{data}">
      <DraggableControlItem :descriptor="data.itemData"/>
    </template>
    <div v-for="(field, index) in containerElements"
         :key="`ctrl-${index}`"
         ref="controlBar"
         :class="
         {
           'editing': editingField === field && !isDragging,

           'field-edit-wrapper': !isDragging
         }"
         class="d-flex flex-column element-container_item"
         @click="editField(field, index)"
    >

      <div class="control-bar" v-if="!isDragging">
        <DxButtonGroup
            :key="generateKey(field, index + 1)"
            :items="fieldEditButtons"
            key-expr="operation" position="after"
            styling-mode="text"
            @item-click="fieldOperationSelected($event, field)"/>
        <span class="fw-bold">Control Type: {{ field.title }}</span>
      </div>


      <component
          v-if="field.type === 'control'"
          :is="field.control"
          :id="field.uniqueId"
          :key="field.uniqueId"
          :labelMode="formConfiguration.labelMode"
          v-bind="field.props"
      >
      </component>

      <component
          :is="field.control"
          v-if="field.type === 'design-element'"
          :id="field.uniqueId"
          :key="field.uniqueId"
          v-bind="field.props"
      >
      </component>
    </div>

  </DxSortable>

<!--  <DxSortable
      :data="formConfiguration.formElements"
      class="drag-zone d-flex flex-column element-container_no-content"
      group="formItemGroup"
      @add="onFieldAdded($event)"
      @reorder="onItemDropped($event)"
      @drag-start="onDragStart($event)"
      @remove="onRemoved($event)"
      drop-feedback-mode="indicate"
  >
    <div class="row">
      <div class="container-fluid"
      >
        &lt;!&ndash;          <div v-if="showDropZonePlaceHolder && !isDragging" draggable="false">
                    <div class="drop-zone-place-holder d-flex flex-column align-items-center justify-content-center"
                         style=" border: 2px dashed black;"
                    >
                      <i class="bi bi-hand-index-thumb h1"></i>
                      <h1 class="d-flex">Drag Items Here</h1>
                    </div>
                  </div>&ndash;&gt;
        <div v-for="(field, index) in formConfiguration.formElements"
             :key="`ctrl-${index}`"
             ref="controlBar"
             :class="{ 'editing': editingField === field, 'mb-2': field.type === 'control' }"
             class="field-edit-wrapper d-flex flex-column"
             @click="editField(field, index)"
        >

          <div class="control-bar">
            <DxButtonGroup
                :key="generateKey(field, index + 1)"
                :items="fieldEditButtons"
                key-expr="operation" position="after"
                styling-mode="text"
                @item-click="fieldOperationSelected($event, field)"/>
            <span class="fw-bold">Control Type: {{ field.title }}</span>
          </div>

          <div v-if="field.type === 'control'">
            <component
                :is="field.control"
                :id="field.uniqueId"
                :key="field.uniqueId"
                :labelMode="formConfiguration.labelMode"
                v-bind="field.props"
            >
            </component>
          </div>

          <component
              :is="field.control"
              v-if="field.type === 'design-element'"
              :id="field.uniqueId"
              :key="field.uniqueId"
              v-bind="field.props"
          >
          </component>
        </div>
      </div>
    </div>
  </DxSortable>-->

</template>

<script setup>

import {computed, ref, getCurrentInstance, onMounted, inject, defineProps, toRefs } from 'vue';
import DxSortable from 'devextreme-vue/sortable'
import DxButtonGroup from 'devextreme-vue/button-group'
import {onClickOutside} from "@vueuse/core";
import DraggableControlItem from "../../../components/DraggableControlItem.vue";
import {useFormConfigStore} from "../../stores/formConfigStore.js";


const props = defineProps({
  id: {
    required: true
  }
})
const { formConfiguration, fetchChildComponents } = toRefs(useFormConfigStore());
//let formConfiguration = formConfigStore.formConfiguration.value;

console.log(props.id);
let containerElements = fetchChildComponents.value(props.id);


const groupName = ref('formItemGroup');
const isDragging = inject('isDragging');
const fieldEditButtons = ref([{
  icon: 'copy',
  hint: 'Clone',
  operation: 'Clone'

}, {
  icon: 'trash',
  hint: 'Delete',
  operation: 'Delete'
}])

const controlBar = ref(null);
const editingField = ref();
const templateId = ref(getCurrentInstance().uid);
console.log(templateId.value);

onClickOutside(controlBar, e => {

  let controlBars = controlBar.value;
  if (!controlBars || controlBars.length <= 0) return;

  let isInnerElement = controlBars.some(x => {
    let childElements = Array.from(x.querySelectorAll("*"));
    return childElements.some(c => c.contains(e.target));
  });

  if (isInnerElement) return;

  editingField.value = null;
});


const buildElementsDataSource = ref([])

const cloneFormItem = (item) => {
  let clonedItem = Object.assign({}, item);
  clonedItem.uniqueId = generateUniqueValue();
  return clonedItem;
}

const onFieldAdded = (e) => {
  let s = 123;
  e.toData.splice(e.toIndex, 0, cloneFormItem(e.itemData));
}

const onDragStart = (e) => {
  isDragging.value = true;
  console.log(isDragging.value);
  e.itemData = e.fromData[e.fromIndex];
}

const onDragEnd = (e) => {
  isDragging.value = false;
}

const onItemDropped = (e) => {
  e.fromData.splice(e.fromIndex, 1);
  e.toData.splice(e.toIndex, 0, e.itemData);
}

const onRemoved = (e) => {
  e.fromData.splice(e.fromIndex, 1);
}

const generateKey = (item, index) => {
  return `${item}${index}`
}

const editField = (field, index) => {
  editingField.value = field;
}


const fieldOperationSelected = (e, selectedField) => {
  let index = containerElements.indexOf(selectedField);

  if (e.itemData.operation === 'Delete') {
    containerElements.splice(index, 1);
  } else {
    containerElements.splice(index + 1, 0, cloneFormItem(selectedField));
  }

  e.event.stopPropagation();
}

const containerOperationSelected = (e) => {
  let configElements = formConfiguration.value.formElements;
  let element = configElements.find(x => x.uniqueId === props.id);
  let index = configElements.indexOf(element);

  if (e.itemData.operation === 'Delete') {
    configElements.splice(index, 1);
  } else {
    configElements.splice(index + 1, 0, cloneFormItem(element));
  }

  e.event.stopPropagation();
}

const generateUniqueValue = () => {
  return Date.now() + Math.random();
}

const showDropZonePlaceHolder = computed(() => formConfiguration.value.formElements.length <= 0)

</script>

<style lang="scss">
/*.control-bar {
  display: none;
}

@mixin edit-control {
  z-index: 100;
  background-color: white;
  border: 3px solid #5a52f0;
  position: relative;
  !*padding: 10px 20px;*!

  :hover {
    cursor: pointer;
  }

  .control-bar {
    display: flex;
    position: relative;
    align-items: center;
  }
}*/

/*
.editing {
  @include edit-control;
}

.field-edit-wrapper:hover {
  @include edit-control;
}
*/

.element-container{
  &_no-content{
    //border-radius: 5px;
    display: inline-flex;
    //padding: 5px;
    background-color: rgba(61, 171, 245, 0.09);
    min-height: 120px;
    height: auto;
  }
}
</style>
