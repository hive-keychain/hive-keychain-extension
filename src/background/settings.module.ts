import { FavoriteUserItems } from '@interfaces/favorite-user.interface';
import { LocalStorageClaimItem } from '@interfaces/local-storage-claim-item.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { Settings } from '@interfaces/settings.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import ArrayUtils from 'src/utils/array.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { ObjectUtils } from 'src/utils/object.utils';

const sendBackImportedFileContent = async (fileContent: any) => {
  const importedSettings: Settings = fileContent;
  try {
    if (!ObjectUtils.isPureObject(importedSettings)) {
      throw new Error('Bad format or not object');
    }
    if (
      importedSettings &&
      !Object.values(LocalStorageKeyEnum).includes(
        Object.keys(importedSettings)[0] as LocalStorageKeyEnum,
      )
    ) {
      const importedNoConfirm: any = importedSettings;
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
      if (importedSettings.autolock) {
        await LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.AUTOLOCK,
          importedSettings.autolock,
        );
      }
      if (importedSettings.claimAccounts) {
        let existingClaimsAccounts: LocalStorageClaimItem =
          await LocalStorageUtils.getValueFromLocalStorage(
            LocalStorageKeyEnum.CLAIM_ACCOUNTS,
          );
        if (!existingClaimsAccounts) existingClaimsAccounts = {};
        for (const username of Object.keys(importedSettings.claimAccounts)) {
          existingClaimsAccounts[username] =
            importedSettings.claimAccounts[username];
        }
        await LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.CLAIM_ACCOUNTS,
          existingClaimsAccounts,
        );
      }

      if (importedSettings.claimRewards) {
        let existingClaimsRewards: LocalStorageClaimItem =
          await LocalStorageUtils.getValueFromLocalStorage(
            LocalStorageKeyEnum.CLAIM_REWARDS,
          );
        if (!existingClaimsRewards) existingClaimsRewards = {};
        for (const username of Object.keys(importedSettings.claimRewards)) {
          existingClaimsRewards[username] =
            importedSettings.claimRewards[username];
        }
        await LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.CLAIM_REWARDS,
          existingClaimsRewards,
        );
      }

      if (importedSettings.keychainify_enabled) {
        await LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.KEYCHAINIFY_ENABLED,
          importedSettings.keychainify_enabled,
        );
      }

      if (importedSettings.no_confirm) {
        let existingNoConfirm: NoConfirm =
          await LocalStorageUtils.getValueFromLocalStorage(
            LocalStorageKeyEnum.NO_CONFIRM,
          );

        if (!existingNoConfirm) existingNoConfirm = {};
        for (const username of Object.keys(importedSettings.no_confirm)) {
          if (!existingNoConfirm[username]) existingNoConfirm[username] = {};
          for (const website of Object.keys(
            importedSettings.no_confirm[username],
          )) {
            existingNoConfirm[username][website] =
              importedSettings.no_confirm[username][website];
          }
        }
        await LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.NO_CONFIRM,
          existingNoConfirm,
        );
      }

      if (importedSettings.rpc) {
        let existingRpc: Rpc[] =
          await LocalStorageUtils.getValueFromLocalStorage(
            LocalStorageKeyEnum.RPC_LIST,
          );
        if (!existingRpc) existingRpc = [];
        await LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.RPC_LIST,
          ArrayUtils.mergeWithoutDuplicate(
            existingRpc,
            importedSettings.rpc,
            'uri',
          ),
        );
      }

      if (importedSettings.transfer_to) {
        let existingTransferTo: FavoriteUserItems =
          (await LocalStorageUtils.getValueFromLocalStorage(
            LocalStorageKeyEnum.FAVORITE_USERS,
          )) || {};

        for (const username of Object.keys(importedSettings.transfer_to)) {
          existingTransferTo[username] = [
            ...(existingTransferTo[username] || []),
            ...importedSettings.transfer_to[username],
          ];
        }
        await LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.FAVORITE_USERS,
          existingTransferTo,
        );
      }

      if (importedSettings.switchRpcAuto !== null) {
        await LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.SWITCH_RPC_AUTO,
          importedSettings.switchRpcAuto,
        );
      }

      if (importedSettings.current_rpc) {
        await LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.CURRENT_RPC,
          importedSettings.current_rpc,
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
