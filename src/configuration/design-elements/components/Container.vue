<template>
  <div class="d-flex">
    <ElementWrapper
        :id="id"
        css-classes="builder-container container-fluid"
        v-model:container-elements="container"
    />
  </div>
</template>

<script setup lang="ts">
import {defineProps} from 'vue';
import ElementWrapper from './ElementWrapper.vue';
import {useElementContainer} from '../../../composables/useElementContainer';



const {id} = defineProps({
  id: {
    required: true,
    type: String
  }
});

const {container} = useElementContainer(id);

</script>


<style lang="scss">
.builder-container {
  height: 200px;
  display: flex;
  flex-grow: 1;
  background-color: whitesmoke;
}
</style>