// src/types/factories.ts
import { ElementClassification, type ElementDefinition, type FormElement } from './builder';

export function createFormElement(def: ElementDefinition): FormElement {
    return {
        ...def,
        uniqueId: crypto.randomUUID(),
        colspan: def.props?.colspan ?? undefined,
        childComponents: def.classification === ElementClassification.DESIGN ? [] : undefined,
        columnCount: def.props?.colCount ?? undefined,
        columns: def.props?.columns ?? undefined,
    };
}