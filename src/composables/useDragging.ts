import { ref } from 'vue';

export const useDraggingTracking = () => {
    const isDragging = ref(false);
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