<template>
  <div class="builder">

    <div class="row">

      <div class="component-list col-md-2">
        <DxTabs :ref="controlTabRef"
                :data-source="controlTabs"
                :selected-index="0"
                key-expr="id"
                styling-mode="secondary"
                @option-changed="tabSelectionChanged"
        />
        <dx-list :data-source="buildElementsDataSource"
                 :search-enabled="true"
                 :search-expr="['title', 'description']"
                 itemTemplate="listItemTemplate"
                 key-expr="id"
        >
          <template #listItemTemplate="{ data: item }">
            <DraggableControlItem :descriptor="item"/>
          </template>

          <DxItemDragging :data="buildElementsDataSource"
                          group="formItemGroup"
                          handle=".card"
                          @drag-start="onControlListDragStart($event)"
                          @drag-end="onControlListDragEnd($event)"
          >
          </DxItemDragging>

        </dx-list>
      </div>

      <div key="formConfiguration" class="component-list col-md-8">
        <DxScrollView>

          <DxSortable
              :data="formConfiguration.formElements"
              class="drag-zone min-vh-100 d-flex flex-column form-config"
              group="formItemGroup"
              @add="onFieldAdded($event)"
              @reorder="onItemDropped($event)"
              @drag-start="onDragStart($event)"
              @drag-end="onDragEnd($event)"
              drop-feedback-mode="indicate"
          >
            <template #dragTemplate="{data}">
              <DraggableControlItem :descriptor="data.itemData"/>
            </template>

            <div v-for="(field, index) in formConfiguration.formElements">
              <div
                  v-if="field.name !== 'ElementContainer'"
                   :key="`ctrl-${index}`"
                   ref="controlBar"
                   :class="
                 {
                   'editing': editingField === field && !isDragging,

                   'field-edit-wrapper': !isDragging
                 }"
                   class="d-flex flex-column bg-white"
                   @click="editField(field, index)"
              >

                <div class="control-bar" v-if="!isDragging">
                  <DxButtonGroup
                      :key="generateKey(field, index + 1)"
                      :items="fieldEditButtons"
                      key-expr="operation" position="after"
                      styling-mode="text"
                      @item-click="fieldOperationSelected($event, field)"/>
                  <span class="fw-bold">Control Type: {{ field?.title }}</span>
                </div>

                <component
                    v-if="field?.type === 'control'"
                    :is="field.control"
                    :id="field.uniqueId"
                    :key="field.uniqueId"
                    :labelMode="formConfiguration.labelMode"
                    v-bind="field.props"
                >
                </component>
                <component
                    :is="field.control"
                    v-if="field?.type === 'design-element'"
                    :id="field.uniqueId"
                    :key="field.uniqueId"
                    v-bind="field.props"
                >
                </component>
              </div>

              <component
                  v-if="field.name === 'ElementContainer'"
                  :is="field.control"
                  :id="field.uniqueId"
                  :key="field.uniqueId"
                  v-bind="field.props"
              >
              </component>
            </div>



          </DxSortable>
        </DxScrollView>
      </div>


    </div>
  </div>
</template>

<script setup>

import {computed, ref, provide} from 'vue';

import {DxScrollView} from 'devextreme-vue';

import DxList, {DxItemDragging} from 'devextreme-vue/list';
import DxTabs from 'devextreme-vue/tabs';
import DxSortable from 'devextreme-vue/sortable'


import DxButtonGroup from 'devextreme-vue/button-group'
import themes from 'devextreme/ui/themes'

import DraggableControlItem from './DraggableControlItem.vue'
import {ComponentTypeDataSource} from '../configuration/form-components'
import {DesignElementsDataSource} from '../configuration/design-elements/design-elements'
import DataSource from 'devextreme/data/data_source'
import {onClickOutside} from "@vueuse/core";
import {useFormConfigStore} from '../configuration/stores/formConfigStore.js';

const formConfigStore = useFormConfigStore();
let formConfiguration = formConfigStore.formConfiguration;

themes.current("material.teal.light");

const isDragging = ref(false)
provide('isDragging', isDragging);
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
const controlTabRef = ref(null)
const controlTabs = ref(new DataSource({
  key: 'id',
  store: [
    {
      id: 0,
      text: 'Controls',
      dataSource: ComponentTypeDataSource
    },
    {
      id: 1,
      text: 'Design',
      dataSource: DesignElementsDataSource
    }
  ]
}))


const onControlListDragStart = (e) => {
  isDragging.value = true;
  let dataSource = e.component.getDataSource().items();
  e.itemData = dataSource[e.fromIndex];
}

const onControlListDragEnd = (e) => {
  isDragging.value = false;
}

const cloneFormItem = (item) => {
  let clonedItem = Object.assign({}, item);
  clonedItem.uniqueId = generateUniqueValue();

  return clonedItem;
}

const onFieldAdded = (e) => {
  e.toData.splice(e.toIndex, 0, cloneFormItem(e.itemData));
}

const onDragStart = (e) => {
  isDragging.value = true;
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
  let fields = formConfiguration.formElements;
  console.log(fields);
  let index = fields.indexOf(selectedField);

  if (e.itemData.operation === 'Delete') {
    fields.splice(index, 1);
  } else {
    fields.splice(index + 1, 0, cloneFormItem(selectedField));
  }

  e.event.stopPropagation();
}

const generateUniqueValue = () => {
  return Date.now() + Math.random();
}

const hideConfigEditor = () => {
  editingField.value = null;
}

const tabSelectionChanged = (e) => {
  if (e.name === 'selectedItem' && e.value !== e.previousValue) {
    buildElementsDataSource.value = e.value.dataSource;
  }
}

const showDropZonePlaceHolder = computed(() => formConfiguration.formElements.length <= 0)

</script>

<style lang="scss">
.builder {
  background-color: rgba(192, 192, 192, 0.4);
  height: 100vh;
}

.component-list {
  border-radius: 8px;
  margin: 5px;
  display: flex;
  flex-direction: column;
  vertical-align: top;
  white-space: normal;
  background-color: white;
  height: 100vh;
}

.drop-zone-place-holder {
  background-color: rgba(192, 192, 192, 0.4);
}

// .drag-zone {
//     min-height: 400px;
//     height: 100%;
// }

.card {
  margin: 5px
}

.control-bar {
  display: none;
  min-height: 10px;
}

@mixin edit-control {
  //z-index: 100;
  /*background-color: transparent;*/
  //border: 3px solid #5a52f0;
  //padding: 10px 20px;
  :hover {
    cursor: pointer;
  }

  .control-bar {
    display: block;
    //flex-direction: column;
    //position: relative;
    align-items: center;
  }
}

.form-config {
  margin: 50px 100px;
  display: flex;
}

.editing {
  @include edit-control;
}


.field-edit-wrapper:hover {
  @include edit-control;
}

.dx-list-item-content::before {
  content: none;
}

.dx-list-reorder-handle::before {
  content: none !important;
}

.dx-list-reorder-handle,
.dx-list-item-after-bag.dx-list-reorder-handle-container {
  display: none !important;
}

.dx-list-item {
  display: inline-flex;
}

/*.dx-sortable-placeholder{
  border: 10px solid;
}*/

</style>

