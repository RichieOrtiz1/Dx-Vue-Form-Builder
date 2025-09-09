<template>
  <div
      class="custom-drop-zone container-fluid w-100"
      :class="cssClasses"
      @dragover.prevent="onContainerDragOver"
      @drop.prevent="onDropAtHover"
      @dragleave="onDragLeave"
  >
    <Placeholder v-if="childElements.length === 0" :highlight="isDragging" />

    <div class="row w-100 m-0 drop-row" ref="rowRef" style="padding-bottom: 50px; position: relative;">
      <!-- Put :key on the template per linter -->
      <template v-for="(field, index) in childElements" :key="field.uniqueId">
        <div
            :class="getColumnClass(field)"
            class="element-container"
            :ref="setItemEl(index)"
        >
          <div
              class="draggable-item position-relative"
              :class="{ hovered: hoveringIndex === index }"
              draggable="true"
              @dragstart="onDragStart(index, $event)"
              @dragend="onDragEnd"
              @mouseover="hoveredItemIndex = index"
              @mouseleave="hoveredItemIndex = null"
          >
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
                <button
                    class="btn btn-sm btn-light"
                    @click="decreaseColSpan(field)"
                    :disabled="!canDecreaseColumns(field)"
                    title="Decrease width"
                >
                  <i class="bi bi-arrow-bar-left"></i>
                </button>
                <span class="mx-2">{{ field.colspan || 12 }}</span>
                <button
                    class="btn btn-sm btn-light"
                    @click="increaseColSpan(field)"
                    :disabled="!canIncreaseColumns(field)"
                    title="Increase width"
                >
                  <i class="bi bi-arrow-bar-right"></i>
                </button>
              </div>
            </div>

            <div class="form-group mb-2">
              <component :is="resolveComponent(field)" v-bind="field.props" />
            </div>
          </div>
        </div>
      </template>

      <!-- Floating insertion indicator spanning the row -->
      <div
          v-if="hoveringIndex !== null"
          class="insertion-indicator"
          :style="indicatorStyle"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type ComponentPublicInstance } from 'vue';
import { useBuilderStore } from '../../stores/builder-store';
import { FormElement, ElementClassification } from '../../../types/builder';
import Placeholder from './Placeholder.vue';
import { resolveControlComponent } from '../../form-components';
import { resolveDesignComponent } from '../design-elements';

defineProps<{
  id: string;
  cssClasses?: string;
}>();

const childElements = defineModel<FormElement[]>({ required: true });
const store = useBuilderStore();
const { isDragging } = store;

const draggedIndex = ref<number | null>(null);
const hoveringIndex = ref<number | null>(null);
const hoveredItemIndex = ref<number | null>(null);

const rowRef = ref<HTMLElement | null>(null);

/** We store raw refs (Element | component instance); resolve to HTMLElement when needed */
type PossibleRef = Element | ComponentPublicInstance | null;
const itemEls = ref<PossibleRef[]>([]);

function setItemEl(index: number) {
  // NOTE: Vue's TS expects (el: Element | ComponentPublicInstance | null, refs?: Record<string, any>) => void
  return (el: PossibleRef) => {
    itemEls.value[index] = el;
  };
}

const resolveComponent = (element: FormElement) => {
  return element.classification === ElementClassification.CONTROL
      ? resolveControlComponent(element.type)
      : resolveDesignComponent(element.type);
};

// Column size utilities
const getColumnClass = (element: FormElement) => `col-${element.colspan || 12}`;
const canDecreaseColumns = (element: FormElement) => (element.colspan || 12) > 1;
const canIncreaseColumns = (element: FormElement) => (element.colspan || 12) < 12;

