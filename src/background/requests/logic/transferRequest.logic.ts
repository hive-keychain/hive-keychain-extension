import { createPopup } from '@background/requests/dialog-lifecycle';
import sendErrors from '@background/requests/errors';
import {
  KeychainRequest,
  RequestTransfer,
} from '@interfaces/keychain.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';

export const transferRequest = (
  tab: number,
  request: RequestTransfer,
  domain: string,
  accounts: LocalAccount[],
  current_rpc: Rpc,
  account?: LocalAccount,
) => {
  const active_accounts = accounts
    .filter((e) => !!e.keys.active)
    .map((e) => e.name);
  const { username, memo, enforce } = request;
  const encode = memo && memo.length > 0 && memo[0] == '#';
  const enforced = enforce || encode;
  //if (encode) account = accountsList.get(username);
  // If a username is specified, check that its active key has been added to the wallet
  if (enforced && username && account && !account.keys.active) {
    createPopup(() => {
      sendErrors(
        tab!,
        'user_cancel',
        chrome.i18n.getMessage('bgd_auth_canceled'),
        chrome.i18n.getMessage('bgd_auth_transfer_no_active', [username]),
        request as KeychainRequest,
      );
    });
  } else if (account && encode && !account.keys.memo) {
    createPopup(() => {
      sendErrors(
        tab!,
        'user_cancel',
        chrome.i18n.getMessage('bgd_auth_canceled'),
        chrome.i18n.getMessage('bgd_auth_transfer_no_memo', [username]),
        request as KeychainRequest,
      );
    });
  } else if (active_accounts.length == 0) {
    createPopup(() => {
      sendErrors(
        tab!,
        'user_cancel',
        chrome.i18n.getMessage('bgd_auth_canceled'),
        chrome.i18n.getMessage('bgd_auth_transfer_no_active', [username]),
        request as KeychainRequest,
      );
    });
  } else {
    const callback = () => {
      chrome.runtime.sendMessage({
        command: 'sendDialogConfirm',
        data: request,
        domain,
        accounts: active_accounts,
        tab,
        testnet: current_rpc.testnet,
      });
    };
    createPopup(callback);
  }
};
