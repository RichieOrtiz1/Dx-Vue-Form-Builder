<template>
  <div
      ref="rowRef"
      :class="cssClasses"
      :data-cid="containerId"
      class="custom-drop-zone container-fluid w-100"
      @dragenter.stop="onDragEnter"
      @dragover.prevent.stop="onContainerDragOver"
      @drop.prevent.stop="onDropAtHover"
      @dragleave.stop="onDragLeave"
  >
    <Placeholder
        v-if="showDefaultPlaceholder && childElements.length === 0"
        :highlight="isDragging"
    />

    <div class="row w-100 m-0 drop-row"
         style=" position: relative;"
         ref="dropRowRef"
    >
      <template v-for="(field, index) in childElements" :key="field.uniqueId">
        <div
            :ref="setItemEl(index)"
            :class="getColumnClass(field)"
            class="element-container"
        >
          <div
              :class="{
              hovered: hoveringIndex === index,
              resizing: resizingIndex === index,
              selected: store.selectedId === field.uniqueId
              }"
              :draggable="resizingIndex !== index"
              class="draggable-item position-relative"
              @dragend="onDragEnd"
              @mouseleave="hoveredItemIndex = null"
              @mouseover="hoveredItemIndex = index"
              @click.stop="store.setSelected(field.uniqueId)"
              @dragstart.stop="onDragStart(index, $event)"
          >
            <!-- Toolbar -->
            <div
                v-show="(hoveredItemIndex === index || store.selectedId === field.uniqueId) && resizingIndex !== index"
                class="element-controls"
            >
              <div class="btn-group">
                <button class="btn btn-sm btn-light" title="Clone" @click.stop="cloneElement(field)">
                  <i class="bi bi-files"></i>
                </button>
                <button class="btn btn-sm btn-light" title="Edit" @click.stop="editElement(field)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-light" title="Remove" @click.stop="removeElement(index)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
              <div class="ms-2 badge bg-light text-dark border small">
                {{ resizingIndex === index ? tentativeColspan : currentCols(field) }} / 12
              </div>
            </div>

            <!-- Preview -->
            <div class="form-group">
              <div
                  :class="{ 'is-control': field.classification === ElementClassification.CONTROL }"
                  class="preview-field"
              >
                <component :is="resolveComponent(field)" v-bind="componentProps(field)"/>
              </div>
            </div>

            <!-- Left resize handle -->
            <div
                v-if="useBothSidesForResize"
                class="resize-handle left"
                title="Drag to resize width"
                @mousedown.stop.prevent="(e) => onResizeStart(index, e, 'left')"
                @touchstart.stop.prevent="(e) => onResizeStart(index, e, 'left')"
            />

            <!-- Right resize handle -->
            <div
                class="resize-handle right"
                title="Drag to resize width"
                @mousedown.stop.prevent="(e) => onResizeStart(index, e, 'right')"
                @touchstart.stop.prevent="(e) => onResizeStart(index, e, 'right')"
            />

            <div v-if="resizingIndex === index" class="resize-badge">
              {{ tentativeColspan }} / 12
            </div>
          </div>
        </div>
      </template>

      <div
          v-show="hoveringIndex !== null && enterCount > 0"
          class="insertion-indicator"
          :class="{ active: hoveringIndex !== null && enterCount > 0 }"
          :style="indicatorStyle"
      >
        <span class="indicator-label">Drop it here</span>
      </div>
    </div>
  </div>
</template>


<script lang="ts" setup>
import {ref, computed, nextTick, type ComponentPublicInstance, onMounted, onBeforeUnmount} from 'vue';
import {useBuilderStore} from '../../stores/builder-store';
import {FormElement, ElementClassification} from '../../../types/builder';
import Placeholder from './Placeholder.vue';
import {resolveControlComponent} from '../../form-components';
import {resolveDesignComponent} from '../design-elements';
import {useRafThrottle} from '../../../composables/useRafThrottle';
import {useAutoScroll} from '../../../composables/useAutoScroll';
import {cloneElementDeep} from '../../../util/clone';
import {createFormElement} from '../../../types/factories';

const props = withDefaults(defineProps<{
  id: string;
  containerId: string;
  cssClasses?: string;
  showDefaultPlaceholder?: boolean;
  useBothSidesForResize?: boolean;
}>(), {
 useBothSidesForResize: false,
});

