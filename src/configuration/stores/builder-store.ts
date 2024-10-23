import {defineStore} from 'pinia';
import {computed, reactive, ref} from 'vue';
import {FormConfiguration, Column, GridLayoutItem} from '../../types/builder';

export const useBuilderStore = defineStore('formConfigStore', () => {
    // Reactive State
    const formConfiguration = reactive<FormConfiguration>({
        labelMode: 'outside',
    });

    const isDragging = ref(false);
    const formElements = reactive<GridLayoutItem[]>([]);

    // Actions

    // Fetch a specific element by uniqueId
    const fetchElement = (uniqueId: string): GridLayoutItem | undefined => {
        const stack = [...formElements];
        while (stack.length > 0) {
            const current = stack.pop();
            if (current?.uniqueId === uniqueId) {
                return current;
            }
            if (current?.childComponents) {
                stack.push(...current.childComponents);
            }
        }
        return undefined;
    };

    const fetchChildComponents = (uniqueId: string): GridLayoutItem[] => {
        return fetchElement(uniqueId)?.childComponents ?? [];
    };

    const setChildComponents = (uniqueId: string, components: GridLayoutItem[]) => {
        const element = fetchElement(uniqueId);
        if (element) {
            element.childComponents = components;
        }
    };


    // Add new columns to a specific FormElement based on colCount
    const initializeColumns = (uniqueId: string, colCount: number) => {
        const element = fetchElement(uniqueId);

        if (!element) return;
        element.columnCount = colCount;

        element.columns = Array.from({length: colCount}, () =>
            <Column>{
                childComponents: []
            }
        );
    };

    // Fetch columns for a given FormElement by uniqueId
    const fetchColumns = (uniqueId: string): Column[] => {
        return fetchElement(uniqueId)?.columns ?? [];
    };

    const setColumns = (uniqueId: string, columns: Column[]) => {
        const element = fetchElement(uniqueId);
        if (element) {
            element.columnCount = columns.length;
            element.columns = columns;
        }
    };

    // Remove a column from a specific FormElement
    const removeColumn = (uniqueId: string, columnIndex: number) => {
        const element = fetchElement(uniqueId);
        if (!element) return;

        element.columns = element.columns?.filter((_, index) => index !== columnIndex);

        element.columnCount = element.columns?.length;
    };

    const schemaJson = computed(() => {
        return JSON.stringify(formElements.flat());
    });


    return {
        formConfiguration,
        formElements,
        schemaJson,
        fetchChildComponents,
        setChildComponents,
        initializeColumns,
        fetchColumns,
        setColumns,
        removeColumn,
        isDragging
    };
});
