import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { ActionType } from './action-type.enum';

export const setMk = (mk: string, sendMk: boolean) => {
  LocalStorageUtils.saveValueInSessionStorage(LocalStorageKeyEnum.__MK, mk);
  return {
    type: ActionType.SET_MK,
    payload: mk,
  };
};

export const forgetMk = () => {
  LocalStorageUtils.removeFromSessionStorage(LocalStorageKeyEnum.__MK);
  return {
    type: ActionType.SET_MK,
    payload: '',
  };
};
