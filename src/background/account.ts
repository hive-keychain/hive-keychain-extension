import MkModule from '@background/mk.module';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import EncryptUtils from 'src/utils/encrypt.utils';
import ImportAccountsUtils from 'src/utils/import-accounts.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const sendBackImportedAccounts = async (fileContent: string) => {
  if (fileContent?.length) {
    const mk = await MkModule.getMk();
    console.log(mk);
    const importedAccounts = ImportAccountsUtils.getAccountsFromFileData(
      fileContent,
      mk,
    );
    console.log(importedAccounts);
    const accounts =
      EncryptUtils.decryptToJson(
        await LocalStorageUtils.getValueFromLocalStorage(
          LocalStorageKeyEnum.ACCOUNTS,
        ),
        mk,
      ) || [];
    const newAccounts =
      ImportAccountsUtils.mergeImportedAccountsToExistingAccounts(
        importedAccounts,
        accounts,
      );
    console.log(newAccounts);
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.ACCOUNTS,
      newAccounts,
    );
    // chrome.windows.remove(importWindow!);
    chrome.runtime.sendMessage({
      command: BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS,
      value: newAccounts,
    });
  }
};

const AccountModule = {
  sendBackImportedAccounts,
};

export default AccountModule;
