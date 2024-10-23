<template>
  <div class="container-fluid">
    <div
        class="drop-zone"
        @drop="onDrop"
        @dragover.prevent
    >
      <GridLayout
          v-model:layout="gridLayout"
          :col-num="12"
          :row-height="30"
          class="min-vh-100"
          :is-draggable="true"
          :is-resizable="true"
          :responsive="true"
          :vertical-compact="true"
          @layout-updated="onLayoutUpdated"
      >
        <GridItem
            v-for="(element, index) in containerElements"
            :key="element.uniqueId"
            :x="element.x"
            :y="element.y"
            :i="element.uniqueId"
            :w="element.w || 6"
            :h="element.h || 1"
            @resize="resize"
            @move="move"
        >
          <div
              class="position-relative dropped-item"
              @mouseenter="showControlBar(index)"
              @mouseleave="hideControlBar()"
          >
            <div v-if="isHovered(index)" class="control-bar">
              <div class="col-count-overlay">{{ element.colspan }}</div>
              <div class="control-buttons">
                <button class="control-btn" @click="cloneItem(index)">
                  <i class="bi bi-copy"></i>
                </button>
                <button class="control-btn" @click="deleteItem(index)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
            <component :is="resolveComponent(element)" v-bind="element.props" />
          </div>
        </GridItem>
      </GridLayout>
    </div>

    <div v-if="containerElements.length === 0 && !store.isDragging" class="empty-placeholder">
      Drag items here to start building your form
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, reactive, ref } from 'vue';
import { GridLayout, GridItem} from 'vue3-grid-layout-next';
import { resolveControlComponent } from '../../form-components';
import { resolveDesignComponent } from '../design-elements';
import {ElementClassification, ElementWrapperProps, FormElement, GridLayoutItem} from '../../../types/builder';
import { useElementClone } from '../../../composables/useElementClone';
import { useBuilderStore } from '../../stores/builder-store';
import {LayoutItem} from 'vue3-grid-layout-next/dist/helpers/utils';
import {useUUID} from '../../../composables/useUUID';

defineProps<ElementWrapperProps>();
const store = useBuilderStore();
const gridLayout = ref<any[]>([]);

const containerElements = defineModel<GridLayoutItem[]>('containerElements', { required: true });

const state = reactive({
  hoveredItemIndex: null as number | null,
  resizingIndex: null as number | null,
  initialWidth: 0,
  startX: 0,
});

const resolveComponent = (element: FormElement): any => {
  return element.classification === ElementClassification.DESIGN
      ? resolveDesignComponent(element.type)
      : resolveControlComponent(element.type);
};


// Update layout when grid items are resized or repositioned
const onLayoutUpdated = (newLayout: LayoutItem[]): void => {
  newLayout.forEach((layoutItem: LayoutItem) => {

    const item = containerElements.value.find(x => x.uniqueId === layoutItem.i)!;
    item.x = layoutItem.x;
    item.y = layoutItem.y;
    item.colspan = layoutItem.w;
    item.w = layoutItem.w;
    item.h = layoutItem.h;
  });
};

const {generate} = useUUID();
// Handle the native drop event
const onDrop = (event: DragEvent): void => {
  const draggedElementData = event.dataTransfer?.getData('text/plain');
  if (draggedElementData) {
    const newElement = JSON.parse(draggedElementData); // Assuming element data is serialized
    newElement.x = 0;
    newElement.y = 0;
    newElement.uniqueId = generate();
    newElement.colspan = 6;
    newElement.w = 6;
    newElement.h = 1;
    containerElements.value.push(newElement);
    gridLayout.value.push({
      i: newElement.uniqueId,
      x: newElement.x!,
      y: newElement.y!,
      w: newElement.colspan!,
      h: 1,
    });
  }
};

const showControlBar = (itemIndex: number): void => {
  state.hoveredItemIndex = itemIndex;
};

const hideControlBar = (): void => {
  state.hoveredItemIndex = null;
};

const isHovered = (itemIndex: number): boolean => {
  return state.hoveredItemIndex === itemIndex;
};

const cloneItem = (itemIndex: number): void => {
  const element = containerElements.value[itemIndex];
  containerElements.value.push(useElementClone(element));
};

const deleteItem = (itemIndex: number): void => {
  containerElements.value.splice(itemIndex, 1);
  gridLayout.value.splice(itemIndex, 1);
};

