import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import EncryptedLocalStorageUtils from 'src/utils/encrypted-local-storage.utils';
import VaultUtils from 'src/utils/vault.utils';

export const setMk = (mk: string, sendMk: boolean) => {
  void VaultUtils.saveValueInVault(VaultKey.__MK, mk).then(() =>
    EncryptedLocalStorageUtils.migrateIdentitySettingsAfterUnlock(mk),
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
