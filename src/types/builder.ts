

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
    id: string;
    colspan?: number;
    childComponents: FormElement[];
}

export interface FormElement extends ElementDefinition {
    uniqueId: string;
    colspan?: number | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>>;
    childComponents?: FormElement[];
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



