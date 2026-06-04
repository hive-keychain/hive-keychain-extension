import i18next, { i18n, TFunction, TOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

import deMessages from '../../public/_locales/de/messages.json';
import enMessages from '../../public/_locales/en/messages.json';
import esMessages from '../../public/_locales/es/messages.json';
import frMessages from '../../public/_locales/fr/messages.json';
import idMessages from '../../public/_locales/id/messages.json';
import ptMessages from '../../public/_locales/pt/messages.json';
import zhCNMessages from '../../public/_locales/zh-CN/messages.json';
import zhTWMessages from '../../public/_locales/zh-TW/messages.json';

interface ChromeMessagePlaceholder {
  content: string;
  example?: string;
}

interface ChromeMessage {
  message: string;
  description?: string;
  placeholders?: Record<string, ChromeMessagePlaceholder>;
}

type ChromeMessages = Record<string, ChromeMessage>;
const localeMessages = {
  de: deMessages,
  en: enMessages,
  es: esMessages,
  fr: frMessages,
  id: idMessages,
  pt: ptMessages,
  'zh-CN': zhCNMessages,
  'zh-TW': zhTWMessages,
} satisfies Record<string, ChromeMessages>;

type SupportedLocale = keyof typeof localeMessages;
type TranslationParams = string | string[];

export interface I18nLanguageOption {
  label: string;
  value: SupportedLocale;
  key: SupportedLocale;
}

const DEFAULT_LOCALE: SupportedLocale = 'en';
const TRANSLATION_NAMESPACE = 'translation';
const INTERPOLATION_PARAM_PREFIX = 'keychainParam';
const LANGUAGE_CHANGED_EVENT = 'keychain-i18n-language-changed';

const languageLabels: Record<SupportedLocale, string> = {
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  id: 'Bahasa Indonesia',
  pt: 'Português',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
};

const languageOptions: I18nLanguageOption[] = (
  Object.keys(localeMessages) as SupportedLocale[]
).map((locale) => ({
  key: locale,
  label: languageLabels[locale],
  value: locale,
}));

let i18nInstance: i18n | undefined;

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const convertChromePlaceholderReference = (value: string) =>
  value.replace(/\$(\d+)/g, (_, index: string) => {
    return `{{${INTERPOLATION_PARAM_PREFIX}${index}}}`;
  });

const convertChromeMessage = (message: ChromeMessage) => {
  let convertedMessage = message.message;

  if (message.placeholders) {
    for (const [placeholderName, placeholder] of Object.entries(
      message.placeholders,
    )) {
      const placeholderPattern = new RegExp(
        `\\$${escapeRegExp(placeholderName)}\\$`,
        'gi',
      );
      convertedMessage = convertedMessage.replace(
        placeholderPattern,
        convertChromePlaceholderReference(placeholder.content),
      );
    }
  }

  return convertChromePlaceholderReference(convertedMessage);
};

const convertChromeMessages = (messages: ChromeMessages) => {
  return Object.entries(messages).reduce<Record<string, string>>(
    (resources, [key, message]) => {
      resources[key] = convertChromeMessage(message);
      return resources;
    },
    {},
  );
};

const isSupportedLocale = (language: string): language is SupportedLocale => {
  return Object.prototype.hasOwnProperty.call(localeMessages, language);
};

const getSupportedLocale = (language?: string): SupportedLocale => {
  const normalizedLanguage = (language || DEFAULT_LOCALE).replace('_', '-');
  const baseLanguage = normalizedLanguage.split('-')[0];

  if (isSupportedLocale(normalizedLanguage)) {
    return normalizedLanguage;
  }

  if (isSupportedLocale(baseLanguage)) {
    return baseLanguage;
  }

  return DEFAULT_LOCALE;
};

const getDefaultLanguage = () => getSupportedLocale(getUILanguage());

const getLanguageOptions = () => [...languageOptions];

const getLanguageOption = (language?: string) => {
  const supportedLocale = getSupportedLocale(language);
  return (
    languageOptions.find((option) => option.value === supportedLocale) ??
    languageOptions.find((option) => option.value === DEFAULT_LOCALE)!
  );
};

const getSavedLanguagePreference = async () => {
  try {
    const language = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.ACTIVE_LANGUAGE,
    );

    if (typeof language !== 'string') {
      return undefined;
    }

    return getSupportedLocale(language);
  } catch {
    return undefined;
  }
};

