<template>
  <div
      class="custom-drop-zone container-fluid w-100"
      :class="cssClasses"
      @dragenter.stop="onDragEnter"
      @dragover.prevent.stop="onContainerDragOver"
      @drop.prevent.stop="onDropAtHover"
      @dragleave.stop="onDragLeave"
      ref="rowRef"
  >
    <Placeholder
        v-if="showDefaultPlaceholder && childElements.length === 0"
        :highlight="isDragging"
    />

    <div class="row w-100 m-0 drop-row" style="padding-bottom: 50px; position: relative;">
      <template v-for="(field, index) in childElements" :key="field.uniqueId">
        <div
            :class="getColumnClass(field)"
            class="element-container"
            :ref="setItemEl(index)"
        >
          <div
              class="draggable-item position-relative"
              :class="{
              hovered: hoveringIndex === index,
              resizing: resizingIndex === index,
              selected: selectedId === field.uniqueId
            }"
              :draggable="resizingIndex !== index"
              @click.stop="select(field.uniqueId)"
              @dragstart="onDragStart(index, $event)"
              @dragend="onDragEnd"
              @mouseover="hoveredItemIndex = index"
              @mouseleave="hoveredItemIndex = null"
          >
            <!-- Toolbar -->
            <div
                v-show="(hoveredItemIndex === index || selectedId === field.uniqueId) && resizingIndex !== index"
                class="element-controls"
            >
              <div class="btn-group">
                <button class="btn btn-sm btn-light" @click.stop="cloneElement(field)" title="Clone">
                  <i class="bi bi-files"></i>
                </button>
                <button class="btn btn-sm btn-light" @click.stop="editElement(field)" title="Edit">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-light" @click.stop="removeElement(index)" title="Remove">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
              <div class="ms-2 badge bg-light text-dark border small">
                {{ resizingIndex === index ? tentativeColspan : currentCols(field) }} / 12
              </div>
            </div>

            <!-- Preview -->
            <div class="form-group mb-2">
              <div class="preview-field">
                <component :is="resolveComponent(field)" v-bind="field.props" />
              </div>
            </div>

            <!-- Resize handle -->
            <div
                class="resize-handle"
                title="Drag to resize width"
                @mousedown.stop.prevent="onResizeStart(index, $event)"
                @touchstart.stop.prevent="onResizeStart(index, $event)"
            />
            <div v-if="resizingIndex === index" class="resize-badge">
              {{ tentativeColspan }} / 12
            </div>
          </div>
        </div>
      </template>

      <div v-if="hoveringIndex !== null && enterCount > 0" class="insertion-indicator" :style="indicatorStyle"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, type ComponentPublicInstance, onMounted, onBeforeUnmount, nextTick} from 'vue';
import { useBuilderStore } from '../../stores/builder-store';
import { FormElement, ElementClassification } from '../../../types/builder';
import Placeholder from './Placeholder.vue';
import { resolveControlComponent } from '../../form-components';
import { resolveDesignComponent } from '../design-elements';
import { useRafThrottle } from '../../../composables/useRafThrottle';
import { useAutoScroll } from '../../../composables/useAutoScroll';
import { cloneElementDeep } from '../../../util/clone';

const props = defineProps<{
  id: string;
  containerId: string;
  cssClasses?: string;
  showDefaultPlaceholder?: boolean;
}>();

const childElements = defineModel<FormElement[]>({ required: true });

const store = useBuilderStore();
const { isDragging } = store;

const draggedIndex = ref<number | null>(null);
const hoveringIndex = ref<number | null>(null);
const hoveredItemIndex = ref<number | null>(null);
const selectedId = ref<string | null>(null);
function select(id: string) { selectedId.value = id; }

const enterCount = ref(0);

const rowRef = ref<HTMLElement | null>(null);
let autoScroll: ReturnType<typeof useAutoScroll> | null = null;
onMounted(() => { if (rowRef.value) autoScroll = useAutoScroll(rowRef.value); });
onBeforeUnmount(() => { teardownResizeListeners(); });

