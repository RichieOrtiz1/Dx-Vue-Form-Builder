
<template>
  <div class="custom-drop-zone container-fluid w-100" :class="cssClasses" @dragover.prevent @drop="onExternalDrop" @dragleave="onDragLeave">
    <Placeholder v-if="childElements.length === 0" :highlight="isDragging" />

    <div class="row w-100 m-0" style="padding-bottom: 50px">
      <div v-for="(field, index) in childElements"
           :key="field.uniqueId"
           :class="getColumnClass(field)"
           class="element-container"
      >
        <div class="draggable-item position-relative"
             :class="{ 'hovered': hoveringIndex === index }"
             draggable="true"
             @dragstart="onDragStart(index, $event)"
             @dragover.prevent="onDragOverItem($event, index)"
             @drop.prevent="onInternalDrop(index, $event)"
             @dragend="onDragLeave"
             @mouseover="hoveredItemIndex = index"
             @dragover="handleDragOver"
             @dragleave="handleDragLeave"
             @drop="handleDrop"
             @mouseleave="hoveredItemIndex = null">

          <!-- Hover Controls -->
          <div v-show="hoveredItemIndex === index" class="element-controls">
            <div class="btn-group">
              <button class="btn btn-sm btn-light" @click="cloneElement(field)" title="Clone">
                <i class="bi bi-files"></i>
              </button>
              <button class="btn btn-sm btn-light" @click="editElement(field)" title="Edit">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-light" @click="removeElement(index)" title="Remove">
                <i class="bi bi-trash"></i>
              </button>
            </div>
            <!-- Column Size Controls -->
            <div class="col-size-controls ms-2">
              <button class="btn btn-sm btn-light" @click="decreaseColSpan(field)"
                      :disabled="!canDecreaseColumns(field)" title="Decrease width">
                <i class="bi bi-arrow-bar-left"></i>
              </button>
              <span class="mx-2">{{ field.colspan || 12 }}</span>
              <button class="btn btn-sm btn-light" @click="increaseColSpan(field)"
                      :disabled="!canIncreaseColumns(field)" title="Increase width">
                <i class="bi bi-arrow-bar-right"></i>
              </button>
            </div>
          </div>

          <div class="form-group mb-2">
            <component :is="resolveComponent(field)" v-bind="field.props" />
          </div>
        </div>
      </div>
      <!-- Drop area AFTER the last item -->
      <div
          class="drop-zone-after"
          @dragover.prevent="onDragOverItem($event, childElements.length)"
          @drop.prevent="onInternalDrop(childElements.length, $event)"
      >
      </div>

    </div>
  </div>
</template>



<script setup lang="ts">
import { ref } from 'vue';
import { useBuilderStore } from '../../stores/builder-store';
import { FormElement, ElementClassification } from '../../../types/builder';
import Placeholder from './Placeholder.vue';
import { resolveControlComponent } from "../../form-components";
import { resolveDesignComponent } from "../design-elements";

const props = defineProps<{
  id: string;
  cssClasses?: string;
}>();

const childElements = defineModel<FormElement[]>({ required: true });
const store = useBuilderStore();
const { isDragging } = store;

const draggedIndex = ref<number | null>(null);
const hoveringIndex = ref<number | null>(null);
const hoveredItemIndex = ref<number | null>(null);


const resolveComponent = (element: FormElement) => {
  return element.classification === ElementClassification.CONTROL
      ? resolveControlComponent(element.type)
      : resolveDesignComponent(element.type);
};

// Column size utilities
const getColumnClass = (element: FormElement) => {
  return `col-${element.colspan || 12}`;
};

const canDecreaseColumns = (element: FormElement) => {
  return (element.colspan || 12) > 1;
};

const canIncreaseColumns = (element: FormElement) => {
  return (element.colspan || 12) < 12;
};

// Element actions
const cloneElement = (element: FormElement) => {
  const clonedElement = {
    ...element,
    uniqueId: crypto.randomUUID(),
    childComponents: element.childComponents ? [...element.childComponents] : undefined,
    columns: element.columns ? [...element.columns] : undefined
  };
  const index = childElements.value.findIndex(el => el.uniqueId === element.uniqueId);
  childElements.value.splice(index + 1, 0, clonedElement);
};

const editElement = (element: FormElement) => {
  store.setEditingElement(element);
};

const removeElement = (index: number) => {
  childElements.value.splice(index, 1);
};

