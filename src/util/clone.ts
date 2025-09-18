import type { FormElement } from '../types/builder';

export function cloneElementDeep(el: FormElement): FormElement {
    return {
        ...el,
        uniqueId: crypto.randomUUID(),
        childComponents: el.childComponents
            ? el.childComponents.map(cloneElementDeep)
            : undefined,
        columns: el.columns
            ? el.columns.map(col => ({
                id: crypto.randomUUID(),                           // NEW: fresh column id
                colspan: col.colspan,                              // keep span if used
                childComponents: (col.childComponents ?? []).map(cloneElementDeep),
            }))
            : undefined,
    };
}
