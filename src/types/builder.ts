export interface ElementDefinition {
    name: string;
    title: string;
    description?: string;
    icon: string;
    control: any;
    props: Record<string, any>;
    typeId?: number;
    type?: string;
}


export interface Column {
    childComponents: FormElement[];
}

export interface FormElement extends ElementDefinition{
    uniqueId: string;
    type: string;
    childComponents?: FormElement[];
    columnCount?: number;
    columns?: Column[];
}

export interface DesignElement extends ElementDefinition {
    rendersInSortable: boolean;
}

export interface FormConfiguration {
    labelMode: string;
}

