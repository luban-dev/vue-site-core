import qs from 'qs';
import type { RouteRecordRaw } from 'vue-router';
import { createWebHistory, createRouter as vueCreateRouter } from 'vue-router';
import type { initI18n } from '../i18n';

export const joinUrl = (...paths: string[]) => {
  const url = paths.join('/');
  return url.replace(/(^|\w)[\/]{2,}/g, '$1/');
};

export const createRouter = (opts: {
  routes: RouteRecordRaw[];
  baseURL: string;
  i18nConf?: ReturnType<typeof initI18n>;
}) => {
  let needAddPathLang = false;
  let routerBaseUrl = opts.baseURL;

  if (opts.i18nConf) {
    needAddPathLang = opts.i18nConf.getLanguage() !== opts.i18nConf.defaultLanguage;

    routerBaseUrl = needAddPathLang
      ? joinUrl(opts.baseURL, `/${opts.i18nConf.getLanguage()}`)
      : opts.baseURL;
  }

  const router = vueCreateRouter({
    history: createWebHistory(routerBaseUrl),
    routes: opts.routes,
    parseQuery: (v) => {
      return qs.parse(v) as any;
    },
    stringifyQuery: (v) => {
      const query = v || {};
      const str = qs.stringify(query, {
        encodeValuesOnly: true
      });
      return str;
    }
  });

  router.beforeEach(async (to, from, next) => {
    if (opts.i18nConf) {
      await opts.i18nConf.loadLocaleMessages();
    }

    if (from?.matched?.length) {
      to.meta.fromPath = from.fullPath || '';
    }

    return next();
  });

  router.afterEach(async () => {
    if (opts.i18nConf) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.querySelector('head')?.appendChild(canonical);
      }
      canonical.setAttribute('href', opts.i18nConf.getLangHref(opts.i18nConf.getLanguage()));

      opts.i18nConf.languages.forEach((lang) => {
        const langHref = opts.i18nConf!.getLangHref(lang);
        let alternate = document.querySelector(
      `link[rel="alternate"][hreflang="${lang}"]`
        );
        if (!alternate) {
          alternate = document.createElement('link');
          alternate.setAttribute('rel', 'alternate');
          alternate.setAttribute('hreflang', lang);
          document.querySelector('head')?.appendChild(alternate);
        }
        alternate.setAttribute('href', langHref);
      });
    }
  });

  return router;
};