const resize = (i: string | number, h: number, w: number): void => {
  const item = containerElements.value.find(x => x.uniqueId === i)!;
  item.h = h;
  item.w = w;
  item.colspan = w;
};

const move = (i: string | number, x: number, y: number): void => {
  const item = containerElements.value.find(x => x.uniqueId === i)!;
  item.x = x;
  item.y = y;
};
</script>

<style scoped>
:deep(.dropped-item) {
  cursor: grab;
  position: relative;
  touch-action: none;
}

:deep(.vue-grid-item){
  touch-action: none;
}

.control-bar {
  display: flex;
  max-width: 98%;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 255, 0, 0.1);
  border: 1px solid #ccc;
  padding: 5px;
  z-index: 1;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.col-count-overlay {
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: bold;
  color: #333;
}

.control-buttons {
  display: flex;
  gap: 5px;
}

.control-bar button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 5px;
  color: #333;
}

.control-bar button:hover {
  background-color: #ddd;
}

.empty-placeholder {
  padding: 20px;
  color: #888;
  text-align: center;
  font-size: 16px;
  border: 1px dashed #ccc;
  background-color: #f7f7f7;
  border-radius: 8px;
  pointer-events: none;
}
</style>













<!--<template>-->
<!--  <div class="container-fluid">-->
<!--    <div class="row">-->
<!--      <Draggable-->
<!--          v-model:list="containerElements"-->
<!--          :group="{ name: 'controls', clone: true, put: true }"-->
<!--          :class="cssClasses"-->
<!--          item-key="uniqueId"-->
<!--          @end="onDragEnd"-->
<!--          @start="onDragStart"-->
<!--          :clone="useElementClone"-->
<!--      >-->
<!--        <template #item="{ element, index } : {element: FormElement, index: number}">-->
<!--          <div class="position-relative dropped-item"-->
<!--               @mouseenter="showControlBar(index)"-->
<!--               @mouseleave="hideControlBar()">-->
<!--            &lt;!&ndash; Control Bar &ndash;&gt;-->
<!--            <div v-if="isHovered(index, null)" class="control-bar">-->
<!--              <button class="control-btn" @click="editItem(index)"><i class="bi bi-pencil"></i></button>-->
<!--              <button class="control-btn" @click="cloneItem(index)"><i class="bi bi-copy"></i></button>-->
<!--              <button class="control-btn" @click="deleteItem(index)"><i class="bi bi-trash"></i></button>-->
<!--            </div>-->

<!--            <component :is="resolveComponent(element)" v-bind="element.props"/>-->
<!--          </div>-->
<!--        </template>-->

<!--        &lt;!&ndash; Placeholder for Empty Dropzone (only show if no items and not dragging) &ndash;&gt;-->
<!--        <template #footer>-->
<!--          <div v-if="containerElements.length === 0 && !store.isDragging" class="empty-placeholder">-->
<!--            Drag items here to start building your form-->
<!--          </div>-->
<!--        </template>-->
<!--      </Draggable>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script lang="ts" setup>-->
<!--import {defineProps, reactive} from 'vue';-->
<!--import Draggable from 'vuedraggable';-->
<!--import {resolveControlComponent} from '../../form-components';-->
<!--import {resolveDesignComponent} from '../design-elements';-->
<!--import {ElementClassification, ElementWrapperProps, FormElement} from '../../../types/builder';-->
<!--import {useElementClone} from '../../../composables/useElementClone';-->
<!--import {useBuilderStore} from '../../stores/builder-store';-->

<!--const store = useBuilderStore();-->

<!--defineProps<ElementWrapperProps>();-->


<!--const state = reactive({-->
<!--  hoveredItemIndex: null as number | null,-->
<!--  hoveredSectionIndex: null as number | null-->
<!--});-->

<!--const containerElements = defineModel<FormElement[]>('containerElements', {required: true});-->



<!--const resolveComponent = (element: FormElement) => {-->
<!--  return element.classification === ElementClassification.DESIGN-->
<!--      ? resolveDesignComponent(element.type)-->
<!--      : resolveControlComponent(element.type);-->
<!--};-->


<!--// Show control bar on hover-->
<!--const showControlBar = (itemIndex: number) => {-->
<!--  state.hoveredItemIndex = itemIndex;-->
<!--};-->


<!--// Hide control bar when mouse leaves-->
<!--const hideControlBar = () => {-->
<!--  state.hoveredItemIndex = null;-->
<!--  state.hoveredSectionIndex = null;-->
<!--};-->

