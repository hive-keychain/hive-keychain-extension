import { LocalStorageClaimItem } from '@interfaces/local-storage-claim-item.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { Settings } from '@interfaces/settings.interface';
import { TransferToItems } from '@interfaces/transfer-to-username.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import ArrayUtils from 'src/utils/array.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const sendBackImportedFileContent = async (fileContent: any) => {
  const settings: Settings = fileContent;
  try {
    if (
      settings &&
      !Object.values(LocalStorageKeyEnum).includes(
        Object.keys(settings)[0] as LocalStorageKeyEnum,
      )
    ) {
      const importedNoConfirm: any = settings;
      let existingNoConfirm: NoConfirm =
        await LocalStorageUtils.getValueFromLocalStorage(
          LocalStorageKeyEnum.NO_CONFIRM,
        );

      if (!existingNoConfirm) existingNoConfirm = {};
      for (const username of Object.keys(importedNoConfirm)) {
        if (!existingNoConfirm[username]) existingNoConfirm[username] = {};
        for (const website of Object.keys(importedNoConfirm[username])) {
          existingNoConfirm[username][website] =
            importedNoConfirm[username][website];
        }
      }
      await LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.NO_CONFIRM,
        existingNoConfirm,
      );
    } else {
      if (settings.autolock) {
        await LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.AUTOLOCK,
          settings.autolock,
        );
      }
      if (settings.claimAccounts) {
        let existingClaimsAccounts: LocalStorageClaimItem =
          await LocalStorageUtils.getValueFromLocalStorage(
            LocalStorageKeyEnum.CLAIM_ACCOUNTS,
          );
        if (!existingClaimsAccounts) existingClaimsAccounts = {};
        for (const username of Object.keys(settings.claimAccounts)) {
          existingClaimsAccounts[username] = settings.claimAccounts[username];
        }
        await LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.CLAIM_ACCOUNTS,
          existingClaimsAccounts,
        );
      }

      if (settings.claimRewards) {
        let existingClaimsRewards: LocalStorageClaimItem =
          await LocalStorageUtils.getValueFromLocalStorage(
            LocalStorageKeyEnum.CLAIM_REWARDS,
          );
        if (!existingClaimsRewards) existingClaimsRewards = {};
        for (const username of Object.keys(settings.claimRewards)) {
          existingClaimsRewards[username] = settings.claimRewards[username];
        }
        await LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.CLAIM_REWARDS,
          existingClaimsRewards,
        );
      }

      if (settings.keychainify_enabled) {
        await LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.KEYCHAINIFY_ENABLED,
          settings.keychainify_enabled,
        );
      }

      if (settings.no_confirm) {
        let existingNoConfirm: NoConfirm =
          await LocalStorageUtils.getValueFromLocalStorage(
            LocalStorageKeyEnum.NO_CONFIRM,
          );

        if (!existingNoConfirm) existingNoConfirm = {};
        for (const username of Object.keys(settings.no_confirm)) {
          if (!existingNoConfirm[username]) existingNoConfirm[username] = {};
          for (const website of Object.keys(settings.no_confirm[username])) {
            existingNoConfirm[username][website] =
              settings.no_confirm[username][website];
          }
        }
        await LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.NO_CONFIRM,
          existingNoConfirm,
        );
      }

      if (settings.rpc) {
        let existingRpc: Rpc[] =
          await LocalStorageUtils.getValueFromLocalStorage(
            LocalStorageKeyEnum.RPC_LIST,
          );
        if (!existingRpc) existingRpc = [];
        await LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.RPC_LIST,
          ArrayUtils.mergeWithoutDuplicate(existingRpc, settings.rpc, 'uri'),
        );
      }

      if (settings.transfer_to) {
        let existingTransferTo: TransferToItems =
          await LocalStorageUtils.getValueFromLocalStorage(
            LocalStorageKeyEnum.TRANSFER_TO_USERNAMES,
          );

        if (!existingTransferTo) existingTransferTo = {};
        for (const username of Object.keys(settings.transfer_to)) {
          existingTransferTo[username] = settings.transfer_to[username];
        }
        await LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.TRANSFER_TO_USERNAMES,
          existingTransferTo,
        );
      }
    }
    chrome.runtime.sendMessage({
      command: BackgroundCommand.IMPORT_SETTINGS_CALLBACK,
      value: 'html_popup_import_settings_successful',
    });
  } catch (err) {
    Logger.error(err);
    chrome.runtime.sendMessage({
      command: BackgroundCommand.IMPORT_SETTINGS_CALLBACK,
      value: 'html_popup_import_settings_error',
    });
  }
};

const SettingsModule = {
  sendBackImportedFileContent,
};

export default SettingsModule;
