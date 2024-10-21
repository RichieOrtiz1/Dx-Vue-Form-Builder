export const useDeepCopy = <T>(object: T) => {
    return {
        copy: structuredClone(object)
    }
};