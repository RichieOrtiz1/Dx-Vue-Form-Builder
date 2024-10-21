import { markRaw, defineAsyncComponent } from 'vue';
import CustomStore from 'devextreme/data/custom_store';
import {ElementDefinition, ElementClassification} from '../../types/builder.ts';

const Container = defineAsyncComponent(() => import('./components/Container.vue'));
const MainHeading = defineAsyncComponent(() => import('./components/MainHeading.vue'));
const SectionHeading = defineAsyncComponent(() => import('./components/SectionHeading.vue'));
const SubHeading = defineAsyncComponent(() => import('./components/SubHeading.vue'));
const Divider = defineAsyncComponent(() => import('./components/Divider.vue'));
const PlainHtml = defineAsyncComponent(() => import('./components/PlainHtml.vue'));
const Column = defineAsyncComponent(() => import('./components/Column.vue'));


const defaults = {
    color: 'black',
};

let designElements: ElementDefinition[] = [
    {
        type: 'ElementContainer',
        title: 'Container',
        description: 'Allows for grouping items together',
        icon: 'bi bi-box-fill',
        classification: ElementClassification.DESIGN,
        props: {}
    },
    {
        type: 'MainHeading',
        title: 'Main Heading',
        description: 'Form header (large) <h1/> tag',
        icon: 'bi bi-type-h1',
        classification: ElementClassification.DESIGN,
        props: {
            ...defaults,
        }
    },
    {
        type: 'SectionHeading',
        title: 'Section Heading',
        description: 'Section header (medium) <h2/> tag',
        icon: 'bi bi-type-h2',
        classification: ElementClassification.DESIGN,
        props: {
            ...defaults
        }
    },
    {
        type: 'SubHeading',
        title: 'Sub Heading',
        description: 'Sub header (small) <h3/> tag',
        icon: 'bi bi-type-h3',
        classification: ElementClassification.DESIGN,
        props: {
            ...defaults,
        }
    },
    {
        type: 'Divider',
        title: 'Divider',
        description: 'Thin gray horizontal divider',
        icon: 'bi bi-hr',
        classification: ElementClassification.DESIGN,
        props: {}
    },
    {
        type: 'Columns',
        title: '2 Columns',
        description: 'Two Columns side-by-side',
        icon: 'bi bi-layout-split',
        classification: ElementClassification.DESIGN,
        props: {colCount: 2}
    },
    {
        type: 'Columns',
        title: '3 Columns',
        description: 'Three Columns side-by-side',
        icon: 'bi bi-layout-three-columns',
        classification: ElementClassification.DESIGN,
        props: {colCount: 3}
    },
    {
        type: 'Columns',
        title: '4 Columns',
        description: 'Four Columns side-by-side',
        icon: 'bi bi-collection-fill',
        classification: ElementClassification.DESIGN,
        props: {colCount: 4}
    },
    {
        type: 'PlainHtml',
        title: 'html',
        description: 'Allows for creating an element using plain html',
        icon: 'bi bi-code-slash',
        classification: ElementClassification.DESIGN,
        props: {}
    },
];

const resolveDesignComponent = (type: string) => {
    switch (type) {
        case 'ElementContainer':
            return markRaw(Container);
        case 'MainHeading':
            return markRaw(MainHeading);
        case 'SectionHeading':
            return markRaw(SectionHeading);
        case 'SubHeading':
            return markRaw(SubHeading);
        case 'Divider':
            return markRaw(Divider);
        case 'Columns':
            return markRaw(Column);
        case 'PlainHtml':
            return markRaw(PlainHtml);
        default:
            return null;
    }
}

const designElementsDataSource = new CustomStore({
    loadMode: 'raw',
    key: 'id',
    load: () => {
        // This is done to dynamically assign an id to the items in the array for it to be placed into the dev-extreme datasource
        const data = designElements.map((element, index) => {
            return {
                ...element,
                id: index + 1,
            }
        });

        return Promise.resolve(data);
    },
});

export { designElements, designElementsDataSource, resolveDesignComponent };
