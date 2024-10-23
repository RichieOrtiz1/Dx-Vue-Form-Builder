import {defineStore} from 'pinia';
import {ref} from 'vue';


export const useUUID = defineStore('uuidStore',() =>{
   const used = ref(new Set<string>());

    const generate = () => {
     let uuid = crypto.randomUUID();
     while (used.value.has(uuid)) {
          uuid = crypto.randomUUID();
     }

     used.value.add(uuid);

     return uuid;
    };

    return {
     generate
    }
});