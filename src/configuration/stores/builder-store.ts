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

    // --- childComponents helpers -------------------------------
    const fetchChildComponents = (uniqueId: string): FormElement[] =>
        fetchElement(uniqueId)?.childComponents ?? [];

    const setChildComponents = (uniqueId: string, components: FormElement[]) => {
        const el = fetchElement(uniqueId);
        if (el) el.childComponents = components;
    };

    // --- columns helpers ---------------------------------------
    const initializeColumns = (uniqueId: string, colCount: number) => {
        const el = fetchElement(uniqueId);
        if (!el) return;
        el.columnCount = colCount;
        el.columns = Array.from({ length: colCount }, () => ({ childComponents: [] }));
    };

    const fetchColumns = (uniqueId: string): Column[] =>
        fetchElement(uniqueId)?.columns ?? [];

    const setColumns = (uniqueId: string, columns: Column[]) => {
        const el = fetchElement(uniqueId);
        if (el) {
            el.columnCount = columns.length;
            el.columns = columns;
        }
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
    };

    const clearDrag = () => {
        drag.value = null;
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