<!--// Check if control bar should be shown for a specific item-->
<!--const isHovered = (itemIndex: number, sectionIndex: number | null) => {-->
<!--  return state.hoveredItemIndex === itemIndex && state.hoveredSectionIndex === sectionIndex;-->
<!--};-->

<!--// Clone an item-->
<!--const cloneItem = (itemIndex: number) => {-->
<!--  const element = containerElements.value[itemIndex];-->
<!--  containerElements.value.push(useElementClone(element));-->
<!--};-->

<!--// Delete an item-->
<!--const deleteItem = (itemIndex: number) => {-->
<!--  containerElements.value.splice(itemIndex, 1);-->
<!--};-->

<!--// Edit an item (this can be linked to a modal or an inline editor)-->
<!--const editItem = (itemIndex: number) => {-->
<!--  const element = containerElements.value[itemIndex];-->

<!--  console.log('Editing item:', element);-->
<!--};-->


<!--// Handle when drag starts-->
<!--const onDragStart = () => {-->
<!--  store.isDragging = true;-->
<!--};-->

<!--// Handle when drag ends (reset state if needed)-->
<!--const onDragEnd = () => {-->
<!--  store.isDragging = false;-->
<!--  console.log('Drag Ended');-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--.dropped-item {-->
<!--  cursor: grab;-->
<!--  position: relative;-->
<!--}-->

<!--.control-bar {-->
<!--  position: absolute;-->
<!--  top: 10px;-->
<!--  right: 10px;-->
<!--  display: flex;-->
<!--  gap: 5px;-->
<!--  background-color: rgba(255, 255, 255, 0.9);-->
<!--  border: 1px solid #ccc;-->
<!--  padding: 5px;-->
<!--  z-index: 1;-->
<!--  border-radius: 5px;-->
<!--  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);-->
<!--}-->

<!--.control-bar button {-->
<!--  background-color: transparent;-->
<!--  border: none;-->
<!--  cursor: pointer;-->
<!--  font-size: 14px;-->
<!--  padding: 5px;-->
<!--  color: #333;-->
<!--}-->

<!--.control-bar button:hover {-->
<!--  background-color: #ddd;-->
<!--}-->

<!--.empty-placeholder {-->
<!--  padding: 20px;-->
<!--  color: #888;-->
<!--  text-align: center;-->
<!--  font-size: 16px;-->
<!--  border: 1px dashed #ccc;-->
<!--  background-color: #f7f7f7;-->
<!--  border-radius: 8px;-->
<!--  pointer-events: none; /* Ensure placeholder doesn't block interaction */-->
<!--}-->


<!--:deep(.dx-widget input) {-->
<!--  cursor: grab;-->
<!--}-->
<!--</style>-->


<!--<template>-->
<!--  <div class="container-fluid">-->
<!--    <div class="row">-->
<!--      <Draggable-->
<!--          v-model:list="containerElements"-->
<!--          :group="{ name: 'controls', clone: true, put: true }"-->
<!--          :class="cssClasses"-->
<!--          item-key="uniqueId"-->
<!--          @end="onDragEnd"-->
<!--          @start="onDragStart"-->
<!--          :clone="useElementClone"-->
<!--      >-->
<!--        <template #item="{ element, index } : {element: FormElement, index: number}">-->
<!--          <div-->
<!--              class="position-relative dropped-item"-->
<!--              @mouseenter="showControlBar(index)"-->
<!--              @mouseleave="hideControlBar()"-->
<!--          >-->
<!--            &lt;!&ndash; Control Bar &ndash;&gt;-->
<!--            <div v-if="isHovered(index, null)" class="control-bar">-->
<!--              <button class="control-btn" @click="editItem(index)">-->
<!--                <i class="bi bi-pencil"></i>-->
<!--              </button>-->
<!--              <button class="control-btn" @click="cloneItem(index)">-->
<!--                <i class="bi bi-copy"></i>-->
<!--              </button>-->
<!--              <button class="control-btn" @click="deleteItem(index)">-->
<!--                <i class="bi bi-trash"></i>-->
<!--              </button>-->
<!--            </div>-->

<!--            &lt;!&ndash; Render the dynamic form element &ndash;&gt;-->
<!--            <component :is="resolveComponent(element)" v-bind="element.props" />-->
<!--          </div>-->
<!--        </template>-->

