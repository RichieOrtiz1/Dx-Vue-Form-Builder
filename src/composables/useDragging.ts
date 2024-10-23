import { ref } from 'vue';

const isDragging = ref(false);
export const useDraggingTracking = () => {
    const start = () => {
        isDragging.value = true;
    }

    const end = () => {
        isDragging.value = false;
    }

    return {
        isDragging,
        start,
        end
    }
}