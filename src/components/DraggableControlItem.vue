<template>
  <div
      class="card custom-card overflow-visible"
      draggable="true"
      @dragstart="onDragStart"
      @dragend="onDragEnd"
      :title="descriptor.title"
  >
    <div class="card-block control-descriptor d-flex align-items-center">
      <div class="control-descriptor_icon-holder text-center rounded-3 p-1">
        <i :class="descriptor.icon" class="card-img-left control-descriptor_icon p-1 m-0"></i>
      </div>
      <div class="control-descriptor_text">
        <p class="control-descriptor_text_title d-flex position-relative mb-1 fw-bold">
          {{ descriptor.title }}
        </p>
        <p class="control-descriptor_text_description d-flex position-relative mb-0">
          {{ descriptor.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, toRaw } from 'vue';
import { useBuilderStore } from '../configuration/stores/builder-store';
import type { ElementDefinition } from '../types/builder';

const props = defineProps({
  descriptor: {
    type: Object as PropType<ElementDefinition>,
    required: true,
  },
});

const store = useBuilderStore();

function onDragStart(e: DragEvent) {
  if (!e.dataTransfer) return;

  // Let wrappers know this is an external drag (copy semantics)
  store.startExternalDrag?.();

  // Send a plain JSON payload (avoid Vue proxies)
  const clean = toRaw(props.descriptor);
  e.dataTransfer.setData('application/json', JSON.stringify(clean));
  e.dataTransfer.effectAllowed = 'copy';

  // (Optional) nicer ghost
  // const node = e.currentTarget as HTMLElement;
  // e.dataTransfer.setDragImage(node, 12, 12);
}

function onDragEnd() {
  store.clearDrag?.();
}
</script>

<style lang="scss" scoped>
.custom-card {
  white-space: pre-wrap;
  margin: 5px;
  width: 100%;
  box-sizing: border-box;
  min-height: 60px;
  cursor: grab;
}
.custom-card:active { cursor: grabbing; }

.control-descriptor {
  &_icon-holder {
    background-color: lightgray;
    margin-right: 5%;
    margin-left: 1%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px; height: 50px;
  }
}
</style>
