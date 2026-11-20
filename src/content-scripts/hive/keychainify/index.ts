// Hydration-safe extension detection for Dapps—avoids SSR/Next.js hydration issues
if (!(window as any).hive_keychain_extension) {
  (window as any).hive_keychain_extension = true;
  window.dispatchEvent(new Event('hive-keychain-loaded'));
}

import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import keychainify from './keychainify';

let keychainifyEnabled = false;

const setKeychainifyEnabled = (enabled: boolean) => {
  keychainifyEnabled = enabled;
};

const shouldInterceptHref = (href: string): boolean => {
  if (keychainify.isSupportedHiveUri(href)) {
    return true;
  }
  return keychainifyEnabled && keychainify.isSupportedHiveSignerUrl(href);
};

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  const anchor = target.closest('a[href]');
  if (!(anchor instanceof HTMLAnchorElement) || !anchor.href) {
    return;
  }
  if (!shouldInterceptHref(anchor.href)) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  keychainify.keychainifyUrl(anchor.href);
};

keychainify.isKeychainifyEnabled().then(setKeychainifyEnabled);

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') {
    return;
  }
  const change = changes[LocalStorageKeyEnum.KEYCHAINIFY_ENABLED];
  if (!change) {
    return;
  }
  setKeychainifyEnabled(Boolean(change.newValue));
});

document.addEventListener('click', handleDocumentClick, true);
