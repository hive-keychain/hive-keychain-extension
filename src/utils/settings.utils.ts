import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const exportSettings = async () => {
  const val = await LocalStorageUtils.getMultipleValueFromLocalStorage([
    LocalStorageKeyEnum.AUTOLOCK,
    LocalStorageKeyEnum.CLAIM_ACCOUNTS,
    LocalStorageKeyEnum.CLAIM_REWARDS,
    LocalStorageKeyEnum.NO_CONFIRM,
    LocalStorageKeyEnum.TRANSFER_TO_USERNAMES,
    LocalStorageKeyEnum.RPC_LIST,
    LocalStorageKeyEnum.KEYCHAINIFY_ENABLED,
  ]);

  var data = new Blob([JSON.stringify(val)], {
    type: 'text/plain',
  });
  var url = window.URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'settings.kc';
  a.click();
};

const importSettings = async () => {
  chrome.windows.getCurrent(async (currentWindow) => {
    console.log(chrome.runtime.getURL('import-preferences.html'));

    const win: chrome.windows.CreateData = {
      url: chrome.runtime.getURL('import-preferences.html'),
      type: 'popup',
      height: 566,
      width: 350,
      left: currentWindow.width! - 350 + currentWindow.left!,
      top: currentWindow.top,
    };
    // Except on Firefox
    //@ts-ignore
    if (typeof InstallTrigger === undefined) win.focused = true;
    const window = await chrome.windows.create(win);
    // setImportWindow(window.id);
    // chrome.runtime.onMessage.addListener(onSentBackSettingsListener);
  });
};

// const onSentBackSettingsListener = async (message: BackgroundMessage) => {
//   if (message.command === BackgroundCommand.SEND_BACK_SETTINGS) {
//     const settings: Settings = JSON.parse(message.value);

//     if (
//       settings &&
//       !Object.values(LocalStorageKeyEnum).includes(
//         Object.keys(settings)[0] as LocalStorageKeyEnum,
//       )
//     ) {
//       const importedNoConfirm: any = settings;
//       let existingNoConfirm: NoConfirm =
//         await LocalStorageUtils.getValueFromLocalStorage(
//           LocalStorageKeyEnum.NO_CONFIRM,
//         );

//       if (!existingNoConfirm) existingNoConfirm = {};
//       for (const username of Object.keys(importedNoConfirm)) {
//         if (!existingNoConfirm[username]) existingNoConfirm[username] = {};
//         for (const website of Object.keys(importedNoConfirm[username])) {
//           existingNoConfirm[username][website] =
//             importedNoConfirm[username][website];
//         }
//       }
//       await LocalStorageUtils.saveValueInLocalStorage(
//         LocalStorageKeyEnum.NO_CONFIRM,
//         existingNoConfirm,
//       );
//     } else {
//       if (settings.autolock) {
//         await LocalStorageUtils.saveValueInLocalStorage(
//           LocalStorageKeyEnum.AUTOLOCK,
//           settings.autolock,
//         );
//       }
//       if (settings.claimAccounts) {
//         let existingClaimsAccounts: LocalStorageClaimItem =
//           await LocalStorageUtils.getValueFromLocalStorage(
//             LocalStorageKeyEnum.CLAIM_ACCOUNTS,
//           );
//         if (!existingClaimsAccounts) existingClaimsAccounts = {};
//         for (const username of Object.keys(settings.claimAccounts)) {
//           existingClaimsAccounts[username] = settings.claimAccounts[username];
//         }
//         await LocalStorageUtils.saveValueInLocalStorage(
//           LocalStorageKeyEnum.CLAIM_ACCOUNTS,
//           existingClaimsAccounts,
//         );
//       }

//       if (settings.claimRewards) {
//         let existingClaimsRewards: LocalStorageClaimItem =
//           await LocalStorageUtils.getValueFromLocalStorage(
//             LocalStorageKeyEnum.CLAIM_REWARDS,
//           );
//         if (!existingClaimsRewards) existingClaimsRewards = {};
//         for (const username of Object.keys(settings.claimRewards)) {
//           existingClaimsRewards[username] = settings.claimRewards[username];
//         }
//         await LocalStorageUtils.saveValueInLocalStorage(
//           LocalStorageKeyEnum.CLAIM_REWARDS,
//           existingClaimsRewards,
//         );
//       }

//       if (settings.keychainify_enabled) {
//         await LocalStorageUtils.saveValueInLocalStorage(
//           LocalStorageKeyEnum.KEYCHAINIFY_ENABLED,
//           settings.keychainify_enabled,
//         );
//       }

//       if (settings.no_confirm) {
//         let existingNoConfirm: NoConfirm =
//           await LocalStorageUtils.getValueFromLocalStorage(
//             LocalStorageKeyEnum.NO_CONFIRM,
//           );

//         if (!existingNoConfirm) existingNoConfirm = {};
//         for (const username of Object.keys(settings.no_confirm)) {
//           if (!existingNoConfirm[username]) existingNoConfirm[username] = {};
//           for (const website of Object.keys(settings.no_confirm[username])) {
//             existingNoConfirm[username][website] =
//               settings.no_confirm[username][website];
//           }
//         }
//         await LocalStorageUtils.saveValueInLocalStorage(
//           LocalStorageKeyEnum.NO_CONFIRM,
//           existingNoConfirm,
//         );
//       }

//       if (settings.rpc) {
//         let existingRpc: Rpc[] =
//           await LocalStorageUtils.getValueFromLocalStorage(
//             LocalStorageKeyEnum.RPC_LIST,
//           );
//         if (!existingRpc) existingRpc = [];
//         await LocalStorageUtils.saveValueInLocalStorage(
//           LocalStorageKeyEnum.RPC_LIST,
//           [...existingRpc, settings.rpc],
//         );
//       }

//       if (settings.transfer_to) {
//         let existingTransferTo: TransferToItems =
//           await LocalStorageUtils.getValueFromLocalStorage(
//             LocalStorageKeyEnum.TRANSFER_TO_USERNAMES,
//           );

//         if (!existingTransferTo) existingTransferTo = {};
//         for (const username of Object.keys(settings.transfer_to)) {
//           existingTransferTo[username] = settings.transfer_to[username];
//         }
//         await LocalStorageUtils.saveValueInLocalStorage(
//           LocalStorageKeyEnum.TRANSFER_TO_USERNAMES,
//           existingTransferTo,
//         );
//       }
//     }
//     chrome.runtime.onMessage.removeListener(onSentBackSettingsListener);
//   }
// };

const SettingsUtils = {
  exportSettings,
  importSettings,
};

export default SettingsUtils;