const decreaseColSpan = (element: FormElement) => {
  if (!canDecreaseColumns(element)) return;
  element.colspan = (element.colspan || 12) - 1;
};

const increaseColSpan = (element: FormElement) => {
  if (!canIncreaseColumns(element)) return;
  element.colspan = (element.colspan || 12) + 1;
};

// Keep your existing drag and drop methods
function onDragStart(index: number, event: DragEvent) {
  if (!event.dataTransfer) return;

  draggedIndex.value = index;
  store.isDragging = true;

  event.dataTransfer.setData('text/plain', index.toString());
  event.dataTransfer.effectAllowed = 'move';
}

function onDragOverItem(event: DragEvent, index: number) {
  event.preventDefault();
  hoveringIndex.value = index;
}

function onDragLeave(event: DragEvent) {
  const dropZone = (event.currentTarget as HTMLElement).closest('.custom-drop-zone');
  const relatedTarget = event.relatedTarget as HTMLElement;

  if (!dropZone?.contains(relatedTarget)) {
    hoveringIndex.value = null;
    draggedIndex.value = null;
    store.isDragging = false;
  }
}

function onInternalDrop(dropIndex: number, event: DragEvent) {
  event.stopPropagation();

  let sourceIndex = draggedIndex.value;
  if (sourceIndex === null) {
    const transferredIndex = event.dataTransfer?.getData('text/plain');
    sourceIndex = transferredIndex ? parseInt(transferredIndex, 10) : null;
  }

  if (sourceIndex === null || sourceIndex === dropIndex) {
    return;
  }

  const items = [...childElements.value];
  const [movedItem] = items.splice(sourceIndex, 1);
  items.splice(dropIndex, 0, movedItem);
  childElements.value = items;

  draggedIndex.value = null;
  hoveringIndex.value = null;
  store.isDragging = false;
}

function onExternalDrop(event: DragEvent) {
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) return;

  const raw = dataTransfer.getData('application/json');
  if (!raw) return;

  try {
    const newElement = JSON.parse(raw) as FormElement;
    if (!newElement || typeof newElement !== 'object') return;

    if (!isValidFormElement(newElement)) {
      console.warn('Invalid form element structure');
      return;
    }

    newElement.uniqueId = crypto.randomUUID();
    childElements.value.push(newElement);
  } catch (error) {
    console.warn('Invalid external drop payload:', error);
  }

  onDragLeave(event);
}

const isDragOver = ref(false);

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
};

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false;
  // your existing drop handling
};


function isValidFormElement(element: unknown): element is FormElement {
  const formElement = element as FormElement;
  return (
      formElement !== null &&
      typeof formElement === 'object' &&
      'type' in formElement &&
      'classification' in formElement &&
      (formElement.classification === ElementClassification.CONTROL ||
          formElement.classification === ElementClassification.DESIGN)
  );
}
</script>

<style lang="scss" scoped>
.custom-drop-zone {
  min-height: 300px;
  border: 2px dashed #ccc;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  padding-bottom: 25px;
}


.element-container {
  padding: 4px;
  height: fit-content;

  &.drag-over::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background-color: #007bff;
    z-index: 1000;
  }

  &.drag-over::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 2px dashed #007bff;
    pointer-events: none;
    z-index: 999;
  }

}

.draggable-item {
  background: white;
  padding: 8px;
  border: 1px solid #ddd;
  cursor: move;
  transition: all 0.2s ease;
  position: relative;
  height: fit-content;
  min-height: 80px;

  &:hover {
    outline: 2px dashed #007bff;
    outline-offset: -2px;
    z-index: 1;
  }

  &.hovered {
    border-top: 2px solid #007bff;
    background-color: #f0f8ff;
    transform: translateY(2px);
  }
}

.element-controls {
  position: absolute;
  top: -30px;
  right: 0;
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 2px;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  &:hover {
    z-index: 3;
  }
}

.col-size-controls {
  display: flex;
  align-items: center;
}

// Add button hover effects
.btn-group .btn, .col-size-controls .btn {
  &:hover {
    background-color: #e9ecef;
  }
}

.drop-zone-after {
  min-height: 40px;
  width: 100%;
  border: 2px dashed transparent;
  margin-top: 10px;
  transition: border 0.2s;

  &.hovered {
    border-color: #007bff;
    background-color: #f0f8ff;
  }
}

</style>
