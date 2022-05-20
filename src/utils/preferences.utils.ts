import {
  KeychainKeyTypesLC,
  KeychainRequest,
} from '@interfaces/keychain.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { getRequiredWifType } from 'src/utils/requests.utils';

export const isWhitelisted = (
  arr: NoConfirm,
  data: KeychainRequest,
  domain: string,
  current_rpc: Rpc,
) => {
  try {
    if (
      getRequiredWifType(data) === KeychainKeyTypesLC.active ||
      !arr ||
      !data.username ||
      current_rpc.testnet
    ) {
      return false;
    } else {
      return arr[data.username][domain][data.type];
    }
  } catch (e) {
    return false;
  }
};

export const addToWhitelist = async (
  username: string,
  domain: string,
  type: string,
) => {
  const no_confirm = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.NO_CONFIRM,
  );
  let keep = !no_confirm ? {} : no_confirm;
  if (keep[username] == undefined) {
    keep[username] = {};
  }
  if (keep[username][domain] == undefined) {
    keep[username][domain] = {};
  }
  keep[username][domain][type] = true;
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.NO_CONFIRM,
    keep,
  );
};

export const removeFromWhitelist = (
  noConfirm: NoConfirm,
  username: string,
  domain: string,
  operation: string,
) => {
  delete noConfirm[username][domain][operation];
  if (!Object.keys(noConfirm[username][domain]).length) {
    delete noConfirm[username][domain];
  }
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.NO_CONFIRM,
    noConfirm,
  );
  return noConfirm;
};
