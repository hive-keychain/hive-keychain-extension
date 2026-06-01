import MkModule from '@background/hive/modules/mk.module';
import BgdAccountsUtils from '@background/hive/utils/accounts.utils';
import { ImportCallbackPayload } from '@interfaces/import-callback.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { EvmWalletUtils } from 'src/popup/evm/utils/wallet.utils';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import { CommunicationUtils } from 'src/utils/communication.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const sendImportError = () => {
  const response: ImportCallbackPayload = {
    success: false,
    message: 'import_html_error',
  };
  CommunicationUtils.runtimeSendMessage({
    command: BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS,
    value: response,
  });
};

const sendBackImportedAccounts = async (fileContent: string) => {
  if (fileContent?.length) {
    const mk = await MkModule.getMk();
    try {
      const { hasLedger } = await EvmWalletUtils.importAccountsFromFileData(
        fileContent,
        mk,
      );
      const response: ImportCallbackPayload = {
        success: true,
        message: 'import_html_success',
        accountType: 'evm',
        warning: hasLedger
          ? {
              message: 'ledger_import_account_has_ledger',
              params: [chrome.runtime.getURL('link-ledger-device.html')],
            }
          : null,
      };
      CommunicationUtils.runtimeSendMessage({
        command: BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS,
        value: response,
      });
      return;
    } catch (e) {}

    let importedAccounts;
    try {
      importedAccounts = await BgdAccountsUtils.getAccountsFromFileData(
        fileContent,
        mk,
      );
    } catch (e) {
      sendImportError();
      return;
    }

    const accounts =
      (await EncryptUtils.decryptToJson(
        await LocalStorageUtils.getValueFromLocalStorage(
          LocalStorageKeyEnum.ACCOUNTS,
        ),
        mk,
      )) || [];

    const newAccounts =
      await BgdAccountsUtils.mergeImportedAccountsToExistingAccounts(
        importedAccounts,
        accounts.list || [],
      );
    const newAccountsEncrypted = await EncryptUtils.encryptJson(
      { list: newAccounts },
      mk,
    );
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.ACCOUNTS,
      newAccountsEncrypted,
    );

    let useLedger = newAccounts.some(
      (account) =>
        account.keys.active?.startsWith('#') ||
        account.keys.posting?.startsWith('#') ||
        account.keys.memo?.startsWith('#'),
    );
    const response: ImportCallbackPayload = {
      success: true,
      message: 'import_html_success',
      accountType: 'hive',
      accounts: newAccounts,
      warning: useLedger
        ? {
            message: 'ledger_import_account_has_ledger',
            params: [chrome.runtime.getURL('link-ledger-device.html')],
          }
        : null,
    };
    CommunicationUtils.runtimeSendMessage({
      command: BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS,
      value: response,
    });
  }
};

export const AccountModule = {
  sendBackImportedAccounts,
};

export default AccountModule;
