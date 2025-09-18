<template>
  <div class="builder container-fluid py-2">
    <div class="row g-0 h-100">
      <!-- Sidebar / Palette -->
      <aside class="col-md-3 vh-100 d-flex flex-column bg-white border-end">
        <div class="custom-tabs px-2 pt-2 pb-1" role="tablist" aria-label="Builder palettes">
          <button
              v-for="(tab, index) in controlTabs"
              :key="tab.id"
              role="tab"
              :aria-selected="selectedTabIndex === index"
              :class="{ active: selectedTabIndex === index }"
              class="tab-button"
              @click="selectedTabIndex = index"
          >
            {{ tab.text }}
          </button>
        </div>

        <div class="px-2 pb-2">
          <input
              v-model="filterText"
              type="search"
              class="form-control form-control-sm"
              placeholder="Filter controls…"
              aria-label="Filter controls"
          />
        </div>

        <!-- Palette -->
        <div class="custom-list px-2" role="list">
          <div
              v-for="(item, i) in filteredPalette"
              :key="(item.type ?? item.title ?? 'item') + ':' + i"
              class="draggable-wrapper"
              draggable="true"
              :title="item.title"
              @dragstart="onPaletteDragStart(item, $event)"
          >
            <DraggableControlItem :descriptor="item" role="listitem" />
          </div>
        </div>
      </aside>

      <!-- Canvas -->
      <main class="col-md-9 d-flex flex-column p-3">
        <!-- Toolbar -->
        <!-- Toolbar -->
        <div class="d-flex align-items-center gap-2 mb-2">
          <button class="btn btn-sm btn-outline-secondary" :disabled="!store.canUndo" @click="store.undo()">
            <i class="bi bi-arrow-counterclockwise me-1"></i>Undo
          </button>
          <button class="btn btn-sm btn-outline-secondary" :disabled="!store.canRedo" @click="store.redo()">
            <i class="bi bi-arrow-clockwise me-1"></i>Redo
          </button>

          <!-- NEW: JSON button -->
          <button class="btn btn-sm btn-outline-secondary" @click="openSchema">
            <i class="bi bi-braces me-1"></i>JSON
          </button>

          <div class="ms-auto small text-muted">
            <span v-if="savedAt">Saved: {{ savedAt }}</span>
          </div>
        </div>

        <div class="form-canvas" @mousedown.self="store.setSelected(null)">
          <ElementWrapper
              :id="rootId"
              :container-id="rootId"
              v-model="store.formElements"
              :show-default-placeholder="true"
              css-classes="main-container"
          />
        </div>
      </main>
    </div>

    <!-- JSON modal -->
    <div v-if="showSchema" class="fb-modal-backdrop" @click.self="closeSchema">
      <div class="fb-modal" role="dialog" aria-modal="true" aria-label="Form JSON">
        <div class="fb-modal-header">
          <h6 class="m-0">Form JSON</h6>
          <button class="btn btn-sm btn-light" @click="closeSchema" title="Close">
            <i class="bi bi-x"></i>
          </button>
        </div>

        <div class="fb-modal-actions">
          <button class="btn btn-sm btn-outline-secondary" @click="copySchema">
            <i class="bi bi-clipboard me-1"></i>Copy
          </button>
          <button class="btn btn-sm btn-outline-secondary" @click="downloadSchema">
            <i class="bi bi-download me-1"></i>Download
          </button>
        </div>

        <pre class="fb-json"><code>{{ prettySchema }}</code></pre>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref, useId, computed, watch } from 'vue';
import themes from 'devextreme/ui/themes';
import DraggableControlItem from './DraggableControlItem.vue';
import { elementTypes } from '../configuration/form-components';
import { designElements } from '../configuration/design-elements/design-elements';
import { useBuilderStore } from '../configuration/stores/builder-store';
import ElementWrapper from '../configuration/design-elements/components/ElementWrapper.vue';
import { useUndoRedoHotkeys } from '../composables/useUndoRedoHotKeys';

// Theme (keep your existing DevExtreme theme)
themes.current('material.teal.light');

