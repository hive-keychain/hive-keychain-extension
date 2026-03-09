import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import VaultUtils from 'src/utils/vault.utils';

export const setMk = (mk: string, sendMk: boolean) => {
  VaultUtils.saveValueInVault(VaultKey.__MK, mk);
  return {
    type: MultichainActionType.SET_MK,
    payload: mk,
  };
};

export const forgetMk = () => {
  VaultUtils.removeFromVault(VaultKey.__MK);
  return {
    type: MultichainActionType.SET_MK,
    payload: '',
  };
};
