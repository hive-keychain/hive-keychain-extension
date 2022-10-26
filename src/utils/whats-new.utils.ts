import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const saveLastSeen = () => {
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.LAST_VERSION_UPDATE,
    chrome.runtime.getManifest().version.split('.').splice(0, 2).join('.'),
  );
};

export const WhatsNewUtils = {
  saveLastSeen,
};
