import MkModule from '@background/mk.module';
import BgdAccountsUtils from '@background/utils/accounts.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import EncryptUtils from 'src/utils/encrypt.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const sendBackImportedAccounts = async (fileContent: string) => {
  if (fileContent?.length) {
    const mk = await MkModule.getMk();
    const importedAccounts = BgdAccountsUtils.getAccountsFromFileData(
      fileContent,
      mk,
    );
    const accounts =
      EncryptUtils.decryptToJson(
        await LocalStorageUtils.getValueFromLocalStorage(
          LocalStorageKeyEnum.ACCOUNTS,
        ),
        mk,
      ) || [];
    const newAccounts =
      BgdAccountsUtils.mergeImportedAccountsToExistingAccounts(
        importedAccounts,
        accounts,
      );
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.ACCOUNTS,
      newAccounts,
    );
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
