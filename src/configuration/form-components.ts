import { markRaw, defineAsyncComponent } from 'vue';
import CustomStore from 'devextreme/data/custom_store';
import {ElementDefinition, ElementClassification} from '../types/builder';

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
const elementTypes: ElementDefinition[] = [
    {
        type: 'TextInput',
        title: 'Text Input',
        description: 'Allows users to input a single line of text',
        icon: 'bi bi-alphabet h3',
        classification: ElementClassification.CONTROL,
        props: {
            label: 'Text Input',
        }
    },
    {
        type: 'EmailInput',
        title: 'Email Input',
        description: 'Email Field',
        icon: 'bi bi-envelope-at h3',
        classification: ElementClassification.CONTROL,
        props: {
            label: 'Email Input',
        }
    },
    {
        type: 'MultiLineTextInput',
        title: 'Multi-line Text Input',
        description: 'Allows users to input multiple lines of text',
        icon: 'bi bi-alphabet h3',
        classification: ElementClassification.CONTROL,
        props: {
            label: 'Text Area',
        }
    },
    {
        type: 'Dropdown',
        title: 'Dropdown',
        description: 'Field that allows single option from a dropdown',
        icon: 'bi bi-chevron-bar-down h3',
        classification: ElementClassification.CONTROL,
        props: {
            label: 'Select Input',
        }
    },
    {
        type: 'DateInput',
        title: 'Date Box',
        description: 'Date Selector',
        icon: 'bi bi-calendar h3',
        classification: ElementClassification.CONTROL,
        props: {
            label: 'Date Input',
        }
    },
    {
        type: 'NumberInput',
        title: 'Numeric Input',
        description: 'Number Box Control',
        icon: 'bi bi-123 h3',
        classification: ElementClassification.CONTROL,
        props: {
            label: 'Numeric Input',
        }
    },
    {
        type: 'TagsInput',
        title: 'Tags',
        description: 'Allows users to select many tags',
        icon: 'bi bi-tags h3',
        classification: ElementClassification.CONTROL,
        props: {
            label: 'Tag Input',
        }
    },
    {
        type: 'FileUploader',
        title: 'File Uploader',
        description: 'Allows users to upload files',
        icon: 'bi bi-file-earmark h3',
        classification: ElementClassification.CONTROL,
        props: {
            label: 'File Uploader',
        }
    },
    {
        type: 'Checkbox',
        title: 'Checkbox',
        description: 'Single checkbox input',
        icon: 'bi bi-check2-square h3',
        classification: ElementClassification.CONTROL,
        props: {
            label: 'Checkbox',
        }
    },
    {
        type: 'Switch',
        title: 'Switch',
        description: 'Toggle button',
        icon: 'bi bi-toggle-on h3',
        classification: ElementClassification.CONTROL,
        props: {
            label: 'Switch',
        }
    },
    {
        type: 'RadioGroup',
        title: 'Radio Buttons',
        description: 'Radio Button Group',
        icon: 'bi bi-toggle-on h3',
        classification: ElementClassification.CONTROL,
        props: {
            label: 'Radio Group',
        }
    },
];

const resolveControlComponent = (type: string) => {
    switch(type) {
        case 'TextInput':
        case 'EmailInput':
            return markRaw(DxTextBox);
        case 'MultiLineTextInput':
            return markRaw(DxTextArea);
        case 'Dropdown':
            return markRaw(DxSelectBox);
        case 'DateInput':
            return markRaw(DxDateBox);
        case 'NumberInput':
            return markRaw(DxNumberBox);
        case 'TagsInput':
            return markRaw(DxTagBox);
        case 'FileUploader':
            return markRaw(DxFileUploader);
        case 'Checkbox':
            return markRaw(DxCheckBox);
        case 'Switch':
            return markRaw(DxSwitch);
        case 'RadioGroup':
            return markRaw(DxRadioGroup);
        default:
            return null;
    }
}

// Define the CustomStore using TypeScript
const elementTypeDataSource = new CustomStore({
    loadMode: 'raw',
    key: 'id',
    load: () => {
        // Dynamically assign an id to the items in the array for placement into the dev-extreme datasource
        const data = elementTypes.map((element, index) => {
            return {
                ...element,
                id: index + 1,
            }
        });

        return Promise.resolve(data);
    },
});


export {
    elementTypes,
    elementTypeDataSource,
    resolveControlComponent
};
