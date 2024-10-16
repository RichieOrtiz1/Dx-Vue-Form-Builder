import {defineStore} from 'pinia';

export const useFormConfigStore = defineStore('formConfigStore', {
    state: () =>{
        return {
            formConfiguration:{
                labelMode: 'outside',
                formElements: []
            }
        }
    },
    actions: {
        fetchChildComponents(uniqueId){
            return this.formConfiguration.formElements.find(x => x.uniqueId === uniqueId)?.childComponents ?? [];
        }
    }
});