type PossibleRef = Element | ComponentPublicInstance | null;
const itemEls = ref<PossibleRef[]>([]);
function setItemEl(index: number) { return (el: PossibleRef) => { itemEls.value[index] = el; }; }

const resolveComponent = (el: FormElement) =>
    el.classification === ElementClassification.CONTROL
        ? resolveControlComponent(el.type)
        : resolveDesignComponent(el.type);

/* ---------- width helpers + live preview ---------- */
const liveColspan = ref<Record<string, number>>({});
const colNum = (cs: FormElement['colspan']): number => typeof cs === 'number' ? cs : 12;
function currentCols(el: FormElement) {
  return liveColspan.value[el.uniqueId] ?? colNum(el.colspan);
}
const getColumnClass = (el: FormElement) => `col-${currentCols(el)}`;

/* ---------- element ops ---------- */
const cloneElement = (el: FormElement) => {
  const cloned = cloneElementDeep(el);
  const i = childElements.value.findIndex(x => x.uniqueId === el.uniqueId);
  store.pushHistory?.();
  childElements.value.splice(i + 1, 0, cloned);
};
const editElement = (el: FormElement) => store.setEditingElement(el);
const removeElement = (index: number) => { store.pushHistory?.(); childElements.value.splice(index, 1); };

/* ---------- utils ---------- */
function toHTMLElement(node: PossibleRef): HTMLElement | null {
  if (!node) return null;
  if (node instanceof Element) return node as HTMLElement;
  const el = (node as ComponentPublicInstance).$el as Element | undefined;
  return el instanceof Element ? (el as HTMLElement) : null;
}

/* ---------- DnD ---------- */
function onDragEnter() { enterCount.value++; }

function onDragStart(index: number, e: DragEvent) {
  if (!e.dataTransfer) return;
  const uid = childElements.value[index]?.uniqueId;
  draggedIndex.value = index;

  store.startInternalDrag?.({
    kind: 'internal',
    sourceContainerId: props.containerId,
    sourceUniqueId: uid,
    take: () => {
      const i = childElements.value.findIndex(el => el.uniqueId === uid);
      if (i >= 0) {
        const [moved] = childElements.value.splice(i, 1);
        return moved;
      }
    },
  });

  e.dataTransfer.setData('text/plain', String(index));
  e.dataTransfer.setData('application/x-internal-index', String(index));
  e.dataTransfer.effectAllowed = 'move';
}

function onDragEnd() {
  hardReset();
  autoScroll?.stop();
  enterCount.value = 0;
}

const handleDragOver = useRafThrottle((e: DragEvent) => {
  e.preventDefault();
  store.isDragging = true;

  if (e.dataTransfer) {
    const isExternal = e.dataTransfer.types?.includes('application/json');
    e.dataTransfer.dropEffect = isExternal ? 'copy' : 'move';
  }

  const y = e.clientY;
  const els = itemEls.value.map(toHTMLElement).filter(Boolean) as HTMLElement[];
  if (!els.length) {
    hoveringIndex.value = 0;
    autoScroll?.onMove(y);
    return;
  }

  let index = els.length;
  for (let i = 0; i < els.length; i++) {
    const r = els[i].getBoundingClientRect();
    const mid = r.top + r.height / 2;
    if (y < mid) { index = i; break; }
  }
  hoveringIndex.value = index;
  autoScroll?.onMove(y);
});
function onContainerDragOver(e: DragEvent) { handleDragOver(e); }

function onDragLeave() {
  enterCount.value = Math.max(0, enterCount.value - 1);
  if (enterCount.value === 0) {
    hardReset();
    autoScroll?.stop();
  }
}

