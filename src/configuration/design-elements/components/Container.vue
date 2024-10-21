<template>
  <div>
    <ElementWrapper
        :key="componentUid"
        :id="id"
        css-classes="builder-container"
        v-model:container-elements="container"
    >
      <template #placeholder>
        <p>TEST</p>
      </template>
    </ElementWrapper>
  </div>
</template>

<script setup lang="ts">
import {defineProps, useId} from 'vue';
import ElementWrapper from './ElementWrapper.vue';
import {useElementContainer} from '../../../composables/useElementContainer';

const componentUid = useId();


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
  margin-bottom: 12px;
  display: flex;
  flex-grow: 1;
}
</style>

<!--<template>-->
<!--  <div>-->
<!--    <ElementWrapper-->
<!--        :key="componentUid"-->
<!--        :id="id"-->
<!--        css-classes="builder-container"-->
<!--        v-model:container-elements="container"-->
<!--    >-->
<!--      <template #placeholder>-->
<!--        <p>TEST</p>-->
<!--      </template>-->
<!--    </ElementWrapper>-->
<!--  </div>-->
<!--</template>-->

<!--<script setup lang="ts">-->
<!--import {defineProps, useId} from 'vue';-->
<!--import ElementWrapper from './ElementWrapper.vue';-->
<!--import {useElementContainer} from '../../../composables/useElementContainer';-->

<!--const componentUid = useId();-->


<!--const {id} = defineProps({-->
<!--  id: {-->
<!--    required: true,-->
<!--    type: String-->
<!--  }-->
<!--});-->

<!--const {container} = useElementContainer(id);-->

<!--</script>-->

<!--<style scoped lang="scss">-->
<!--.builder-container {-->
<!--  min-height: 50px;-->
<!--  margin-bottom: 12px;-->
<!--  display: flex;-->
<!--  flex-grow: 1;-->
<!--}-->
<!--</style>-->