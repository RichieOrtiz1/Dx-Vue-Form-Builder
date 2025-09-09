
<template>
  <div class="custom-drop-zone container-fluid w-100"
       :class="cssClasses"
       @dragover.prevent="onDragOver"
       @drop.prevent="onExternalDrop"
       @dragleave="onDragLeave">

    <Placeholder v-if="childElements.length === 0" :highlight="isDragging" />

    <div class="row w-100 m-0" style="padding-bottom: 50px">
      <!-- Draggable Items -->
      <div v-for="(field, index) in childElements"
           :key="field.uniqueId"
           :class="getColumnClass(field)"
           class="element-container">
        <div class="draggable-item position-relative"
             :class="{ 'hovered': dragOverIndex === index }"
             draggable="true"
             @dragstart="onDragStart($event, index)"
             @dragover.prevent="onDragOverItem($event, index)"
             @drop.prevent="onDrop($event, index)"
             @dragend="onDragEnd"
             @mouseover="hoveredIndex = index"
             @mouseleave="hoveredIndex = null">

          <!-- Hover Controls -->
          <div v-show="hoveredIndex === index" class="element-controls">
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
              <button class="btn btn-sm btn-light"
                      @click="decreaseColSpan(field)"
                      :disabled="!canDecreaseColumns(field)"
                      title="Decrease width">
                <i class="bi bi-arrow-bar-left"></i>
              </button>
              <span class="mx-2">{{ field.colspan || 12 }}</span>
              <button class="btn btn-sm btn-light"
                      @click="increaseColSpan(field)"
                      :disabled="!canIncreaseColumns(field)"
                      title="Increase width">
                <i class="bi bi-arrow-bar-right"></i>
              </button>
            </div>
          </div>

          <div class="form-group mb-2">
            <component :is="resolveComponent(field)" v-bind="field.props" />
          </div>
        </div>
      </div>

      <!-- Drop area after the last item -->
      <div class="drop-zone-after"
           :class="{ 'hovered': dragOverIndex === childElements.length }"
           @dragover.prevent="onDragOverItem($event, childElements.length)"
           @drop.prevent="onDrop($event, childElements.length)">
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

// State management
const dragOverIndex = ref<number | null>(null);
const hoveredIndex = ref<number | null>(null);
const draggedElement = ref<{ index: number, element: FormElement } | null>(null);

// Component resolution
const resolveComponent = (element: FormElement) => {
  return element.classification === ElementClassification.CONTROL
      ? resolveControlComponent(element.type)
      : resolveDesignComponent(element.type);
};

// Column utilities
const getColumnClass = (element: FormElement) => `col-${element.colspan || 12}`;
const canDecreaseColumns = (element: FormElement) => (element.colspan || 12) > 1;
const canIncreaseColumns = (element: FormElement) => (element.colspan || 12) < 12;

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
  if (canDecreaseColumns(element)) {
    element.colspan = (element.colspan || 12) - 1;
  }
};

const increaseColSpan = (element: FormElement) => {
  if (canIncreaseColumns(element)) {
    element.colspan = (element.colspan || 12) + 1;
  }
};

// Drag and Drop handlers
const onDragStart = (event: DragEvent, index: number) => {
  if (!event.dataTransfer) return;

  draggedElement.value = {
    index,
    element: childElements.value[index]
  };

  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', index.toString());
  store.isDragging = true;
};

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.dataTransfer!.dropEffect = 'move';
};

const onDragOverItem = (event: DragEvent, index: number) => {
  event.preventDefault();
  dragOverIndex.value = index;
};

const onDrop = (event: DragEvent, dropIndex: number) => {
  event.preventDefault();
  event.stopPropagation();

  if (draggedElement.value === null) {
    handleExternalDrop(event);
    return;
  }

  const { index: sourceIndex, element: movedElement } = draggedElement.value;

  if (sourceIndex === dropIndex) return;

  const items = [...childElements.value];
  items.splice(sourceIndex, 1);
  items.splice(dropIndex > sourceIndex ? dropIndex - 1 : dropIndex, 0, movedElement);

  childElements.value = items;
  resetDragState();
};

const onDragEnd = () => {
  resetDragState();
};

const onDragLeave = (event: DragEvent) => {
  const dropZone = (event.currentTarget as HTMLElement).closest('.custom-drop-zone');
  const relatedTarget = event.relatedTarget as HTMLElement;

  if (!dropZone?.contains(relatedTarget)) {
    resetDragState();
  }
};

const handleExternalDrop = (event: DragEvent) => {
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) return;

  const rawData = dataTransfer.getData('application/json');
  if (!rawData) return;

  try {
    const newElement = JSON.parse(rawData) as FormElement;
    if (!isValidFormElement(newElement)) {
      console.warn('Invalid form element structure');
      return;
    }

    newElement.uniqueId = crypto.randomUUID();
    childElements.value.push(newElement);
  } catch (error) {
    console.warn('Invalid external drop payload:', error);
  }
};

const resetDragState = () => {
  draggedElement.value = null;
  dragOverIndex.value = null;
  store.isDragging = false;
};

// Validation
const isValidFormElement = (element: unknown): element is FormElement => {
  const formElement = element as FormElement;
  return (
      formElement !== null &&
      typeof formElement === 'object' &&
      'type' in formElement &&
      'classification' in formElement &&
      (formElement.classification === ElementClassification.CONTROL ||
          formElement.classification === ElementClassification.DESIGN)
  );
};
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

.drop-zone-after {
  min-height: 40px;
  width: 100%;
  border: 2px dashed transparent;
  margin-top: 10px;
  transition: border-color 0.2s;

  &.hovered {
    border-color: #007bff;
    background-color: #f0f8ff;
  }
}
</style>