function onDropAtHover(e: DragEvent) {
  e.preventDefault();
  const dropIndex = hoveringIndex.value ?? childElements.value.length;
  const payload = store.drag;

  // INTERNAL
  if (payload?.kind === 'internal') {
    if (payload.sourceContainerId === props.containerId) {
      let sourceIndex: number | null = draggedIndex.value;
      if (sourceIndex == null) {
        const s = e.dataTransfer?.getData('text/plain');
        sourceIndex = s ? parseInt(s, 10) : null;
      }
      if (sourceIndex != null && sourceIndex !== dropIndex) {
        store.pushHistory?.();
        const items = [...childElements.value];
        const [moved] = items.splice(sourceIndex, 1);
        const actual = dropIndex > sourceIndex ? dropIndex - 1 : dropIndex;
        items.splice(actual, 0, moved);
        childElements.value = items;
      }
    } else {
      const moved = payload.take?.();
      if (moved) {
        store.pushHistory?.();
        const items = [...childElements.value];
        items.splice(dropIndex, 0, moved);
        childElements.value = items;
      }
    }
    hardReset();
    autoScroll?.stop();
    enterCount.value = 0;
    return;
  }

  // EXTERNAL
  const dt = e.dataTransfer;
  if (dt?.types?.includes('application/json')) {
    try {
      const raw = dt.getData('application/json');
      if (raw) {
        const parsed = JSON.parse(raw) as FormElement;
        parsed.uniqueId = crypto.randomUUID();
        store.pushHistory?.();
        const items = [...childElements.value];
        items.splice(dropIndex, 0, parsed);
        childElements.value = items;

        if (!parsed.columns && parsed.props?.colCount && parsed.classification === ElementClassification.DESIGN) {
          parsed.columnCount = parsed.props.colCount;
          parsed.columns = Array.from({ length: parsed.props.colCount }, () => ({ childComponents: [] }));
        }
      }
    } catch (err) {
      console.warn('Invalid external drop payload:', err);
    }
  }

  hardReset();
  autoScroll?.stop();
  enterCount.value = 0;
}

function hardReset() {
  draggedIndex.value = null;
  hoveringIndex.value = null;
  hoveredItemIndex.value = null;
  store.clearDrag?.();
  store.isDragging = false;
}

/* ---------- RESIZE (live) ---------- */
const resizingIndex = ref<number | null>(null);
const startX = ref(0);
const startColspan = ref(12);
const tentativeColspan = ref(12);
const colWidthPx = ref(0);

function computeColWidth() {
  const row = rowRef.value;
  if (!row) return;
  const w = row.clientWidth;
  colWidthPx.value = Math.max(1, w / 12);
}

function onResizeStart(index: number, evt: MouseEvent | TouchEvent) {
  computeColWidth();
  const el = childElements.value[index];
  resizingIndex.value = index;
  startColspan.value = currentCols(el);
  tentativeColspan.value = startColspan.value;
  startX.value = 'touches' in evt ? evt.touches[0].clientX : (evt as MouseEvent).clientX;

  // seed live preview so the card moves immediately
  liveColspan.value[el.uniqueId] = startColspan.value;

  document.body.classList.add('resizing-col');
  document.body.style.cursor = 'ew-resize';

  window.addEventListener('mousemove', onResizeMove, { passive: false });
  window.addEventListener('mouseup', onResizeEnd, { passive: false });
  window.addEventListener('touchmove', onResizeMove, { passive: false });
  window.addEventListener('touchend', onResizeEnd, { passive: false });
}

function onResizeMove(evt: MouseEvent | TouchEvent) {
  if (resizingIndex.value === null) return;
  evt.preventDefault();

  const x = 'touches' in evt ? evt.touches[0].clientX : (evt as MouseEvent).clientX;
  const dx = x - startX.value;
  const colsDelta = Math.round(dx / Math.max(1, colWidthPx.value));
  const next = Math.max(1, Math.min(12, startColspan.value + colsDelta));

  tentativeColspan.value = next;

  // update live preview width
  const el = childElements.value[resizingIndex.value];
  liveColspan.value[el.uniqueId] = next;
}

