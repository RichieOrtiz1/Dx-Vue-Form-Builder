import { ref, watch } from 'vue';
import { useBuilderStore } from '../configuration/stores/builder-store';

export const useColumns = (uniqueId: string, colCount: number) => {
    const store = useBuilderStore();

    // Use ref to create a reactive reference to the column container
    const columnContainer = ref({
        columns: store.fetchColumns(uniqueId) ?? []  // Fetch columns from the store
    });

    // Initialize columns if they don't exist
    if (columnContainer.value.columns.length === 0) {
        store.initializeColumns(uniqueId, colCount);  // Initialize columns based on colCount
        columnContainer.value.columns = store.fetchColumns(uniqueId);  // Sync with store after initialization
    }

    // Watch for changes in columns and sync with the store
    watch(
        columnContainer,
        (newVal) => {
            store.setColumns(uniqueId, newVal.columns);  // Sync with store whenever columns change
        },
        { deep: true }
    );

    return {
        columnContainer  // Return the reactive reference
    };
};
