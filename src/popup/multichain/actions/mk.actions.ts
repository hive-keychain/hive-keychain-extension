import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export const setMk = (mk: string, sendMk: boolean) => {
  LocalStorageUtils.saveValueInSessionStorage(LocalStorageKeyEnum.__MK, mk);
  return {
    type: MultichainActionType.SET_MK,
    payload: mk,
  };
};

export const forgetMk = () => {
  LocalStorageUtils.removeFromSessionStorage(LocalStorageKeyEnum.__MK);
  return {
    type: MultichainActionType.SET_MK,
    payload: '',
  };
};
