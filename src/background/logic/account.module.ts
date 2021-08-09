import MkModule from 'src/background/logic/mk.module';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import AccountUtils from 'src/utils/account.utils';

const sendBackImportedAccounts = (fileContent: string) => {
  const importedAccounts = AccountUtils.getAccountsFromFileData(
    fileContent,
    MkModule.getMk(),
  );
  chrome.runtime.sendMessage({
    command: BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS,
    value: importedAccounts,
  });
};

const AccountModule = {
  sendBackImportedAccounts,
};

export default AccountModule;
