// src/composables/useElementContainer.ts
import { ref, watch} from 'vue';
import { useBuilderStore } from '../configuration/stores/builder-store';

export const useElementContainer = (uniqueId: string) => {
    const store = useBuilderStore();

    const container = ref(store.fetchChildComponents(uniqueId));

    watch(
        () => container.value,
        (updated) => {
            store.setChildComponents(uniqueId, updated);
        },
        { deep: true }
    );

    return {
        container
    };
};