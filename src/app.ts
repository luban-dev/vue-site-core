import type { App as VueApp } from 'vue';
import type { RouteRecordRaw, Router } from 'vue-router';
import { createApp, h, onMounted } from 'vue';
import { createPinia } from 'pinia';
import type { GetStore, InjectionProvide } from 'pinia-di';
import { useProvideStores } from 'pinia-di';
import { AppStore } from './store';
import { App } from './components';
import type { ApiRequest } from './types';
import { initI18n } from './i18n';
import { createRouter } from './utils';

export class Luban {
  // vue app
  app: VueApp;
  // global pinia store
  globlStore?: ReturnType<ReturnType<typeof AppStore>>;
  apis = [];
  services = [];
  menus = [];
  // router
  baseURL: string = '/';
  router: Router;
  routes: RouteRecordRaw[] = [];
  // i18n
  i18nConf?: ReturnType<typeof initI18n>;

  constructor(options: {
    routes: RouteRecordRaw[];
    baseURL?: string;
    stores?: InjectionProvide[];
    i18n?: {
      languageKey?: string;
      languages?: string[];
      defaultLanguage?: string;
      languagesMap?: [RegExp, string][];
      langTypes?: ('path' | 'browser' | 'store')[];
      loadMessages?: (lang: string) => Promise<Record<string, any>>;
    };
    onSetup?: (args: { getStore: GetStore }) => void;
    onMounted?: (args: { getStore: GetStore }) => void;
  }) {
    const self = this;
    const {
      baseURL = '/',
      stores = [],
      onSetup,
      routes,
      i18n
    } = options;

    if (i18n) {
      this.i18nConf = initI18n({
        baseURL,
        loadMessages: () => {
          return Promise.resolve({} as Record<string, any>);
        },
        ...i18n
      });
    }

    this.routes = routes;
    this.router = createRouter({
      baseURL,
      routes,
      i18nConf: this.i18nConf
    });

    const app = createApp({
      setup() {
        const { getStore } = useProvideStores({
          stores: [AppStore, ...stores]
        });
        const appStore = getStore(AppStore);
        self.globlStore = appStore;

        onSetup?.({ getStore });

        onMounted(() => {
          options.onMounted?.({ getStore });
        });

        return () => {
          return h(App);
        };
      }
    });

    app.use(createPinia());
    app.use(this.router);

    if (this.i18nConf) {
      app.use(this.i18nConf?.i18n);
    }

    this.app = app;
  }

  get i18n() {
    return this.i18nConf?.i18n || null;
  }

  defineApi(
    opts: {
      name: string;
      request: typeof ApiRequest;
    }
  ) {
    //
    console.log(opts);
  }

  defineMenus() {
    //
  }

  defineService() {
    //
  }
}