const childElements = defineModel<FormElement[]>({required: true});

const store = useBuilderStore();
const {isDragging} = store;

const draggedIndex = ref<number | null>(null);
const hoveringIndex = ref<number | null>(null);
const hoveredItemIndex = ref<number | null>(null);


const enterCount = ref(0);

const rowRef = ref<HTMLElement | null>(null);
let autoScroll: ReturnType<typeof useAutoScroll> | null = null;
onMounted(() => {
  if (rowRef.value) autoScroll = useAutoScroll(rowRef.value);
});
onBeforeUnmount(() => {
  teardownResizeListeners();
});

type PossibleRef = Element | ComponentPublicInstance | null;
const itemEls = ref<PossibleRef[]>([]);

const setItemEl = (index: number) => (el: PossibleRef) => {
  itemEls.value[index] = el;
};

const resolveComponent = (el: FormElement) =>
    el.classification === ElementClassification.CONTROL
        ? resolveControlComponent(el.type)
        : resolveDesignComponent(el.type);

/* ---------- width helpers + live preview ---------- */
const liveColspan = ref<Record<string, number>>({});
const colNum = (cs: FormElement['colspan']): number =>
    typeof cs === 'number' ? cs : 12;

const currentCols = (el: FormElement) =>
    liveColspan.value[el.uniqueId] ?? colNum(el.colspan);

const getColumnClass = (el: FormElement) => `col-${currentCols(el)}`;

/* ---------- element ops ---------- */
const cloneElement = (el: FormElement) => {
  const cloned = cloneElementDeep(el);
  const i = childElements.value.findIndex((x) => x.uniqueId === el.uniqueId);
  store.pushHistory?.();
  childElements.value.splice(i + 1, 0, cloned);
};
const editElement = (el: FormElement) => store.setEditingElement(el);
const removeElement = (index: number) => {
  store.pushHistory?.();
  childElements.value.splice(index, 1);
};

/* ---------- utils ---------- */
const toHTMLElement = (node: PossibleRef): HTMLElement | null => {
  if (!node) return null;
  if (node instanceof Element) return node as HTMLElement;
  const el = (node as ComponentPublicInstance).$el as Element | undefined;
  return el instanceof Element ? (el as HTMLElement) : null;
};

/* ---------- DnD ---------- */
const onDragEnter = () => {
  enterCount.value++;
  store.isDragging = true;
  console.debug('[enter]', props.containerId);
};

const onDragStart = (index: number, e: DragEvent) => {
  if (resizingIndex.value !== null) {
    e.preventDefault();
    return;
  }
  if (!e.dataTransfer) return;

  const uid = childElements.value[index]?.uniqueId;
  draggedIndex.value = index;

  store.startInternalDrag?.({
    kind: 'internal',
    sourceContainerId: props.containerId,
    sourceUniqueId: uid,
    take: () => {
      const i = childElements.value.findIndex((el) => el.uniqueId === uid);
      if (i >= 0) {
        const [moved] = childElements.value.splice(i, 1);
        return moved;
      }
    },
  });

  e.dataTransfer.setData('text/plain', String(index));
  e.dataTransfer.setData('application/x-internal-index', String(index));
  e.dataTransfer.effectAllowed = 'move';
};

const onDragEnd = () => {
  endDragCleanup();
};

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
    if (y < mid) {
      index = i;
      break;
    }
  }
  hoveringIndex.value = index;
  autoScroll?.onMove(y);
});

const onContainerDragOver = (e: DragEvent) => {
  handleDragOver(e);
  rowRef.value?.classList.add('dragging');
  console.debug('[over]', props.containerId, e.dataTransfer?.types);
};

const endDragCleanup = () => {
  hoveringIndex.value = null;
  hoveredItemIndex.value = null;
  draggedIndex.value = null;
  enterCount.value = 0;

  store.clearDrag?.();
  store.isDragging = false;

  autoScroll?.stop();
  rowRef.value?.classList.remove('dragging');
};

const onDragLeave = () => {
  // Only clear local hints — NOT the global drag.
  enterCount.value = Math.max(0, enterCount.value - 1);
  rowRef.value?.classList.remove('dragging');
  if (enterCount.value === 0) {
    hoveringIndex.value = null;
    autoScroll?.stop();
  }
};

