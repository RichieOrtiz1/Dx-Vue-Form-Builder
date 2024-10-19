// src/composables/useElementContainer.ts
import { reactive, watch } from 'vue';
import { useBuilderStore } from '../configuration/stores/builder-store';

export const useElementContainer = (uniqueId: string) => {
    const store = useBuilderStore();

    const container = reactive({
        elements: store.fetchChildComponents(uniqueId)
    });

    watch(
        () => container,
        (newVal) => {
            store.setChildComponents(uniqueId, newVal.elements);
        },
        { deep: true }
    );

    return {
        container
    };
};