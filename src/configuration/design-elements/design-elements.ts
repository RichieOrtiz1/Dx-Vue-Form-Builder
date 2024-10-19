import Container from './components/Container.vue';
import MainHeading from './components/MainHeading.vue';
import SectionHeading from './components/SectionHeading.vue';
import SubHeading from './components/SubHeading.vue';
import Divider from './components/Divider.vue';
import PlainHtml from './components/PlainHtml.vue';
import Column from './components/Column.vue';

import { markRaw } from 'vue';
import CustomStore from 'devextreme/data/custom_store';
import {DesignElement} from '../../types/builder.ts';


const defaults = {
    color: 'black',
};

let DesignElements: DesignElement[] = [
    {
        name: 'ElementContainer',
        title: 'Container',
        description: 'Allows for grouping items together',
        icon: 'bi bi-box-fill',
        rendersInSortable: true,
        control: markRaw(Container),
        props: {}
    },
    {
        name: 'MainHeading',
        title: 'Main Heading',
        description: 'Form header (large) <h1/> tag',
        icon: 'bi bi-type-h1',
        rendersInSortable: false,
        control: markRaw(MainHeading),
        props: {
            ...defaults,
        },
    },
    {
        name: 'SectionHeading',
        title: 'Section Heading',
        description: 'Section header (medium) <h2/> tag',
        icon: 'bi bi-type-h2',
        rendersInSortable: false,
        control: markRaw(SectionHeading),
        props: {
            ...defaults,
        },
    },
    {
        name: 'SubHeading',
        title: 'Sub Heading',
        description: 'Sub header (small) <h3/> tag',
        icon: 'bi bi-type-h3',
        rendersInSortable: false,
        control: markRaw(SubHeading),
        props: {
            ...defaults,
        },
    },
    {
        name: 'Divider',
        title: 'Divider',
        description: 'Thin gray horizontal divider',
        icon: 'bi bi-hr',
        rendersInSortable: false,
        control: markRaw(Divider),
        props: {},
    },
    {
        name: 'Columns',
        title: '2 Columns',
        description: 'Two Columns side-by-side',
        icon: 'bi bi-layout-split',
        rendersInSortable: false,
        control: markRaw(Column),
        props: {colCount: 2},
    },
    {
        name: 'Columns',
        title: '3 Columns',
        description: 'Three Columns side-by-side',
        icon: 'bi bi-layout-three-columns',
        rendersInSortable: false,
        control: markRaw(Column),
        props: {colCount: 3},
    },
    {
        name: 'Columns',
        title: '4 Columns',
        description: 'Four Columns side-by-side',
        icon: 'bi bi-collection-fill',
        rendersInSortable: false,
        control: markRaw(Column),
        props: {colCount: 4},
    },
    {
        name: 'PlainHtml',
        title: 'html',
        description: 'Allows for creating an element using plain html',
        icon: 'bi bi-code-slash',
        rendersInSortable: false,
        control: markRaw(PlainHtml),
        props: {},
    },
];

const DesignElementsDataSource = new CustomStore({
    loadMode: 'raw',
    key: 'id',
    load: () => {
        // This is done to dynamically assign an id to the items in the array for it to be placed into the dev-extreme datasource
        DesignElements.forEach((item, index) => {
            item.typeId = index + 1;
            item.type = 'design-element';
        });

        return Promise.resolve(DesignElements);
    },
});

export { DesignElements, DesignElementsDataSource };
