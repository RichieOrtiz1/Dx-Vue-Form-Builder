import { computed } from 'vue'
import { useBuilderStore } from '../configuration/stores/builder-store'

export const useElementContainer = (uniqueId: string) => {
    const store = useBuilderStore()

    const container = computed({
        get: () => store.fetchChildComponents(uniqueId),
        set: (updated) => store.setChildComponents(uniqueId, updated),
    })

    return { container }
}
