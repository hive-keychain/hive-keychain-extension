import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import EncryptUtils from 'src/utils/encrypt.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const getAccountsFromFileData = (
  fileContent: string,
  mk: string,
): LocalAccount[] => {
  try {
    const accounts = EncryptUtils.decryptToJsonWithoutMD5Check(fileContent, mk);
    if (accounts) {
      return accounts?.list;
    } else {
      return [];
    }
  } catch (e) {
    throw new Error();
  }
};

const mergeImportedAccountsToExistingAccounts = (
  importedAccounts: LocalAccount[],
  existingAccounts: LocalAccount[],
) => {
  const newAccounts = [];
  for (const importedAccount of importedAccounts) {
    if (
      existingAccounts
        .map((existingAccount) => existingAccount.name)
        .includes(importedAccount.name)
    ) {
      const existingAccount = existingAccounts.find(
        (existingAccount) => existingAccount.name === importedAccount.name,
      );
      if (!existingAccount) continue;
      const account = {
        name: existingAccount.name,
        keys: existingAccount.keys,
      };
      if (importedAccount.keys.active && !existingAccount.keys.active) {
        account!.keys.active = importedAccount.keys.active;
        account!.keys.activePubkey = importedAccount.keys.activePubkey;
      }
      if (importedAccount.keys.memo && !existingAccount.keys.memo) {
        account!.keys.memo = importedAccount.keys.memo;
        account!.keys.memoPubkey = importedAccount.keys.memoPubkey;
      }
      if (importedAccount.keys.posting && !existingAccount.keys.posting) {
        account!.keys.posting = importedAccount.keys.posting;
        account!.keys.postingPubkey = importedAccount.keys.postingPubkey;
      }
      newAccounts.push(account);
    } else {
      newAccounts.push(importedAccount);
    }
  }
  for (const existingAccount of existingAccounts) {
    if (
      !newAccounts
        .map((existingAccount) => existingAccount.name)
        .includes(existingAccount.name)
    ) {
      newAccounts.push(existingAccount);
    }
  }
  return newAccounts;
};

const getAccountsFromLocalStorage = async (
  mk: string,
): Promise<LocalAccount[]> => {
  const encryptedAccounts = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.ACCOUNTS,
  );
  const accounts = EncryptUtils.decryptToJson(encryptedAccounts, mk);
  return accounts?.list;
};

const BgdAccountsUtils = {
  getAccountsFromFileData,
  mergeImportedAccountsToExistingAccounts,
  getAccountsFromLocalStorage,
};

export default BgdAccountsUtils;
