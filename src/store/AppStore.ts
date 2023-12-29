import { reactive } from 'vue';
import { defineStore } from 'pinia';
import type { InjectionContext } from 'pinia-di';

export const AppStore = ({ useStoreId }: InjectionContext) => {
  return defineStore(useStoreId('AppStore'), () => {
    const configs = reactive<Record<string, any>>({});
    const setConfig = (key: string, val: any) => {
      configs[key] = val;
    };
    const getConfig = (key: string) => {
      return configs[key];
    };

    return {
      configs,
      getConfig,
      setConfig
    };
  });
};
