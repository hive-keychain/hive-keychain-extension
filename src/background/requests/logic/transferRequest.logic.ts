import { createPopup } from '@background/requests/dialog-lifecycle';
import sendErrors from '@background/requests/errors';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  KeychainRequest,
  RequestTransfer,
} from '@interfaces/keychain.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

export const transferRequest = (
  requestHandler: RequestsHandler,
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
    /* istanbul ignore next */
    createPopup(async () => {
      sendErrors(
        requestHandler,
        tab!,
        'user_cancel',
        await chrome.i18n.getMessage('bgd_auth_canceled'),
        await chrome.i18n.getMessage('bgd_auth_transfer_no_active', [username]),
        request as KeychainRequest,
      );
    }, requestHandler);
  } else if (account && encode && !account.keys.memo) {
    /* istanbul ignore next */
    createPopup(async () => {
      sendErrors(
        requestHandler,
        tab!,
        'user_cancel',
        await chrome.i18n.getMessage('bgd_auth_canceled'),
        await chrome.i18n.getMessage('bgd_auth_transfer_no_memo', [username!]),
        request as KeychainRequest,
      );
    }, requestHandler);
  } else if (active_accounts.length == 0) {
    /* istanbul ignore next */
    createPopup(async () => {
      sendErrors(
        requestHandler,
        tab!,
        'user_cancel',
        await chrome.i18n.getMessage('bgd_auth_canceled'),
        await chrome.i18n.getMessage('bgd_auth_transfer_no_active', [
          username!,
        ]),
        request as KeychainRequest,
      );
    }, requestHandler);
  } else {
    /* istanbul ignore next */
    const callback = () => {
      chrome.runtime.sendMessage({
        command: DialogCommand.SEND_DIALOG_CONFIRM,
        data: request,
        domain,
        accounts: encode || enforce ? undefined : active_accounts,
        tab,
        rpc: current_rpc,
      });
    };
    createPopup(callback, requestHandler);
  }
};
