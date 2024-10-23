import {LayoutItem} from 'vue3-grid-layout-next/dist/helpers/utils';

export enum ElementClassification {
    CONTROL = 'Control',
    DESIGN = 'Design'
}

export interface ElementDefinition {
    classification: ElementClassification;
    title: string;
    description?: string;
    icon: string;
    type: string;
    props: Record<string, any>;
}


export interface Column {
    childComponents: FormElement[];
}

export interface FormElement extends ElementDefinition{
    uniqueId: string;
    colspan?: number;
    childComponents?: GridLayoutItem[];
    columnCount?: number;
    columns?: Column[];
}


export interface FormConfiguration {
    labelMode: string
}

export interface UniqueIdProp {
    uniqueId: string;
}

export interface ElementWrapperProps extends UniqueIdProp {
    cssClasses?: string;
    showDefaultPlaceholder?: boolean;
}

export interface GridLayoutItem extends FormElement, LayoutItem{}