async function onResizeEnd() {
  if (resizingIndex.value === null) return;

  const idx = resizingIndex.value;
  const el = childElements.value[idx];
  const uid = el.uniqueId;

  const finalCols = Math.max(1, Math.min(12, tentativeColspan.value));
  const stored = colNum(el.colspan);          // ← read the committed number only

  // Commit if changed (compare against the stored value, not currentCols/live)
  if (stored !== finalCols) {
    store.pushHistory?.();
    el.colspan = finalCols;                   // commit to reactive state
  }

  // Hold live preview at the final value through the patch to avoid a flash
  liveColspan.value[uid] = finalCols;

  // Wait for DOM/class update, then clear live state (or keep it — both OK)
  await nextTick();
  requestAnimationFrame(() => {
    delete liveColspan.value[uid];            // or keep it if you prefer
  });

  // Cleanup
  resizingIndex.value = null;
  tentativeColspan.value = 12;
  document.body.classList.remove('resizing-col');
  document.body.style.cursor = '';
  teardownResizeListeners();
}




function teardownResizeListeners() {
  window.removeEventListener('mousemove', onResizeMove as any);
  window.removeEventListener('mouseup', onResizeEnd as any);
  window.removeEventListener('touchmove', onResizeMove as any);
  window.removeEventListener('touchend', onResizeEnd as any);
}

/* ---------- indicator position ---------- */
const indicatorStyle = computed(() => {
  if (hoveringIndex.value === null || !rowRef.value) return {};
  const rowRect = rowRef.value.getBoundingClientRect();

  if (hoveringIndex.value >= childElements.value.length) {
    const lastEl = toHTMLElement(itemEls.value[childElements.value.length - 1]);
    const y = lastEl ? lastEl.getBoundingClientRect().bottom - rowRect.top : rowRect.height;
    return { top: `${y}px` };
  }

  const target = toHTMLElement(itemEls.value[hoveringIndex.value]);
  if (!target) return {};
  const tRect = target.getBoundingClientRect();
  return { top: `${tRect.top - rowRect.top}px` };
});
</script>

<style scoped lang="scss">
.custom-drop-zone {
  position: relative;
  min-height: 300px;
  padding: 25px;
  border: 2px dashed #ccc;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  user-select: none;
}

.element-container { height: fit-content; position: relative; }

/* Default: neutral card */
.draggable-item {
  position: relative;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  transition: border-color .15s ease, box-shadow .15s ease, background-color .15s ease;
  cursor: move;
  min-height: 72px;

  /* Show blue outline only when hovered OR selected OR resizing */
  &.hovered,
  &.selected,
  &.resizing {
    background: #eef6ff;              /* light blue background */
    border-color: #0d6efd;            /* bootstrap blue */
    box-shadow: 0 0 0 2px rgba(13,110,253,.12);
  }
}

/* Toolbar pinned top-right */
.element-controls {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 2px 4px;
  z-index: 3;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Insert indicator between items */
.insertion-indicator {
  position: absolute; left: 0; right: 0; height: 0;
  border-top: 3px solid #0d6efd; pointer-events: none;
  box-shadow: 0 0 6px rgba(13,110,253,.35); z-index: 2;
}

.preview-field { pointer-events: none; }

/* Resize handle: only visible when hovered/selected/resizing */
.resize-handle {
  position: absolute;
  top: 50%;
  right: -6px;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: #fff;
  border: 1px solid #6c757d;
  cursor: ew-resize;
  z-index: 4;
  opacity: 0;
  transition: opacity .12s ease, border-color .12s ease, background-color .12s ease;
}
.draggable-item.hovered .resize-handle,
.draggable-item.selected .resize-handle,
.draggable-item.resizing .resize-handle {
  opacity: 1;
  border-color: #0d6efd;
  background: #e7f1ff;
}

/* Live badge while resizing */
.resize-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 4;
  padding: 2px 6px;
  font-size: 12px;
  line-height: 1;
  background: #fff;
  border: 1px solid #0d6efd;
  border-radius: 4px;
  color: #0d6efd;
}

/* Prevent selecting text while resizing */
:global(body.resizing-col) { user-select: none !important; }
</style>