<!--        &lt;!&ndash; Placeholder for Empty Dropzone (only show if no items and not dragging) &ndash;&gt;-->
<!--        <template #footer>-->
<!--          <div-->
<!--              v-if="containerElements.length === 0 && !store.isDragging && showDefaultPlaceholder"-->
<!--              class="empty-placeholder"-->
<!--          >-->
<!--            Drag items here to start building your form-->
<!--          </div>-->
<!--        </template>-->
<!--      </Draggable>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script lang="ts" setup>-->
<!--import { defineProps, reactive } from 'vue';-->
<!--import Draggable from 'vuedraggable';-->
<!--import { resolveControlComponent } from '../../form-components';-->
<!--import { resolveDesignComponent } from '../design-elements';-->
<!--import { ElementClassification, ElementWrapperProps, FormElement } from '../../../types/builder';-->
<!--import { useElementClone } from '../../../composables/useElementClone';-->
<!--import { useBuilderStore } from '../../stores/builder-store';-->


<!--defineProps<ElementWrapperProps>();-->

<!--const store = useBuilderStore();-->

<!--const state = reactive({-->
<!--  hoveredItemIndex: null as number | null,-->
<!--  hoveredSectionIndex: null as number | null-->
<!--});-->


<!--const containerElements = defineModel<FormElement[]>('containerElements', { required: true });-->

<!--const resolveComponent = (element: FormElement) => {-->
<!--  return element.classification === ElementClassification.DESIGN-->
<!--      ? resolveDesignComponent(element.type)-->
<!--      : resolveControlComponent(element.type);-->
<!--};-->


<!--const showControlBar = (itemIndex: number) => {-->
<!--  state.hoveredItemIndex = itemIndex;-->
<!--};-->

<!--// Hide control bar when mouse leaves-->
<!--const hideControlBar = () => {-->
<!--  state.hoveredItemIndex = null;-->
<!--  state.hoveredSectionIndex = null;-->
<!--};-->

<!--// Check if control bar should be shown for a specific item-->
<!--const isHovered = (itemIndex: number, sectionIndex: number | null) => {-->
<!--  return state.hoveredItemIndex === itemIndex && state.hoveredSectionIndex === sectionIndex;-->
<!--};-->

<!--// Clone an item-->
<!--const cloneItem = (itemIndex: number) => {-->
<!--  const element = containerElements.value[itemIndex];-->
<!--  containerElements.value.push(useElementClone(element));-->
<!--};-->

<!--// Delete an item-->
<!--const deleteItem = (itemIndex: number) => {-->
<!--  containerElements.value.splice(itemIndex, 1);-->
<!--};-->

<!--// Edit an item (this can be linked to a modal or an inline editor)-->
<!--const editItem = (itemIndex: number) => {-->
<!--  const element = containerElements.value[itemIndex];-->

<!--  console.log('Editing item:', element);-->
<!--};-->

<!--// Handle when drag starts-->
<!--const onDragStart = () => {-->
<!--  store.isDragging = true;-->
<!--};-->

<!--// Handle when drag ends (reset state if needed)-->
<!--const onDragEnd = () => {-->
<!--  store.isDragging = false;-->
<!--  console.log('Drag Ended');-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--.dropped-item {-->
<!--  cursor: grab;-->
<!--  position: relative;-->
<!--}-->

<!--.control-bar {-->
<!--  position: absolute;-->
<!--  top: 10px;-->
<!--  right: 10px;-->
<!--  display: flex;-->
<!--  gap: 5px;-->
<!--  background-color: rgba(255, 255, 255, 0.9);-->
<!--  border: 1px solid #ccc;-->
<!--  padding: 5px;-->
<!--  z-index: 1;-->
<!--  border-radius: 5px;-->
<!--  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);-->
<!--}-->

<!--.control-bar button {-->
<!--  background-color: transparent;-->
<!--  border: none;-->
<!--  cursor: pointer;-->
<!--  font-size: 14px;-->
<!--  padding: 5px;-->
<!--  color: #333;-->
<!--}-->

<!--.control-bar button:hover {-->
<!--  background-color: #ddd;-->
<!--}-->

<!--.empty-placeholder {-->
<!--  padding: 20px;-->
<!--  color: #888;-->
<!--  text-align: center;-->
<!--  font-size: 16px;-->
<!--  border: 1px dashed #ccc;-->
<!--  background-color: #f7f7f7;-->
<!--  border-radius: 8px;-->
<!--  pointer-events: none; /* Ensure placeholder doesn't block interaction */-->
<!--}-->

<!--:deep(.dx-widget input) {-->
<!--  cursor: grab;-->
<!--}-->
<!--</style>-->