const onDropAtHover = (e: DragEvent) => {
  e.preventDefault();

  const dropIndex = hoveringIndex.value ?? childElements.value.length;
  const payload = store.drag;

  // ---------- INTERNAL MOVE ----------
  if (payload?.kind === 'internal') {
    if (payload.sourceContainerId === props.containerId) {
      // reorder within same container
      let sourceIndex: number | null = draggedIndex.value;
      if (sourceIndex == null) {
        const s =
            e.dataTransfer?.getData('application/x-internal-index') ||
            e.dataTransfer?.getData('text/plain');
        sourceIndex = s ? parseInt(s, 10) : null;
      }
      if (sourceIndex != null && sourceIndex !== dropIndex) {
        store.pushHistory?.();
        const items = [...childElements.value];
        const [moved] = items.splice(sourceIndex, 1);
        const actual = dropIndex > sourceIndex ? dropIndex - 1 : dropIndex;
        items.splice(actual, 0, moved);
        store.setChildComponents(props.containerId, items);
      }
    } else {
      // move across containers
      const moved = payload.take?.();
      if (moved) {
        store.pushHistory?.();
        const items = [...childElements.value];
        items.splice(dropIndex, 0, moved);
        store.setChildComponents(props.containerId, items);
      }
    }
    endDragCleanup();
    return;
  }

  // ---------- EXTERNAL DROP (from palette) ----------
  const dt = e.dataTransfer;
  if (dt) {
    // safety: if our internal marker is present, don't treat as external
    if (dt.types?.includes('application/x-internal-index')) {
      endDragCleanup();
      return;
    }

    try {
      let def: any | null = null;

      // Prefer our custom MIME
      if (dt.types?.includes('application/x-builder-def')) {
        const raw = dt.getData('application/x-builder-def');
        if (raw) def = JSON.parse(raw);
        // Fallback to JSON (older palettes)
      } else if (dt.types?.includes('application/json')) {
        const raw = dt.getData('application/json');
        if (raw) def = JSON.parse(raw);
      }

      if (def) {
        const newEl = createFormElement(def);
        store.pushHistory?.();
        const items = [...childElements.value];
        items.splice(dropIndex, 0, newEl);
        store.setChildComponents(props.containerId, items);
      }
    } catch (err) {
      console.warn('Invalid external drop payload:', err);
    }
  }

  endDragCleanup();
};


/* ---------- RESIZE (live) ---------- */
const resizingIndex = ref<number | null>(null);
const startX = ref(0);
const startColspan = ref(12);
const tentativeColspan = ref(12);
const colWidthPx = ref(0);

const computeColWidth = () => {
  const row = rowRef.value;
  if (!row) return;
  const w = row.clientWidth;
  colWidthPx.value = Math.max(1, w / 12);
};

const resizeSide = ref<'left' | 'right' | null>(null);

const onResizeStart = (index: number, evt: MouseEvent | TouchEvent, side: 'left' | 'right') => {
  computeColWidth();
  const el = childElements.value[index];
  resizingIndex.value = index;
  resizeSide.value = side;
  startColspan.value = currentCols(el);
  tentativeColspan.value = startColspan.value;
  startX.value = 'touches' in evt ? evt.touches[0].clientX : evt.clientX;

  liveColspan.value[el.uniqueId] = startColspan.value;

  document.body.classList.add('resizing-col');
  document.body.style.cursor = 'ew-resize';

  window.addEventListener('mousemove', onResizeMove as any, { passive: false });
  window.addEventListener('mouseup', onResizeEnd as any, { passive: false });
  window.addEventListener('touchmove', onResizeMove as any, { passive: false });
  window.addEventListener('touchend', onResizeEnd as any, { passive: false });
};

const onResizeMove = (evt: MouseEvent | TouchEvent) => {
  if (resizingIndex.value === null || !resizeSide.value) return;
  evt.preventDefault();

  const x = 'touches' in evt ? evt.touches[0].clientX : evt.clientX;
  const dx = x - startX.value;
  const colsDelta = Math.round(dx / Math.max(1, colWidthPx.value));

  let next: number;
  if (resizeSide.value === 'right') {
    next = Math.max(1, Math.min(12, startColspan.value + colsDelta));
  } else {
    // left side: inverse
    next = Math.max(1, Math.min(12, startColspan.value - colsDelta));
  }

  tentativeColspan.value = next;
  const el = childElements.value[resizingIndex.value];
  liveColspan.value[el.uniqueId] = next;
};

