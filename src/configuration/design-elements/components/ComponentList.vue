<template>
  <!-- Tabs -->
  <div class="tab-container">
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <a
            :class="{ active: state.activeTab === 'controls' }"
            class="nav-link"
            @click="state.activeTab = 'controls'"
        >
          Controls
        </a>
      </li>
      <li class="nav-item">
        <a
            :class="{ active: state.activeTab === 'design-elements' }"
            class="nav-link"
            @click="state.activeTab = 'design-elements'"
        >
          Design Elements
        </a>
      </li>
    </ul>
  </div>

  <!-- Search Box -->
  <div class="search-box mt-3">
    <input
        v-model="state.searchTerm"
        class="form-control"
        placeholder="Search..."
        type="text"
    />
  </div>

  <!-- Control List -->
  <div class="mt-3 control-list scrollable-list">
    <div
        v-for="element in filteredElements"
        :key="element.title"
        class="draggable-item"
        draggable="true"
        @dragstart="onDragStart($event, element)"
        @dragend="dragEnd"
    >
      <DraggableControlItem :descriptor="element"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, computed } from 'vue';
import {ElementDefinition} from '../../../types/builder';
import { elementTypes } from '../../form-components';
import { designElements } from '../design-elements';
import DraggableControlItem from '../../../components/DraggableControlItem.vue';
import { useBuilderStore } from '../../stores/builder-store';

const store = useBuilderStore();

const state = reactive({
  activeTab: 'controls' as 'controls' | 'design-elements',
  searchTerm: '',
});

// Filtered elements based on search term and active tab
const filteredElements = computed(() => {
  const elements = state.activeTab === 'controls' ? elementTypes : designElements;
  if (state.searchTerm) {
    return elements.filter((element) =>
        element.type.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        element.description?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        element.title.toLowerCase().includes(state.searchTerm.toLowerCase())
    );
  }
  return elements;
});

// Handle drag start event, set the dragged element in the dataTransfer object
const onDragStart = (event: DragEvent, element: ElementDefinition) => {
  store.isDragging = true;
  event.dataTransfer?.setData('text/plain', JSON.stringify(element));
};

const dragEnd = (_: DragEvent) => {
  store.isDragging = false;
};
</script>

<style lang="scss" scoped>
.scrollable-list {
  height: calc(100vh - 140px); /* Height calculation to ensure it fits */
  overflow-y: auto;
}

.nav-item {
  cursor: pointer;
}

.search-box input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.tab-container {
  margin-bottom: 10px;
}

.draggable-item {
  cursor: grab;
  user-select: none;
}
</style>



<!--<template>-->
<!--  &lt;!&ndash; Tabs &ndash;&gt;-->
<!--  <div class="tab-container">-->
<!--    <ul class="nav nav-tabs">-->
<!--      <li class="nav-item">-->
<!--        <a-->
<!--            :class="{ active: state.activeTab === 'controls' }"-->
<!--            class="nav-link"-->
<!--            @click="state.activeTab = 'controls'"-->
<!--        >-->
<!--          Controls-->
<!--        </a>-->
<!--      </li>-->
<!--      <li class="nav-item">-->
<!--        <a-->
<!--            :class="{ active: state.activeTab === 'design-elements' }"-->
<!--            class="nav-link"-->
<!--            @click="state.activeTab = 'design-elements'"-->
<!--        >-->
<!--          Design Elements-->
<!--        </a>-->
<!--      </li>-->
<!--    </ul>-->
<!--  </div>-->

<!--  &lt;!&ndash; Search Box &ndash;&gt;-->
<!--  <div class="search-box mt-3">-->
<!--    <input-->
<!--        v-model="state.searchTerm"-->
<!--        class="form-control"-->
<!--        placeholder="Search..."-->
<!--        type="text"-->
<!--    />-->
<!--  </div>-->

<!--  &lt;!&ndash; Control List &ndash;&gt;-->
<!--  <div class="mt-3">-->
<!--    <Draggable-->
<!--        :clone="useElementClone"-->
<!--        :group="{ name: 'controls', pull: 'clone', put: false }"-->
<!--        :list="filteredElements"-->
<!--        class="control-list scrollable-list"-->
<!--        item-key="title"-->
<!--        @start="dragStart"-->
<!--        @end="dragEnd"-->
<!--    >-->
<!--      <template #item="{ element } : {element: FormElement}">-->
<!--        <DraggableControlItem :descriptor="element"/>-->
<!--      </template>-->
<!--    </Draggable>-->
<!--  </div>-->
<!--</template>-->

<!--<script lang="ts" setup>-->
<!--import {reactive, computed} from 'vue';-->
<!--import {FormElement} from '../../../types/builder';-->
<!--import Draggable from 'vuedraggable';-->
<!--import {elementTypes} from '../../form-components';-->
<!--import {designElements} from '../design-elements';-->
<!--import {useElementClone} from '../../../composables/useElementClone';-->
<!--import DraggableControlItem from '../../../components/DraggableControlItem.vue';-->
<!--import {useBuilderStore} from '../../stores/builder-store';-->

<!--const store = useBuilderStore();-->

<!--const state = reactive({-->
<!--  activeTab: 'controls' as 'controls' | 'design-elements',-->
<!--  searchTerm: '',-->
<!--  filteredElements: [] as FormElement[]-->
<!--});-->


<!--// Filtered elements based on search term and active tab-->
<!--const filteredElements = computed(() => {-->
<!--  const elements = state.activeTab === 'controls' ? elementTypes : designElements;-->
<!--  if (state.searchTerm) {-->
<!--    return elements.filter((element) =>-->
<!--        element.type.toLowerCase().includes(state.searchTerm.toLowerCase())-->
<!--        || element.description?.toLowerCase().includes(state.searchTerm.toLowerCase())-->
<!--        || element.title.toLowerCase().includes(state.searchTerm.toLowerCase())-->
<!--    );-->
<!--  }-->
<!--  return elements;-->
<!--});-->


<!--const dragStart = (_: DragEvent) => {-->
<!--  store.isDragging = true;-->
<!--};-->

<!--const dragEnd = (_: DragEvent) => {-->
<!--  store.isDragging = false;-->
<!--};-->
<!--</script>-->

<!--<style lang="scss" scoped>-->
<!--.scrollable-list {-->
<!--  height: calc(100vh - 140px); /* Height calculation to ensure it fits */-->
<!--  overflow-y: auto;-->
<!--}-->

<!--.shadow-sm {-->
<!--  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);-->
<!--}-->

<!--.nav-item {-->
<!--  cursor: pointer;-->
<!--}-->

<!--.search-box input {-->
<!--  width: 100%;-->
<!--  padding: 8px;-->
<!--  margin-bottom: 10px;-->
<!--  border-radius: 4px;-->
<!--  border: 1px solid #ccc;-->
<!--}-->

<!--.tab-container {-->
<!--  margin-bottom: 10px;-->
<!--}-->
<!--</style>-->