import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import VaultUtils from 'src/utils/vault.utils';

export const setMk = (mk: string, sendMk: boolean) => {
  VaultUtils.saveValueInVault(VaultKey.__MK, mk);
  void import('@background/hive/modules/local-storage.module').then(
    (localStorageModule) =>
      localStorageModule.default.checkAndUpdateLocalStorage(),
  );
  return {
    type: MultichainActionType.SET_MK,
    payload: mk,
  };
};

export const forgetMk = () => {
  void import('src/utils/encrypted-local-storage.utils').then(
    (encryptedLocalStorage) => encryptedLocalStorage.default.clearCache(),
  );
  VaultUtils.removeFromVault(VaultKey.__MK);
  return {
    type: MultichainActionType.SET_MK,
    payload: '',
  };
};
