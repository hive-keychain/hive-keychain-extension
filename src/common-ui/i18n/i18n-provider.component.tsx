import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { I18nUtils } from 'src/utils/i18n.utils';

interface Props {
  children: React.ReactNode;
}

export const I18nProviderComponent = ({ children }: Props) => {
  const [language, setLanguage] = useState(I18nUtils.getCurrentLanguage());

  useEffect(() => {
    let isMounted = true;

    void I18nUtils.initLanguageFromStorage().then((nextLanguage) => {
      if (isMounted) {
        setLanguage(nextLanguage);
      }
    });

    const handleLanguageChanged = (event: Event) => {
      setLanguage(
        I18nUtils.getSupportedLocale((event as CustomEvent<string>).detail),
      );
    };

    const handleStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName !== 'local') {
        return;
      }

      const languageChange = changes[LocalStorageKeyEnum.ACTIVE_LANGUAGE];
      if (typeof languageChange?.newValue !== 'string') {
        return;
      }

      void I18nUtils.changeLanguage(languageChange.newValue).then(
        (nextLanguage) => {
          if (isMounted) {
            setLanguage(nextLanguage);
          }
        },
      );
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(
        I18nUtils.LANGUAGE_CHANGED_EVENT,
        handleLanguageChanged,
      );
    }

    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener(
          I18nUtils.LANGUAGE_CHANGED_EVENT,
          handleLanguageChanged,
        );
      }
      if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      }
    };
  }, []);

  return (
    <I18nextProvider key={language} i18n={I18nUtils.getInstance()}>
      {children}
    </I18nextProvider>
  );
};
