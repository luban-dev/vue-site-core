import { nextTick, watchEffect } from 'vue';
import { createI18n } from 'vue-i18n';
import { joinUrl } from '../utils';

export type LanguagesMap = [RegExp, string][];

export const normalizeLang = (args: {
  lang: string;
  languages: string[];
  languagesMap: LanguagesMap;
}): string => {
  const { lang, languages, languagesMap } = args;
  if (!lang)
    return '';
  const l = lang.toLowerCase();
  const find = languages.find(v => v.toLowerCase() === l);
  if (find)
    return find;
  const findMap = languagesMap.find(v => v[0].test(l));
  return findMap ? findMap[1] : '';
};

export const getLangFromBrowser = (args: {
  languages: string[];
  languagesMap: LanguagesMap;
}) => {
  const { languages, languagesMap } = args;
  return normalizeLang({
    lang: navigator.language || navigator.languages[0] || '',
    languages,
    languagesMap
  });
};

export const getLangFromStore = (args: {
  languages: string[];
  languagesMap: LanguagesMap;
  languageKey: string;
}) => {
  const { languages, languagesMap, languageKey } = args;
  return normalizeLang({
    lang: localStorage.getItem(languageKey) || '',
    languages,
    languagesMap
  });
};

export const getLangFromPath = (args: {
  pathname?: string;
  languages: string[];
  languagesMap: LanguagesMap;
  baseURL: string;
}) => {
  const { languages, languagesMap, pathname = location.pathname, baseURL } = args;
  // '/en-US/'
  const start = joinUrl('/', baseURL, '/');
  const path = joinUrl('/', pathname.substring(start.length), '/');
  const p = path.split('/')[1] || '';
  return normalizeLang({
    lang: p,
    languages,
    languagesMap
  });
};

export const getInitLanguage = (args: {
  baseURL: string;
  pathname?: string;
  languages: string[];
  languagesMap: LanguagesMap;
  langTypes?: ('path' | 'browser' | 'store')[];
  languageKey?: string;
}): {
  lang: string;
} => {
  const {
    baseURL,
    languages,
    languagesMap,
    pathname,
    langTypes = ['path'],
    languageKey = 'language'
  } = args;
  let lang = '';

  for (const type of langTypes) {
    if (type === 'path') {
      lang = getLangFromPath({
        baseURL,
        pathname,
        languages,
        languagesMap
      });

      if (lang) {
        return { lang };
      }
    }

    if (type === 'browser') {
      lang = getLangFromBrowser({
        languages,
        languagesMap
      });

      if (lang) {
        return { lang };
      }
    }

    if (type === 'store') {
      lang = getLangFromStore({
        languageKey,
        languages,
        languagesMap
      });

      if (lang) {
        return { lang };
      }
    }
  }

  return { lang };
};

export const initI18n = (opts: {
  baseURL: string;
  languageKey?: string;
  languages?: string[];
  defaultLanguage?: string;
  languagesMap?: [RegExp, string][];
  langTypes?: ('path' | 'browser' | 'store')[];
  loadMessages: (lang: string) => Promise<Record<string, any>>;
}) => {
  const {
    baseURL,
    languageKey = 'language',
    languages = ['zh-CN', 'en-US'],
    languagesMap = [
      [/^en$/i, 'en-US'],
      [/^en-[a-z-]+$/i, 'en-US'],
      [/^zh$/i, 'zh-CN'],
      [/^zh-[a-z-]+$/i, 'zh-CN']
    ],
    langTypes = ['path'],
    loadMessages
  } = opts;
  const defaultLanguage = opts.defaultLanguage || languages[0] || 'zh-CN';

  const i18nMessages: Record<string, any> = {};
  for (const lang of languages) {
    i18nMessages[lang] = {};
  }

  const initInfo = getInitLanguage({
    baseURL,
    pathname: location.pathname,
    languages,
    languagesMap,
    languageKey,
    langTypes
  });

  const i18n = createI18n({
    legacy: false,
    locale: initInfo.lang,
    fallbackLocale: initInfo.lang,
    messages: i18nMessages
  });

  const isLangInPath = (pathname = location.pathname) => {
    return !!getLangFromPath({
      baseURL,
      pathname,
      languages,
      languagesMap
    });
  };

  const getLangHref = (lang: string) => {
    const pathname = location.pathname;
    const oldLangInPath = isLangInPath(pathname);
    const needAddPathLang = lang !== defaultLanguage;
    const start = joinUrl('/', baseURL, '/');
    const path = joinUrl('/', pathname.substring(start.length));
    let purePath = path;

    if (oldLangInPath) {
      purePath = path.replace(/^\/[a-z-]+/i, ``);
    }

    let newPath = purePath;
    if (needAddPathLang) {
      newPath = joinUrl(`/${lang}`, purePath);
    }

    const href = location.href;
    const url = new URL(href);
    url.pathname = newPath;

    return url.href;
  };

  const setLanguage = (lang: string) => {
    const oldLang = i18n.global.locale.value;
    if (lang === oldLang)
      return;
    location.replace(getLangHref(lang));
  };

  const loadedLangs: string[] = [];
  const loadLocaleMessages = async () => {
    const locale = i18n.global.locale.value;
    if (loadedLangs.includes(locale))
      return;
    // load locale messages with dynamic import
    const messages = await loadMessages(locale);
    // set locale and locale message
    i18n.global.setLocaleMessage(locale, messages.default);
    loadedLangs.push(locale);

    await nextTick();
  };

  const getLanguage = () => {
    return i18n.global.locale.value;
  };

  watchEffect(() => {
    const html = document.documentElement;
    html?.setAttribute('lang', i18n.global.locale.value);
  });

  const href = getLangHref(initInfo.lang);
  if (href !== location.href) {
    location.replace(href);
  }

  return {
    i18n,
    setLanguage,
    getLanguage,
    loadLocaleMessages,
    isLangInPath,
    getLangHref,
    languages,
    defaultLanguage
  };
};
