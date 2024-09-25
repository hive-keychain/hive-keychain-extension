import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

function getMk() {
  return LocalStorageUtils.getValueFromSessionStorage(LocalStorageKeyEnum.__MK);
}

const login = async (mk: string) => {
  const hiveEncryptedAccounts =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.ACCOUNTS,
    );
  const hiveAccounts = await EncryptUtils.decryptToJson(
    hiveEncryptedAccounts,
    mk,
  );
  if (!!hiveAccounts) return true;

  const evmEncryptedAccounts = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_ACCOUNTS,
  );
  const evmAccounts = await EncryptUtils.decryptToJson(
    evmEncryptedAccounts,
    mk,
  );

  return !!evmAccounts;
};

async function sendBackMk() {
  chrome.runtime.sendMessage({
    command: BackgroundCommand.SEND_BACK_MK,
    value: await getMk(),
  });
}

function saveMk(newMk: string) {
  LocalStorageUtils.saveValueInSessionStorage(LocalStorageKeyEnum.__MK, newMk);
}

function lock() {
  LocalStorageUtils.removeFromSessionStorage(LocalStorageKeyEnum.__MK);
}

const MkModule = {
  sendBackMk,
  saveMk,
  getMk,
  lock,
  login,
};
export default MkModule;
