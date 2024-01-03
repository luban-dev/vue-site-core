# Vue Site Core

## install

```sh
npm i  @luban-ui/vue-site-core vue vue-router vue-i18n pinia pinia-di axios qs
```

## Start App

```ts
// app.ts
import { LubanApp } from '@luban-ui/vue-site-core';

const luban = new LubanApp({
  routes: [
    {
      path: '/',
      name: 'Layout',
      component: () => import('@/pages/Layout/index.vue'),
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/pages/Home/index.vue')
        },
        {
          path: ':pathMatch(.*)*',
          name: 'NotFound',
          component: () => import('@/pages/404/index.vue')
        }
      ]
    }
  ],
  baseURL: '/',
  stores: [],
  i18n: {
    languageKey: 'language',
    languages: ['zh-CN', 'en-US'],
    defaultLanguage: 'zh-CN',
    languagesMap: languagesMap = [
      [/^en$/i, 'en-US'],
      [/^en-[a-z-]+$/i, 'en-US'],
      [/^zh$/i, 'zh-CN'],
      [/^zh-[a-z-]+$/i, 'zh-CN']
    ],
    langTypes: ['path'],
    loadMessages: (lang: string) => import(`@/i18n/locales/${lang}.json`)
  },
  useDirectives: true,
  onSetup: (args: { getStore: GetStore }) => {},
  onMounted: (args: { getStore: GetStore }) => {}
});

const app = luban.app;
const i18n = luban.i18n;

export { app, i18n };
```

```ts
// main.ts
import { app } from './app';

// app.use(xxx)
// app.use(xxx)
// app.use(xxx)

app.mount('#app');
```