const onResizeEnd = async () => {
  if (resizingIndex.value === null) return;

  const idx = resizingIndex.value;
  const el = childElements.value[idx];
  const uid = el.uniqueId;
  const finalCols = Math.max(1, Math.min(12, tentativeColspan.value));
  const stored = colNum(el.colspan);

  if (stored !== finalCols) {
    store.pushHistory?.();
    el.colspan = finalCols;
  }

  liveColspan.value[uid] = finalCols;
  await nextTick();
  requestAnimationFrame(() => delete liveColspan.value[uid]);

  resizingIndex.value = null;
  resizeSide.value = null;
  tentativeColspan.value = 12;
  document.body.classList.remove('resizing-col');
  document.body.style.cursor = '';
  teardownResizeListeners();
};

const teardownResizeListeners = () => {
  window.removeEventListener('mousemove', onResizeMove as any);
  window.removeEventListener('mouseup', onResizeEnd as any);
  window.removeEventListener('touchmove', onResizeMove as any);
  window.removeEventListener('touchend', onResizeEnd as any);
};



const dropRowRef = ref<HTMLElement | null>(null);

/* ---------- indicator position ---------- */
const indicatorStyle = computed(() => {
  const container = dropRowRef.value;
  if (hoveringIndex.value === null || !container) return {};

  const els = itemEls.value.map(toHTMLElement).filter(Boolean) as HTMLElement[];
  const containerRect = container.getBoundingClientRect();

  if (els.length === 0) {
    return { transform: 'translateY(0px)' };
  }

  const idx = Math.max(0, Math.min(hoveringIndex.value, els.length));
  const topOf = (el: HTMLElement) => el.getBoundingClientRect().top - containerRect.top;
  const bottomOf = (el: HTMLElement) => el.getBoundingClientRect().bottom - containerRect.top;

  let y: number;
  if (idx === 0) y = topOf(els[0]);
  else if (idx >= els.length) y = bottomOf(els[els.length - 1]);
  else y = bottomOf(els[idx - 1]);

  // optional nudge: y -= 1;
  return { transform: `translateY(${Math.round(y)}px)` };
});




const componentProps = (el: FormElement) =>
    el.classification === ElementClassification.DESIGN
        ? {...(el.props || {}), id: el.uniqueId}
        : el.props;

</script>

<style lang="scss" scoped>
/*.custom-drop-zone {
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

!* Default: neutral card *!
.draggable-item {
  position: relative;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  transition: border-color .15s ease, box-shadow .15s ease, background-color .15s ease;
  cursor: move;
  min-height: 72px;

  !* Show blue outline only when hovered OR selected OR resizing *!
  &.hovered,
  &.selected,
  &.resizing {
    background: #eef6ff;              !* light blue background *!
    border-color: #0d6efd;            !* bootstrap blue *!
    box-shadow: 0 0 0 2px rgba(13,110,253,.12);
  }
}

!* Toolbar pinned top-right *!
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

!* Insert indicator between items *!
.insertion-indicator {
  position: absolute; left: 0; right: 0; height: 0;
  border-top: 3px solid #0d6efd; pointer-events: none;
  box-shadow: 0 0 6px rgba(13,110,253,.35); z-index: 2;
}

!* Allow interactions by default (needed so Container/Column inner ElementWrappers can receive dragover/drop) *!
.preview-field { pointer-events: auto; }

!* Disable pointer events ONLY for control previews, so clicks don't hit inputs while dragging *!
.preview-field.is-control { pointer-events: none; }

!* Resize handle: only visible when hovered/selected/resizing *!
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

!* Live badge while resizing *!
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


:deep(.inner-container),
:deep(.column-drop) {
  min-height: 160px;
  padding: 8px;
}


.custom-drop-zone.dragging {
  outline: 2px dashed rgba(13,110,253,.35);
  outline-offset: 4px;
}

!* Prevent selecting text while resizing *!
:global(body.resizing-col) { user-select: none !important; }*/
</style>
