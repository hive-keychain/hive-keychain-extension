import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createOrUpdateDialog } from '@background/multichain/dialog-lifecycle';
import sendErrors from '@background/multichain/errors';
import {
  KeychainRequest,
  RequestTransfer,
} from '@interfaces/keychain.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';

export const transferRequest = (
  requestHandler: HiveRequestsHandler,
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
    createOrUpdateDialog(async () => {
      sendErrors(
        tab!,
        'user_cancel',
        await chrome.i18n.getMessage('bgd_auth_canceled'),
        await chrome.i18n.getMessage('bgd_auth_transfer_no_active', [username]),
        request as KeychainRequest,
      );
    }, requestHandler);
  } else if (account && encode && !account.keys.memo) {
    /* istanbul ignore next */
    createOrUpdateDialog(async () => {
      sendErrors(
        tab!,
        'user_cancel',
        await chrome.i18n.getMessage('bgd_auth_canceled'),
        await chrome.i18n.getMessage('bgd_auth_transfer_no_memo', [username!]),
        request as KeychainRequest,
      );
    }, requestHandler);
  } else if (active_accounts.length == 0) {
    /* istanbul ignore next */
    createOrUpdateDialog(async () => {
      sendErrors(
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
    // if (requestHandler.windowId) {
    //   CommunicationUtils.runtimeSendMessage({
    //     command: DialogCommand.SEND_DIALOG_CONFIRM,
    //     request,
    //     domain,
    //     accounts: encode || enforce ? undefined : active_accounts,
    //     tab,
    //     rpc: current_rpc,
    //   });
    // } else {
    /* istanbul ignore next */
    const callback = () => {
      CommunicationUtils.runtimeSendMessage({
        command: DialogCommand.SEND_DIALOG_CONFIRM,
        request,
        domain,
        accounts: encode || enforce ? undefined : active_accounts,
        tab,
        rpc: current_rpc,
      });
    };
    createOrUpdateDialog(callback, requestHandler);
    // }
  }
};