const getSavedOrDefaultLanguage = async () => {
  return (await getSavedLanguagePreference()) ?? getDefaultLanguage();
};

const getUILanguage = () => {
  if (typeof chrome !== 'undefined' && chrome.i18n?.getUILanguage) {
    return chrome.i18n.getUILanguage();
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }

  return DEFAULT_LOCALE;
};

const buildInterpolationOptions = (
  params?: TranslationParams,
): TOptions | undefined => {
  if (!params?.length) {
    return undefined;
  }

  const normalizedParams = Array.isArray(params) ? params : [params];

  return normalizedParams.reduce<Record<string, string>>(
    (options, param, index) => {
      options[`${INTERPOLATION_PARAM_PREFIX}${index + 1}`] = param;
      return options;
    },
    {},
  );
};

const getResources = () => {
  return Object.entries(localeMessages).reduce<
    Record<string, Record<typeof TRANSLATION_NAMESPACE, Record<string, string>>>
  >((resources, [locale, messages]) => {
    resources[locale] = {
      [TRANSLATION_NAMESPACE]: convertChromeMessages(messages),
    };
    return resources;
  }, {});
};

const getInstance = () => {
  if (i18nInstance) {
    return i18nInstance;
  }

  i18nInstance = i18next.createInstance();
  i18nInstance.use(initReactI18next).init({
    resources: getResources(),
    lng: getSupportedLocale(getUILanguage()),
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: TRANSLATION_NAMESPACE,
    ns: [TRANSLATION_NAMESPACE],
    interpolation: {
      escapeValue: false,
    },
    initImmediate: false,
    returnNull: false,
    parseMissingKeyHandler: (key) => key,
  });

  return i18nInstance;
};

const getCurrentLanguage = () => {
  return getSupportedLocale(getInstance().language || getDefaultLanguage());
};

const getMessageFromTFunction = (
  t: TFunction,
  key: string,
  params?: TranslationParams,
) => {
  const translatedMessage = t(key, buildInterpolationOptions(params));
  return typeof translatedMessage === 'string' ? translatedMessage : key;
};

const getMessage = (key: string, params?: TranslationParams) => {
  return getMessageFromTFunction(getInstance().t, key, params);
};

const emitLanguageChanged = (language: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGED_EVENT, {
    detail: language,
  }));
};

const changeLanguage = async (language: string) => {
  const supportedLocale = getSupportedLocale(language);
  await getInstance().changeLanguage(supportedLocale);
  emitLanguageChanged(supportedLocale);
  return supportedLocale;
};

const initLanguageFromStorage = async () => {
  return changeLanguage(await getSavedOrDefaultLanguage());
};

const saveLanguage = async (language: string) => {
  const supportedLocale = getSupportedLocale(language);
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.ACTIVE_LANGUAGE,
    supportedLocale,
  );
  await changeLanguage(supportedLocale);
  return supportedLocale;
};

const resetForTesting = () => {
  i18nInstance = undefined;
};

export const I18nUtils = {
  LANGUAGE_CHANGED_EVENT,
  changeLanguage,
  getCurrentLanguage,
  getDefaultLanguage,
  getInstance,
  getLanguageOption,
  getLanguageOptions,
  getMessage,
  getMessageFromTFunction,
  getSavedOrDefaultLanguage,
  getSupportedLocale,
  initLanguageFromStorage,
  resetForTesting,
  saveLanguage,
};
