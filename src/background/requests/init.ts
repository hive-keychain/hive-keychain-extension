import MkModule from '@background/mk.module';
import RequestsModule from '@background/requests';
import { createPopup } from '@background/requests/dialog-lifecycle';
import sendErrors from '@background/requests/errors';
import {
  KeychainKeyTypesLC,
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { UserPreference } from '@interfaces/preferences.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import EncryptUtils from 'src/utils/encrypt.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export default async (
  request: KeychainRequest,
  tab: number | undefined,
  domain: string,
) => {
  const items: {
    accounts: string;
    current_rpc: Rpc;
    no_confirm: UserPreference[];
  } = await LocalStorageUtils.getMultipleValueFromLocalStorage([
    LocalStorageKeyEnum.ACCOUNTS,
    LocalStorageKeyEnum.NO_CONFIRM,
    LocalStorageKeyEnum.CURRENT_RPC,
  ]);
  console.log(items);
  const { username, type } = request;
  if (!items.accounts && type !== KeychainRequestTypes.addAccount) {
    // Wallet not initialized
    showInitializeWalletDialog(tab!, request);
  } else if (!items.accounts && !MkModule.getMk()) {
    // Wallet not initialized for adding first account
    showInitializeWalletToAddAccountDialog(tab!, request, domain);
  } else if (!MkModule.getMk()) {
    // if locked
    showUnlockWalletDialog(tab!, request, domain);
  } else {
    // Check that user and wanted keys are in the wallet
    RequestsModule.initializeParams(
      EncryptUtils.decryptToJson(
        items.accounts,
        MkModule.getMk()!,
      ) as LocalAccount[],
      items.current_rpc,
      items.no_confirm,
    );
    /*
    let account = null;
    if (accountsList.get(username) && type === KeychainRequestTypes.addAccount) {
      createPopup(() => {
        sendErrors(
          tab,
          'user_cancel',
          chrome.i18n.getMessage('bgd_auth_canceled'),
          chrome.i18n.getMessage('popup_accounts_already_registered', [
            username,
          ]),
          request,
        );
      });
    } else if (type === 'addAccount') {
      const callback = () => {
        chrome.runtime.sendMessage({
          command: 'sendDialogConfirm',
          data: request,
          domain,
          tab,
        });
      };
      createPopup(callback);
    } else if (type === 'transfer') {
      let tr_accounts = accountsList
        .getList()
        .filter((e) => e.hasKey('active'))
        .map((e) => e.getName());

      const encode = memo && memo.length > 0 && memo[0] == '#';
      const enforced = enforce || encode;
      if (encode) account = accountsList.get(username);
      // If a username is specified, check that its active key has been added to the wallet
      if (
        enforced &&
        username &&
        !accountsList.get(username).hasKey('active')
      ) {
        createPopup(() => {
          sendErrors(
            tab,
            'user_cancel',
            chrome.i18n.getMessage('bgd_auth_canceled'),
            chrome.i18n.getMessage('bgd_auth_transfer_no_active', [username]),
            request,
          );
        });
      } else if (encode && !account.hasKey('memo')) {
        createPopup(() => {
          sendErrors(
            tab,
            'user_cancel',
            chrome.i18n.getMessage('bgd_auth_canceled'),
            chrome.i18n.getMessage('bgd_auth_transfer_no_memo', [username]),
            request,
          );
        });
      } else if (tr_accounts.length == 0) {
        createPopup(() => {
          sendErrors(
            tab,
            'user_cancel',
            chrome.i18n.getMessage('bgd_auth_canceled'),
            chrome.i18n.getMessage('bgd_auth_transfer_no_active', [username]),
            request,
          );
        });
      } else {
        const callback = () => {
          chrome.runtime.sendMessage({
            command: 'sendDialogConfirm',
            data: request,
            domain,
            accounts: tr_accounts,
            tab,
            testnet: items.current_rpc === 'TESTNET',
          });
        };
        createPopup(callback);
      }
      // if transfer
    } else if (
      [
        'delegation',
        'witnessVote',
        'proxy',
        'custom',
        'signBuffer',
        'recurrentTransfer',
      ].includes(type) &&
      !username
    ) {
      // if no username specified for witness vote or delegation
      const filterKey = getRequiredWifType(request);
      const tr_accounts = accountsList
        .getList()
        .filter((e) => e.hasKey(filterKey))
        .map((e) => e.getName());
      if (tr_accounts.length == 0) {
        createPopup(() => {
          sendErrors(
            tab,
            'user_cancel',
            chrome.i18n.getMessage('bgd_auth_canceled'),
            chrome.i18n.getMessage('bgd_auth_no_active'),
            request,
          );
        });
      } else {
        const callback = () => {
          chrome.runtime.sendMessage({
            command: 'sendDialogConfirm',
            data: request,
            domain,
            accounts: tr_accounts,
            tab,
            testnet: items.current_rpc === 'TESTNET',
          });
        };
        createPopup(callback);
      }
    } else {
      // if not a transfer nor witness/delegation with dropdown
      if (!accountsList.get(username)) {
        const callback = () => {
          sendErrors(
            tab,
            'user_cancel',
            chrome.i18n.getMessage('bgd_auth_canceled'),
            chrome.i18n.getMessage('bgd_auth_no_account', [username]),
            request,
          );
        };
        createPopup(callback);
      } else {
        account = accountsList.get(username);
        let typeWif = getRequiredWifType(request);
        let req = request;
        req.key = typeWif;

        if (req.type == 'custom') req.method = typeWif;

        if (req.type == 'broadcast') {
          req.typeWif = typeWif;
        }

        if (!account.hasKey(typeWif)) {
          createPopup(() => {
            sendErrors(
              tab,
              'user_cancel',
              chrome.i18n.getMessage('bgd_auth_canceled'),
              chrome.i18n.getMessage('bgd_auth_no_key', [username, typeWif]),
              request,
            );
          });
        } else {
          public = account.getKey(`${typeWif}Pubkey`);
          key = account.getKey(typeWif);
          if (!hasNoConfirm(items.no_confirm, req, domain, items.current_rpc)) {
            const callback = () => {
              chrome.runtime.sendMessage({
                command: 'sendDialogConfirm',
                data: req,
                domain,
                tab,
                testnet: items.current_rpc === 'TESTNET',
              });
            };
            createPopup(callback);
            // Send the request to confirmation window
          } else {
            chrome.runtime.sendMessage({
              command: 'broadcastingNoConfirm',
            });
            performTransaction(req, tab, true);
          }
        }
      }
    }
*/
  }
};

const showInitializeWalletDialog = (tab: number, request: KeychainRequest) => {
  createPopup(() => {
    sendErrors(
      tab,
      'no_wallet',
      chrome.i18n.getMessage('bgd_init_no_wallet'),
      chrome.i18n.getMessage('bgd_init_no_wallet_explained'),
      request,
    );
  });
};

const showInitializeWalletToAddAccountDialog = (
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  createPopup(() => {
    chrome.runtime.sendMessage({
      command: 'sendDialogError',
      msg: {
        success: false,
        error: 'register',
        result: null,
        data: request,
        message: chrome.i18n.getMessage('popup_html_register'),
        display_msg: chrome.i18n.getMessage('popup_html_register'),
      },
      tab,
      domain,
    });
  });
};

const showUnlockWalletDialog = (
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  createPopup(() => {
    chrome.runtime.sendMessage({
      command: 'sendDialogError',
      msg: {
        success: false,
        error: 'locked',
        result: null,
        data: request,
        message: chrome.i18n.getMessage('bgd_auth_locked'),
        display_msg: chrome.i18n.getMessage('bgd_auth_locked_desc'),
      },
      tab,
      domain,
    });
  });
};

const hasNoConfirm = (
  arr: any, //TODO: Change any
  data: KeychainRequest,
  domain: string,
  current_rpc: Rpc,
) => {
  try {
    if (
      getRequiredWifType(data) === KeychainKeyTypesLC.active ||
      !arr ||
      current_rpc.testnet
    ) {
      return false;
    } else {
      console.log('consider');
      return JSON.parse(arr)[data.username!][domain][data.type] == true;
    }
  } catch (e) {
    console.log(e);
    return false;
  }
};

// Get the key needed for each type of transaction
const getRequiredWifType = (request: KeychainRequest) => {
  switch (request.type) {
    case 'decode':
    case 'encode':
    case 'signBuffer':
    case 'broadcast':
    case 'addAccountAuthority':
    case 'removeAccountAuthority':
    case 'removeKeyAuthority':
    case 'addKeyAuthority':
    case 'signTx':
      return request.method.toLowerCase() as KeychainKeyTypesLC;
    case 'post':
    case 'vote':
      return KeychainKeyTypesLC.posting;
    case 'custom':
      return !request.method
        ? KeychainKeyTypesLC.posting
        : (request.method.toLowerCase() as KeychainKeyTypesLC);

    case 'signedCall':
      return request.typeWif.toLowerCase() as KeychainKeyTypesLC;
    case 'transfer':
    case 'sendToken':
    case 'delegation':
    case 'witnessVote':
    case 'proxy':
    case 'powerUp':
    case 'powerDown':
    case 'createClaimedAccount':
    case 'createProposal':
    case 'removeProposal':
    case 'updateProposalVote':
    case 'convert':
    case 'recurrentTransfer':
    default:
      return KeychainKeyTypesLC.active;
  }
};
