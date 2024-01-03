import { reactive } from 'vue';
import { defineStore } from 'pinia';
import type { InjectionContext } from 'pinia-di';

export const AppStore = (
  { useStoreId }: InjectionContext,
  options: {
    storageKey?: string;
  } = {}
) => {
  const { storageKey = 'LU_BAN_STORAGE' } = options;

  return defineStore(useStoreId('AppStore'), () => {
    const configs = reactive<Record<string, any>>({});

    const setStore = (key: string, val: any) => {
      try {
        const str = localStorage.getItem(storageKey);
        const json = str ? JSON.parse(str) : {};
        json[key] = val;
        localStorage.setItem(storageKey, JSON.stringify(json));
      } catch (e) {}
    };

    const getStore = (key: string) => {
      try {
        const str = localStorage.getItem(storageKey);
        const json = str ? JSON.parse(str) : {};
        return json[key] || null;
      } catch (e) {
        return null;
      }
    };

    const setConfig = (key: string, val: any, store = false) => {
      configs[key] = val;

      if (store) {
        setStore(key, val);
      }
    };

    const getConfig = (key: string, store = false) => {
      if (typeof configs[key] === 'undefined' && store) {
        configs[key] = getStore(key);
      }

      return configs[key] || null;
    };

    return {
      configs,
      getConfig,
      setConfig
    };
  });
};
