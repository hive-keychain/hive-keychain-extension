import MkModule from '@background/hive/modules/mk.module';
import SettingsModule from '@background/hive/modules/settings.module';
import BgdAccountsUtils from '@background/hive/utils/accounts.utils';
import { ExportedAccountsV2 } from '@interfaces/exported-accounts.interface';
import { ImportCallbackPayload } from '@interfaces/import-callback.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import {
  EvmAccountSource,
  StoredEvmAccountSource,
} from 'src/popup/evm/interfaces/wallet.interface';
import { EvmWalletUtils } from 'src/popup/evm/utils/wallet.utils';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import { CommunicationUtils } from 'src/utils/communication.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { ObjectUtils } from 'src/utils/object.utils';

const isExportedAccountsV2 = (value: unknown): value is ExportedAccountsV2 => {
  const payload = value as ExportedAccountsV2;
  return (
    !!payload &&
    payload.v === 2 &&
    Array.isArray(payload.hiveAccounts) &&
    Array.isArray(payload.evmAccounts) &&
    (payload.settings === undefined || ObjectUtils.isPureObject(payload.settings))
  );
};

const hasV2ExportVersionTag = (value: unknown) => {
  const payload = value as { v?: unknown };
  return !!payload && typeof payload === 'object' && payload.v === 2;
};

const getLedgerImportWarning = (): ImportCallbackPayload['warning'] => ({
  message: 'ledger_import_account_has_ledger',
  params: [chrome.runtime.getURL('detached_window.html#ledger/link-device')],
});

const hasHiveLedgerAccounts = (accounts: LocalAccount[]) =>
  accounts.some(
    (account) =>
      account.keys.active?.startsWith('#') ||
      account.keys.posting?.startsWith('#') ||
      account.keys.memo?.startsWith('#'),
  );

const hasEvmLedgerAccounts = (accounts: StoredEvmAccountSource[]) =>
  accounts.some((accountSource) => accountSource.type === EvmAccountSource.LEDGER);

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

const sendImportSuccess = (response: ImportCallbackPayload) => {
  CommunicationUtils.runtimeSendMessage({
    command: BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS,
    value: response,
  });
};

const importExportedAccountsV2 = async (
  exportedAccounts: ExportedAccountsV2,
  mk: string,
) => {
  const existingHiveAccounts =
    (await BgdAccountsUtils.getAccountsFromLocalStorage(mk)) ?? [];
  const mergedHiveAccounts =
    await BgdAccountsUtils.mergeImportedAccountsToExistingAccounts(
      exportedAccounts.hiveAccounts,
      existingHiveAccounts,
    );
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.ACCOUNTS,
    await EncryptUtils.encryptJson({ list: mergedHiveAccounts }, mk),
  );

  const existingEvmAccounts = await EvmWalletUtils.getAccountsFromLocalStorage(mk);
  const mergedEvmAccounts = EvmWalletUtils.mergeImportedEvmAccountsToExistingAccounts(
    exportedAccounts.evmAccounts,
    existingEvmAccounts,
  );
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_ACCOUNTS,
    await EncryptUtils.encryptJson({ list: mergedEvmAccounts }, mk),
  );
  EvmWalletUtils.invalidateRebuildAccountsCache();

  if (exportedAccounts.settings) {
    await SettingsModule.importSettings(exportedAccounts.settings);
  }
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.HAS_FINISHED_SIGNUP,
    true,
  );

  sendImportSuccess({
    success: true,
    message: 'import_html_success',
    accountType: 'all',
    accounts: mergedHiveAccounts,
    warning:
      hasHiveLedgerAccounts(mergedHiveAccounts) ||
      hasEvmLedgerAccounts(exportedAccounts.evmAccounts)
        ? getLedgerImportWarning()
        : null,
  });
};

const sendBackImportedAccounts = async (fileContent: string) => {
  if (fileContent?.length) {
    const mk = await MkModule.getMk();
    try {
      const decryptedPayload = await EncryptUtils.decryptToAnyJsonWithLegacySupport(
        fileContent,
        mk,
      );
      if (isExportedAccountsV2(decryptedPayload)) {
        await importExportedAccountsV2(decryptedPayload, mk);
        return;
      }
      if (hasV2ExportVersionTag(decryptedPayload)) {
        sendImportError();
        return;
      }
    } catch (e) {}

    try {
      const { hasLedger } = await EvmWalletUtils.importAccountsFromFileData(
        fileContent,
        mk,
      );
      sendImportSuccess({
        success: true,
        message: 'import_html_success',
        accountType: 'evm',
        warning: hasLedger ? getLedgerImportWarning() : null,
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

    const newAccounts =
      await BgdAccountsUtils.mergeImportedAccountsToExistingAccounts(
        importedAccounts,
        (await BgdAccountsUtils.getAccountsFromLocalStorage(mk)) ?? [],
      );
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.ACCOUNTS,
      await EncryptUtils.encryptJson({ list: newAccounts }, mk),
    );

    sendImportSuccess({
      success: true,
      message: 'import_html_success',
      accountType: 'hive',
      accounts: newAccounts,
      warning: hasHiveLedgerAccounts(newAccounts) ? getLedgerImportWarning() : null,
    });
  }
};

export const AccountModule = {
  sendBackImportedAccounts,
};

export default AccountModule;
