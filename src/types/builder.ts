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
    childComponents?: FormElement[];
    columnCount?: number;
    columns?: Column[];
}


export interface FormConfiguration {
    labelMode: string;
}


