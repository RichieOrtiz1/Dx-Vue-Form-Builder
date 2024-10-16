<template>
    <div class="builder">
        <div class="row">

            <div class="component-list col-md-2">
                <DxTabs :data-source="controlTabs" :selected-index="0" :ref="controlTabRef" key-expr="id"
                    styling-mode="secondary" @option-changed="tabSelectionChanged" />
                <DxList :data-source="buildElementsDataSource" key-expr="id" itemTemplate="listItemTemplate"
                    :search-enabled="true" :search-expr="['title', 'description']">
                    <template #listItemTemplate="{ data: item }">
                        <DraggableControlItem :descriptor="item" />
                    </template>

                    <DxItemDragging :data="buildElementsDataSource" group="formItemGroup" handle=".card"
                        @drag-start="onControlListDragStart($event)"   @drag-end="onControlListDragEnd($event)" drag-template="controlDragTemplate">
                    </DxItemDragging>

                    <template #controlDragTemplate="{ data }">
                        <component :is="data.itemData.control"></component>
                    </template>
                </DxList>
            </div>

            <div class="component-list col-md-8" key="formConfiguration">
                <DxScrollView>
                    <DxSortable class="drag-zone min-vh-100 d-flex flex-column form-config"  :data="formConfiguration.formElements"
                        @drag-start="onDragStart($event)" group="formItemGroup" @reorder="onItemDropped($event)"
                        @add="onFieldAdded($event)">

                        <div v-if="showDropZonePlaceHolder && !isDragging" draggable="false">
                            <div class="drop-zone-place-holder d-flex flex-column align-items-center justify-content-center"
                                style="height:50vh; border: 2px dashed black;">
                                <i class="bi bi-hand-index-thumb h1"></i>
                                <h1 class="d-flex">Drag Items Here</h1>
                            </div>
                        </div>

                        <div v-for="(field, index) in formConfiguration.formElements" :key="`ctrl-${index}`" :ref="`field-wrapper-${index}`"
                            class="field-edit-wrapper d-flex flex-column" 
                            :class="{ 
                            'editing' : editingField === field,   
                            'mb-2': field.type === 'control' 
                            }"
                         
                            @click="editField(field, index)">

                            <div class="control-bar">
                                <DxButtonGroup :items="fieldEditButtons" position="after"
                                    :key="generateKey(field, index + 1)" key-expr="operation" styling-mode="text"
                                    @item-click="fieldOperationSelected" />
                                <span class="fw-bold">Control Type: {{ field.title }}</span>
                            </div>

                            <div v-if="field.type === 'control'">
                                <component :id="field.uniqueId" :is="field.control" v-bind="field.props" :labelMode="formConfiguration.labelMode" :key="field.uniqueId"></component>
                            </div>
                            
                            <component v-if="field.type === 'design-element'" :id="field.uniqueId" :is="field.control" v-bind="field.props" :key="field.uniqueId"></component>
                        </div>
                    </DxSortable>
                </DxScrollView>
            </div>



        </div>
    </div>
</template>

<script>
import {
    DxDraggable,
    DxScrollView
} from 'devextreme-vue';

import DxTextBox from 'devextreme-vue/text-box'

import DxList, { DxItemDragging } from 'devextreme-vue/list';
import DxTabs from 'devextreme-vue/tabs';
import DxSortable from 'devextreme-vue/sortable'


import DxButtonGroup from 'devextreme-vue/button-group'
import themes from 'devextreme/ui/themes'

import DraggableControlItem from './DraggableControlItem.vue'
import { ComponentTypeDataSource } from '../configuration/form-components'
import { DesignElementsDataSource } from '../configuration/design-elements/design-elements'
import DataSource from 'devextreme/data/data_source'


themes.current("material.blue.light");
//themes.current("generic.light");


export default {
    name: 'Builder',
    components: {
        DxDraggable,
        DxSortable,
        DxScrollView,
        DxButtonGroup,
        DxList,
        DxItemDragging,
        DxTabs,
        DraggableControlItem,
        DxTextBox
    },
    data() {
        return {
            isDragging: false,
            fieldEditButtons: [{
                icon: 'copy',
                hint: 'Clone',
                operation: 'Clone'

            }, {
                icon: 'trash',
                hint: 'Delete',
                operation: 'Delete'
            }],
            editingField: null,
            formConfiguration:{
                labelMode: 'outside',
                formElements: []
            },
            buildElementsDataSource: [],
            controlTabRef: 'controlTabRef',
            controlTabs: new DataSource({
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
            })
        }
    },
    methods: {
        onControlListDragStart(e) {
            this.isDragging = true;
            let dataSource = e.component.getDataSource().items();
            e.itemData = dataSource[e.fromIndex];
        },
        onControlListDragEnd(e){
            this.isDragging = false;
        },
        cloneFormItem(item) {
            let clonedItem = Object.assign({}, item);
            clonedItem.uniqueId = this.generateUniqueValue();
            return clonedItem;
        },
        onFieldAdded(e) {
            e.toData.splice(e.toIndex, 0, this.cloneFormItem(e.itemData));
        },
        onDragStart(e) {
            e.itemData = e.fromData[e.fromIndex];
        },
        onItemDropped(e) {
            e.fromData.splice(e.fromIndex, 1);
            e.toData.splice(e.toIndex, 0, e.itemData);
        },
        generateKey(item, index) {
            return `${item}${index}`
        },
        fieldOperationSelected(e) {
            let fields = this.formConfiguration.formElements;
            let selectedField = this.editingField;
            let index = fields.indexOf(selectedField);

            if (e.itemData.operation === 'Delete') {
                fields.splice(index, 1);
            } else {
                fields.splice(index + 1, 0, this.cloneFormItem(selectedField));
            }
        },
        editField(field, index) {
            this.editingField = field;
        },
        generateUniqueValue() {
            return Date.now() + Math.random();
        },
        hideConfigEditor() {
            this.editingField = null;
        },
        tabSelectionChanged(e) {
            if (e.name === 'selectedItem' && e.value !== e.previousValue) {
                this.buildElementsDataSource = e.value.dataSource;
            }
        }
    },
    mounted() {

    },
    created() {
        //this.$options.formbuildElementsDataSource = formbuildElementsDataSource;
    },
    computed: {
        showDropZonePlaceHolder() {
            return this.formConfiguration.formElements.length <= 0;
        }
    },
}
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


// .drag-zone {
//     min-height: 400px;
//     height: 100%;
// }

.card {
    margin: 5px
}

.control-bar {
    display: none;
}

@mixin edit-control {
    z-index: 100;
    background-color: transparent;
    border: 3px solid #5a52f0;
    position: relative;

    :hover {
        cursor: pointer;
    }

    .control-bar {
        display: flex;
        //flex-direction: column;
        position: relative;
        align-items: center;
    }
}

.form-config {
    margin-right: 100px;
    margin-left: 100px;
    margin-top: 50px;
    margin-bottom: 50px;
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

</style>
