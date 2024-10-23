import {GridLayoutItem} from '../types/builder.ts';
import {useUUID} from './useUUID.ts';

export const useElementClone = (item: GridLayoutItem) => {

    const {generate} = useUUID();

    return {...item, uniqueId: generate()};
};