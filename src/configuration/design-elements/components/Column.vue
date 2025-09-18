<template>
  <div class="column p-1">
    <ElementWrapper
        :id="columnContainerId"
        v-model="columnChildren"
        :container-id="columnContainerId"
        :show-default-placeholder="true"
        css-classes="column-drop"
    />
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import {useBuilderStore} from '../../stores/builder-store';
import ElementWrapper from './ElementWrapper.vue';
import type {Column, FormElement} from '../../../types/builder';

const props = defineProps<{ parentId: string; index: number }>();
const store = useBuilderStore();

const columns = computed<Column[]>(() => store.fetchColumns(props.parentId));

const columnChildren = computed<FormElement[]>({
  get: () => columns.value?.[props.index]?.childComponents ?? [],
  set: updated => {
    const next = (columns.value ?? []).map((c, i) =>
        i === props.index ? {...c, childComponents: updated} : c
    );
    store.setColumns(props.parentId, next);
  }
});

const columnContainerId = computed(
    () => columns.value?.[props.index]?.id ?? `${props.parentId}:col-${props.index}`
);

</script>

<style scoped>
.column {
  min-height: 60px;
}

:deep(.column-drop) {
  min-height: 140px;
}
</style>
