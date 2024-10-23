<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Sidebar -->
      <div class="col-md-3">
        <div class="sidebar">
          <ComponentList />
        </div>
      </div>

      <!-- Form Area -->
      <div :class="{ 'glow': isDragging }" class="col-md-9 form-area">
        <h5>Form Builder</h5>
        <div class="container-fluid">
          <div class="row">
            <ElementWrapper
                :key="uuid"
                :unique-id="uuid"
                v-model:containerElements="formElements"
                css-classes="form-global-items"
            />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useUUID} from '../composables/useUUID.ts';
import ComponentList from '../configuration/design-elements/components/ComponentList.vue';
import ElementWrapper from '../configuration/design-elements/components/ElementWrapper.vue';
import {useBuilderStore} from '../configuration/stores/builder-store.ts';
import {storeToRefs} from 'pinia';

const uuid = useUUID().generate();
const {isDragging, formElements} = storeToRefs(useBuilderStore());


</script>

<style scoped>
:deep(.form-area) {
  min-height: 500px;
  border: 1px dashed #ccc;
  padding: 10px;
  background-color: #f9f9f9;
  height: 100vh; /* Ensure it takes full height */
  overflow-y: auto;
  position: relative;
}

:deep(.form-area.glow) {
  border-color: #00f; /* Glowing border effect */
  box-shadow: 0 0 10px #00f; /* Optional glowing shadow */
}


.sidebar {
  /*padding: 10px;*/
  height: 100vh; /* Ensure full height */
  overflow-y: hidden;
}

:deep(.form-global-items){
  height: 100%;
}
</style>
