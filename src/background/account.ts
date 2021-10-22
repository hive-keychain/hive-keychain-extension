import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';

const sendBackImportedAccounts = (fileContent: string) => {
  chrome.runtime.sendMessage({
    command: BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS,
    value: fileContent,
  });
};

const AccountModule = {
  sendBackImportedAccounts,
};

export default AccountModule;