// Element actions
const cloneElement = (element: FormElement) => {
  const clonedElement = {
    ...element,
    uniqueId: crypto.randomUUID(),
    childComponents: element.childComponents ? [...element.childComponents] : undefined,
    columns: element.columns ? [...element.columns] : undefined,
  };
  const index = childElements.value.findIndex((el) => el.uniqueId === element.uniqueId);
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

// ---- Utilities ---------------------------------------------------------------
/** Safely resolve a stored ref to a real HTMLElement (handles component instances) */
function toHTMLElement(node: PossibleRef): HTMLElement | null {
  if (!node) return null;
  if (node instanceof Element) return node as HTMLElement;
  // component instance: its root is $el
  const el = (node as ComponentPublicInstance).$el as Element | undefined;
  return el instanceof Element ? (el as HTMLElement) : null;
}

// ---- DnD core ---------------------------------------------------------------
function onDragStart(index: number, event: DragEvent) {
  if (!event.dataTransfer) return;
  draggedIndex.value = index;
  store.isDragging = true;

  event.dataTransfer.setData('text/plain', String(index));
  event.dataTransfer.setData('application/x-internal-index', String(index));
  event.dataTransfer.effectAllowed = 'move';
}

function onDragEnd() {
  hardReset();
}

// Big target: compute insert index from mouse position
function onContainerDragOver(event: DragEvent) {
  event.preventDefault();
  store.isDragging = true;

  // Cursor feedback: copy for external JSON, else move
  if (event.dataTransfer) {
    const isExternal = event.dataTransfer.types?.includes('application/json');
    event.dataTransfer.dropEffect = isExternal ? 'copy' : 'move';
  }

  const y = event.clientY;
  const els = itemEls.value.map(toHTMLElement).filter(Boolean) as HTMLElement[];

  if (!els.length) {
    hoveringIndex.value = 0;
    return;
  }

  // Find the first element whose midpoint is below the cursor.
  // Insert before it; otherwise at the end.
  let index = els.length;
  for (let i = 0; i < els.length; i++) {
    const r = els[i].getBoundingClientRect();
    const mid = r.top + r.height / 2;
    if (y < mid) {
      index = i;
      break;
    }
  }
  hoveringIndex.value = index;
}

function onDragLeave(event: DragEvent) {
  // Only reset if we truly left the whole drop area
  const root = event.currentTarget as HTMLElement;
  const to = event.relatedTarget as Node | null;
  if (root && to && !root.contains(to)) {
    hardReset();
  }
}

function onDropAtHover(event: DragEvent) {
  event.preventDefault();

  const dropIndex = hoveringIndex.value ?? childElements.value.length;

  // INTERNAL MOVE?
  let sourceIndex: number | null = draggedIndex.value;
  if (sourceIndex == null) {
    const s = event.dataTransfer?.getData('text/plain');
    sourceIndex = s != null && s !== '' ? parseInt(s, 10) : null;
  }

  if (sourceIndex != null && !Number.isNaN(sourceIndex)) {
    if (sourceIndex !== dropIndex) {
      const items = [...childElements.value];
      const [moved] = items.splice(sourceIndex, 1);
      const actualDrop = dropIndex > sourceIndex ? dropIndex - 1 : dropIndex;
      items.splice(actualDrop, 0, moved);
      childElements.value = items;
    }
    hardReset();
    return;
  }

  // EXTERNAL INSERT?
  const dt = event.dataTransfer;
  if (dt?.types?.includes('application/json')) {
    try {
      const raw = dt.getData('application/json');
      if (raw) {
        const parsed = JSON.parse(raw) as FormElement;
        if (isValidFormElement(parsed)) {
          const newElement: FormElement = { ...parsed, uniqueId: crypto.randomUUID() };
          const items = [...childElements.value];
          items.splice(dropIndex, 0, newElement);
          childElements.value = items;
        }
      }
    } catch (e) {
      console.warn('Invalid external drop payload:', e);
    }
  }

  hardReset();
}

function hardReset() {
  draggedIndex.value = null;
  hoveringIndex.value = null;
  hoveredItemIndex.value = null;
  store.isDragging = false;
}

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

// ---- Indicator position ------------------------------------------------------
const indicatorStyle = computed(() => {
  if (hoveringIndex.value === null || !rowRef.value) return {};
  const rowRect = rowRef.value.getBoundingClientRect();

  if (hoveringIndex.value >= childElements.value.length) {
    const lastEl = toHTMLElement(itemEls.value[childElements.value.length - 1]);
    const y = lastEl
        ? lastEl.getBoundingClientRect().bottom - rowRect.top
        : rowRect.height;
    return { top: `${y}px` };
  }

  const target = toHTMLElement(itemEls.value[hoveringIndex.value]);
  if (!target) return {};
  const tRect = target.getBoundingClientRect();
  return { top: `${tRect.top - rowRect.top}px` };
});
</script>

<style lang="scss" scoped>
.custom-drop-zone {
  min-height: 300px;
  border: 2px dashed #ccc;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  padding-bottom: 25px;
  user-select: none;
}

.element-container {
  padding: 6px 4px;
  height: fit-content;
  position: relative;
}

.draggable-item {
  background: white;
  padding: 10px;
  border: 1px solid #ddd;
  cursor: move;
  transition: box-shadow 0.2s ease, transform 0.1s ease;
  position: relative;
  min-height: 72px;

  &:hover {
    outline: 2px dashed #007bff;
    outline-offset: -2px;
    z-index: 1;
  }

  &.hovered {
    box-shadow: 0 0 0 2px #007bff33 inset;
  }
}

/* Full-width insertion bar that follows the cursor */
.insertion-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
  border-top: 3px solid #007bff;
  pointer-events: none;
  box-shadow: 0 0 6px rgba(0, 123, 255, 0.35);
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

.btn-group .btn,
.col-size-controls .btn {
  &:hover {
    background-color: #e9ecef;
  }
}
</style>
