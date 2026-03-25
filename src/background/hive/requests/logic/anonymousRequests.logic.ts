import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createOrUpdateDialog } from '@background/multichain/dialog-lifecycle';
import sendErrors from '@background/multichain/errors';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';
import { getRequiredWifType } from 'src/utils/requests.utils';

export const anonymousRequests = (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
  accounts: LocalAccount[],
  current_rpc: Rpc,
) => {
  const filterKey = getRequiredWifType(request);
  const account_candidates = accounts
    .filter((e) => !!e.keys[filterKey])
    .map((e) => e.name);
  if (!account_candidates.length) {
    createOrUpdateDialog(async () => {
      sendErrors(
        tab!,
        'user_cancel',
        await chrome.i18n.getMessage('bgd_auth_canceled'),
        await chrome.i18n.getMessage('bgd_auth_no_active'),
        request,
      );
      await requestHandler.removeRequestById(request.request_id, tab);
    }, requestHandler);
  } else {
    const callback = () => {
      CommunicationUtils.runtimeSendMessage({
        command: DialogCommand.SEND_DIALOG_CONFIRM,
        request,
        domain,
        accounts: account_candidates,
        tab,
        rpc: current_rpc,
      });
    };
    createOrUpdateDialog(callback, requestHandler);
  }
};
