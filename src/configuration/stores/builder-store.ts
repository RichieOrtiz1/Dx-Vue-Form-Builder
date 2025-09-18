import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
import type { FormConfiguration, Column, FormElement } from '../../types/builder';

interface DragPayload {
    kind: 'internal';
    sourceContainerId: string;
    sourceUniqueId?: string;
    take?: () => FormElement | undefined;
}

export const useBuilderStore = defineStore('formConfigStore', () => {
    // --- state -------------------------------------------------
    const formConfiguration = reactive<FormConfiguration>({ labelMode: 'outside' });

    const formElements = ref<FormElement[]>([]);
    const isDragging = ref(false);
    const editingElement = ref<FormElement | null>(null);

    // For cross-container moves
    const drag = ref<DragPayload | null>(null);

    // History stacks for undo/redo
    const _undo = ref<string[]>([]);
    const _redo = ref<string[]>([]);

    const canUndo = computed(() => _undo.value.length > 0);
    const canRedo = computed(() => _redo.value.length > 0);

    // --- element lookup ----------------------------------------
    const fetchElement = (uniqueId: string): FormElement | undefined => {
        const stack = [...formElements.value];
        while (stack.length) {
            const current = stack.pop()!;
            if (current?.uniqueId === uniqueId) return current;

            if (current?.childComponents?.length) stack.push(...current.childComponents);

            if (current?.columns?.length) {
                for (const col of current.columns) {
                    if (col.childComponents?.length) stack.push(...col.childComponents);
                }
            }
        }
        return undefined;
    };

    // Return a LIVE reference to the children array for either:
    // - a container (element) identified by its uniqueId, or
    // - a column identified by its column.id
    function getChildrenArray(containerId: string): FormElement[] {
        // 1) Try to find a FormElement with uniqueId === containerId
        const asElement = fetchElement(containerId);
        if (asElement) {
            if (!asElement.childComponents) asElement.childComponents = [];
            return asElement.childComponents;
        }

        // 2) Otherwise, walk the tree to find a Column whose id === containerId
        const stack: FormElement[] = [...formElements.value];
        while (stack.length) {
            const node = stack.pop()!;
            if (node?.columns?.length) {
                for (const col of node.columns) {
                    if (col.id === containerId) {
                        if (!col.childComponents) col.childComponents = [];
                        return col.childComponents;
                    }
                }
            }
            if (node?.childComponents?.length) stack.push(...node.childComponents);
        }

        // Fallback to root (shouldn't usually happen for nested wrappers)
        return formElements.value;
    }


    // --- childComponents helpers -------------------------------
    const fetchChildComponents = (containerId: string): FormElement[] => {
        return getChildrenArray(containerId);
    };

    const setChildComponents = (containerId: string, components: FormElement[]) => {
        const arr = getChildrenArray(containerId);
        // mutate in place to preserve the same array reference
        arr.splice(0, arr.length, ...components);
    };

    // --- columns helpers ---------------------------------------
    const initializeColumns = (uniqueId: string, colCount: number) => {
        const element = fetchElement(uniqueId)
        if (!element) return

        element.columnCount = colCount
        element.columns = Array.from({ length: colCount }, () => ({
            id: crypto.randomUUID(),            // NEW: stable key
            colspan: 1,                         // optional: default span
            childComponents: [] as FormElement[]
        }))
    };

    const fetchColumns = (uniqueId: string): Column[] =>
        fetchElement(uniqueId)?.columns ?? [];

    const setColumns = (uniqueId: string, columns: Column[]) => {
        const el = fetchElement(uniqueId);
        if (!el) return;

        el.columnCount = columns.length;
        // guarantee each column has an id and childComponents array
        el.columns = columns.map(c => ({
            id: c.id ?? crypto.randomUUID(),
            colspan: typeof c.colspan === 'number' ? c.colspan : 1,
            childComponents: c.childComponents ?? []
        }));
    };

    const removeColumn = (uniqueId: string, columnIndex: number) => {
        const el = fetchElement(uniqueId);
        if (!el || !el.columns) return;
        el.columns = el.columns.filter((_, i) => i !== columnIndex);
        el.columnCount = el.columns.length;
    };

    // --- editing state -----------------------------------------
    const setEditingElement = (element: FormElement | null) => {
        editingElement.value = element;
    };

    // --- undo/redo ---------------------------------------------
    const pushHistory = () => {
        _undo.value.push(JSON.stringify(formElements.value));
        _redo.value = [];
    };

    const undo = () => {
        if (!_undo.value.length) return;
        const snap = _undo.value.pop()!;
        _redo.value.push(JSON.stringify(formElements.value));
        formElements.value = JSON.parse(snap);
    };

    const redo = () => {
        if (!_redo.value.length) return;
        const snap = _redo.value.pop()!;
        _undo.value.push(JSON.stringify(formElements.value));
        formElements.value = JSON.parse(snap);
    };

    // --- drag state --------------------------------------------
    const startInternalDrag = (payload: DragPayload) => {
        drag.value = payload;
        isDragging.value = true;
    };

    const clearDrag = () => {
        drag.value = null;
        isDragging.value = false;
    };

    // --- schema export -----------------------------------------
    const schemaJson = computed(() => JSON.stringify(formElements.value));

    // --- expose everything -------------------------------------
    return {
        // state
        formConfiguration,
        formElements,
        isDragging,
        editingElement,

        // element helpers
        fetchElement,
        getChildrenArray,
        fetchChildComponents,
        setChildComponents,

        // columns
        initializeColumns,
        fetchColumns,
        setColumns,
        removeColumn,

        // editing
        setEditingElement,

        // history
        pushHistory,
        undo,
        redo,

        // drag
        drag,
        startInternalDrag,
        clearDrag,
        canUndo,
        canRedo,
        // export
        schemaJson,
    };
});
