import { markRaw, defineAsyncComponent } from 'vue';
import CustomStore from 'devextreme/data/custom_store';
import {ElementDefinition} from '../types/builder';

const DxTextBox = defineAsyncComponent(() => import('devextreme-vue/text-box'));
const DxSelectBox = defineAsyncComponent(() => import('devextreme-vue/select-box'));
const DxNumberBox = defineAsyncComponent(() => import('devextreme-vue/number-box'));
const DxDateBox = defineAsyncComponent(() => import('devextreme-vue/date-box'));
const DxTagBox = defineAsyncComponent(() => import('devextreme-vue/tag-box'));
const DxFileUploader = defineAsyncComponent(() => import('devextreme-vue/file-uploader'));
const DxCheckBox = defineAsyncComponent(() => import('devextreme-vue/check-box'));
const DxRadioGroup = defineAsyncComponent(() => import('devextreme-vue/radio-group'));
const DxSwitch = defineAsyncComponent(() => import('devextreme-vue/switch'));
const DxTextArea = defineAsyncComponent(() => import('devextreme-vue/text-area'));


const defaults = {
    labelMode: 'floating',
    resizeEnabled: true,
};

// Define an array of component types with proper typings
const ElementTypes: ElementDefinition[] = [
    {
        name: 'TextInput',
        title: 'Text Input',
        description: 'Allows users to input a single line of text',
        icon: 'bi bi-alphabet h3',
        control: markRaw(DxTextBox),
        props: {
            label: 'Text Input',
        },
    },
    {
        name: 'EmailInput',
        title: 'Email Input',
        description: 'Email Field',
        icon: 'bi bi-envelope-at h3',
        control: markRaw(DxTextBox),
        props: {
            label: 'Email Input',
        },
    },
    {
        name: 'MultiLineTextInput',
        title: 'Multi-line Text Input',
        description: 'Allows users to input multiple lines of text',
        icon: 'bi bi-alphabet h3',
        control: markRaw(DxTextArea),
        props: {
            label: 'Text Area',
        },
    },
    {
        name: 'Dropdown',
        title: 'Dropdown',
        description: 'Field that allows single option from a dropdown',
        icon: 'bi bi-chevron-bar-down h3',
        control: markRaw(DxSelectBox),
        props: {
            label: 'Select Input',
        },
    },
    {
        name: 'DateInput',
        title: 'Date Box',
        description: 'Date Selector',
        icon: 'bi bi-calendar h3',
        control: markRaw(DxDateBox),
        props: {
            label: 'Date Input',
        },
    },
    {
        name: 'NumberInput',
        title: 'Numeric Input',
        description: 'Number Box Control',
        icon: 'bi bi-123 h3',
        control: markRaw(DxNumberBox),
        props: {
            label: 'Numeric Input',
        },
    },
    {
        name: 'TagsInput',
        title: 'Tags',
        description: 'Allows users to select many tags',
        icon: 'bi bi-tags h3',
        control: markRaw(DxTagBox),
        props: {
            label: 'Tag Input',
        },
    },
    {
        name: 'FileUploader',
        title: 'File Uploader',
        description: 'Allows users to upload files',
        icon: 'bi bi-file-earmark h3',
        control: markRaw(DxFileUploader),
        props: {
            label: 'File Uploader',
        },
    },
    {
        name: 'Checkbox',
        title: 'Checkbox',
        description: 'Single checkbox input',
        icon: 'bi bi-check2-square h3',
        control: markRaw(DxCheckBox),
        props: {
            label: 'Checkbox',
        },
    },
    {
        name: 'Switch',
        title: 'Switch',
        description: 'Toggle button',
        icon: 'bi bi-toggle-on h3',
        control: markRaw(DxSwitch),
        props: {
            label: 'Switch',
        },
    },
    {
        name: 'RadioGroup',
        title: 'Radio Buttons',
        description: 'Radio Button Group',
        icon: 'bi bi-toggle-on h3',
        control: markRaw(DxRadioGroup),
        props: {
            label: 'Radio Group',
        },
    },
];

// Define the CustomStore using TypeScript
const ElementTypeDataSource = new CustomStore({
    loadMode: 'raw',
    key: 'id',
    load: () => {
        // Dynamically assign an id to the items in the array for placement into the dev-extreme datasource
        ElementTypes.forEach((item, index) => {
            item.typeId = index + 1;
            item.type = 'control';
        });

        return Promise.resolve(ElementTypes);
    },
});

export {
    ElementTypes,
    ElementTypeDataSource
};