// Store
const store = useBuilderStore();

// Global hotkeys: Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, Ctrl+Y
useUndoRedoHotkeys(() => store.undo(), () => store.redo());

// Stable root id (computed once)
const rootId = useId();

// Tabs
const controlTabs = ref([
  { id: 0, text: 'Controls', dataSource: elementTypes },
  { id: 1, text: 'Design',   dataSource: designElements },
]);
const selectedTabIndex = ref(0);
const buildElementsDataSource = computed(() => controlTabs.value[selectedTabIndex.value].dataSource);

// Optional palette filter
const filterText = ref('');
const filteredPalette = computed(() => {
  const q = filterText.value.trim().toLowerCase();
  if (!q) return buildElementsDataSource.value;
  return buildElementsDataSource.value.filter(
      (x: any) =>
          (x.title && x.title.toLowerCase().includes(q)) ||
          (x.type && x.type.toLowerCase().includes(q)) ||
          (x.description && x.description.toLowerCase().includes(q))
  );
});

function onPaletteDragStart(item: any, event: DragEvent) {
  if (!event.dataTransfer) return;
  // Custom, unambiguous MIME for our palette
  event.dataTransfer.setData('application/x-builder-def', JSON.stringify(item));
  // (optional) Keep JSON for legacy, but not required
  event.dataTransfer.setData('application/json', JSON.stringify(item));
  // Plain text ONLY for OS drag visuals; we won't accept it in the drop
  event.dataTransfer.setData('text/plain', String(item.type || item.title || 'palette-item'));
  event.dataTransfer.effectAllowed = 'copy';
}
// Autosave (debounced)
const savedAt = ref<string | null>(null);
let saveTimer: number | undefined;
watch(
    () => store.formElements,
    (val) => {
      clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        localStorage.setItem('builder:autosave', JSON.stringify(val));
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        savedAt.value = `${hh}:${mm}`;
      }, 400);
    },
    { deep: true }
);


// JSON modal state
const showSchema = ref(false);
const prettySchema = computed(() => JSON.stringify(store.formElements, null, 2));

const openSchema = () => { showSchema.value = true; };
const closeSchema = () => { showSchema.value = false; };

const copySchema = async () => {
  try {
    await navigator.clipboard.writeText(prettySchema.value);
  } catch {
    // fallback: select text
    const sel = window.getSelection?.();
    if (!sel) return;
    const range = document.createRange();
    const el = document.querySelector('.fb-json');
    if (!el) return;
    range.selectNodeContents(el);
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand?.('copy');
    sel.removeAllRanges();
  }
};

const downloadSchema = () => {
  const blob = new Blob([prettySchema.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `form-schema-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

</script>

<style lang="scss" scoped>
.builder {
  min-height: 100vh;
}

.custom-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  gap: .25rem;
}
.tab-button {
  padding: 8px 12px;
  cursor: pointer;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-weight: 600;
  color: #6b7280;
}
.tab-button.active {
  border-bottom: 2px solid #0d6efd;
  color: #0d6efd;
}

.custom-list {
  overflow-y: auto;
  height: 100%;
  padding-bottom: 12px;
}

.form-canvas {
  position: relative;
  background-color: #fff;
  height: calc(100vh - 72px);
  padding: 20px;
  overflow-y: auto;
  border: 1px dashed #e5e7eb;
  border-radius: .5rem;
}

:deep(.main-container) {
  min-height: 100%;
  width: 100%;
}

.fb-modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.35);
  display: flex; align-items: center; justify-content: center;
  z-index: 1050;
}

.fb-modal {
  width: min(900px, 92vw);
  max-height: 80vh;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(0,0,0,.18);
  display: flex; flex-direction: column;
  overflow: hidden;
}

.fb-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid #eef0f3;
  background: #f8fafc;
}

.fb-modal-actions {
  display: flex; gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid #eef0f3;
  background: #fff;
}

.fb-json {
  margin: 0;
  padding: 12px;
  overflow: auto;
  white-space: pre;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 12.5px;
  line-height: 1.45;
}

</style>
