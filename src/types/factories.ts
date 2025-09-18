
import { ElementClassification, type ElementDefinition, type FormElement } from './builder';


export function createFormElement(def: ElementDefinition): FormElement {
    // Clone props so we can read/normalize safely
    const props = { ...(def.props ?? {}) };
    const colCount = Number(props.colCount ?? 0);
    const fromPropsColumns = Array.isArray(props.columns) ? props.columns : undefined;

    // If columns weren't provided but a colCount is, auto-build columns
    const normalizedColumns =
        fromPropsColumns?.map(c => ({
            id: c.id ?? crypto.randomUUID(),
            colspan: typeof c.colspan === 'number' ? c.colspan : 1,
            childComponents: Array.isArray(c.childComponents) ? c.childComponents : [],
        })) ??
        (colCount > 0
            ? Array.from({ length: colCount }, () => ({
                id: crypto.randomUUID(),
                colspan: 1,
                childComponents: [],
            }))
            : undefined);

    const el: FormElement = {
        ...def,
        uniqueId: crypto.randomUUID(),
        // Controls typically span full width unless specified
        colspan: typeof props.colspan === 'number' ? props.colspan : undefined,
        // DESIGN elements should always start with an array for childComponents
        childComponents: def.classification === ElementClassification.DESIGN ? [] : undefined,
        // Keep columnCount in sync with normalized columns
        columnCount: normalizedColumns ? normalizedColumns.length : (colCount || undefined),
        columns: normalizedColumns,
    };

    return el;
}