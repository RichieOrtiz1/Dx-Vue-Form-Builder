import {
    DxTextBox,
    DxSelectBox,
    DxNumberBox,
    DxDateBox,
    DxTagBox,
    DxFileUploader,
    DxCheckBox,
    DxRadioGroup,
    DxSwitch,
    DxTextArea
} from 'devextreme-vue'


import { markRaw } from 'vue'
import CustomStore from 'devextreme/data/custom_store'

const defaults = {
    labelMode: 'floating',
    resizeEnabled: true
}

const ComponentTypes = [
    {
        name: 'TextInput',
        title: 'Text Input',
        description: 'Allows users to input a single line of text',
        icon: 'bi bi-alphabet h3',
        control: markRaw(DxTextBox),
        props: {
            label: 'Text Input'
        }
    },
    {
        name: 'EmailInput',
        title: 'Email Input',
        description: 'Email Field',
        icon: 'bi bi-envelope-at h3',
        control: markRaw(DxTextBox),
        props: {
            label: 'Email Input'
        }
    },
    {
        name: 'MultiLineTextInput',
        title: 'Multi-line Text Input',
        description: 'Allows users to input multiple lines of text',
        icon: 'bi bi-alphabet h3',
        control: markRaw(DxTextArea),
        props: {
            label: 'Text Area'
        }
    },
    {
        name: 'Dropdown',
        title: 'Dropdown',
        description: 'Field that allows single option from a dropdown',
        icon: 'bi bi-chevron-bar-down h3',
        control: markRaw(DxSelectBox),
        props: {
            label: 'Select Input'
        }
    },
    {
        name: 'DateInput',
        title: 'Date Box',
        description: 'Date Selector',
        icon: 'bi bi-calendar h3',
        control: markRaw(DxDateBox),
        props: {
            label: 'Date Input'
        }
    },
    {
        name: 'NumberInput',
        title: 'Numeric Input',
        description: 'Number Box Control',
        icon: 'bi bi-123 h3',
        control: markRaw(DxNumberBox),
        props: {   
            label: 'Numeric Input'
        }
    },
    {
        name: 'TagsInput',
        title: 'Tags',
        description: 'Allows users to select many tags',
        icon: 'bi bi-tags h3',
        control: markRaw(DxTagBox),
        props: {
            
            label: 'Tag Input'
        }
    },
    {
        name: 'FileUploader',
        title: 'File Uploader',
        description: 'Allows users to upload files',
        icon: 'bi bi-file-earmark h3',
        control: markRaw(DxFileUploader),
        props: {
            label: 'File Uploader'
        }
    },
    {
        name: 'Checkbox',
        title: 'Checkbox',
        description: 'Single checkbox input',
        icon: 'bi bi-check2-square h3',
        control: markRaw(DxCheckBox),
        props: {
            label: 'Checkbox'
        }
    },
    {
        name: 'Switch',
        title: 'Switch',
        description: 'Toggle button',
        icon: 'bi bi-toggle-on h3',
        control: markRaw(DxSwitch),
        props: {
            label: 'Switch'
        }
    },
    {
        name: 'RadioGroup',
        title: 'Radio Buttons',
        description: 'Radio Button Group',
        icon: 'bi bi-toggle-on h3',
        control: markRaw(DxRadioGroup),
        props: {
            label: 'Radio Group'
        }
    }
]

const ComponentTypeDataSource = new CustomStore({
    loadMode: 'raw',
    key: 'id',
    load: () => {

        // This is done to dynamically assign an id to the items in the array for to be placed into the dev-extreme datasource
        ComponentTypes.forEach((item, index) => {
            item.typeId = index + 1;
            item.type = 'control';
        })

        return Promise.resolve(ComponentTypes)
    }
});

export {
    ComponentTypes,
    ComponentTypeDataSource
};