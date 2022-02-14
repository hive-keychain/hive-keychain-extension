import MkModule from '@background/mk.module';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import AccountUtils from 'src/utils/account.utils';
import EncryptUtils from 'src/utils/encrypt.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const sendBackImportedAccounts = async (fileContent: string) => {
  if (fileContent?.length) {
    const mk = await MkModule.getMk();
    const importedAccounts = AccountUtils.getAccountsFromFileData(
      fileContent,
      mk,
    );
    const accounts = EncryptUtils.decryptToJson(
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.ACCOUNTS,
      ),
      mk,
    );
    const newAccounts = AccountUtils.mergeImportedAccountsToExistingAccounts(
      importedAccounts,
      accounts,
    );
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
