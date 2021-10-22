import { BackgroundCommand } from '@reference-data/background-message-key.enum';

const sendBackImportedFileContent = (fileContent: any) => {
  chrome.runtime.sendMessage({
    command: BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS,
    value: fileContent,
  });
};

const SettingsModule = {
  sendBackImportedFileContent,
};

export default SettingsModule;
