<template>
    <div class="card custom-card overflow-visible">
        <div class="card-block control-descriptor d-flex align-items-center">
            <div class="control-descriptor_icon-holder text-center rounded-3 p-1">
                <i :class="descriptor.icon" class="card-img-left control-descriptor_icon p-1 m-0"></i>
            </div>
            <div class="control-descriptor_text">
                <p class="control-descriptor_text_title d-flex position-relative mb-1 fw-bold">
                    {{ descriptor.title }}
                </p>

                <p class="control-descriptor_text_description d-flex position-relative mb-0">{{ descriptor.description }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    descriptor: {
        type: Object,
        required: true
    }
})
</script>

<style lang="scss" scoped>

.custom-card {
  white-space: pre-wrap;
  margin: 5px;
  width: 100%; /* Ensure the card takes up the full width */
  box-sizing: border-box; /* Include padding and borders in the width/height */
  min-height: 60px; /* Set a consistent minimum height */
}

.control-descriptor {
  &_icon-holder {
    background-color: lightgray;
    margin-right: 5%;
    margin-left: 1%;
    display: flex;
    align-items: center; /* Ensures the icon is vertically centered */
    justify-content: center; /* Centers the icon horizontally */
    width: 50px; /* Set a fixed width for the icon holder */
    height: 50px; /* Set a fixed height for the icon holder */
  }
}


//.custom-card{
//    white-space: pre-wrap;
//    margin: 5px;
//}
//.control-descriptor {
//    &_icon-holder {
//        background-color: lightgray;
//        margin-right: 5%;
//        margin-left: 1%;
//    }
//}
</style>