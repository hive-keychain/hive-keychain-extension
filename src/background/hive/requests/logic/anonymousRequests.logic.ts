import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createOrUpdateDialog } from '@background/multichain/dialog-lifecycle';
import sendErrors from '@background/multichain/errors';
import { removeRequestAfterDialogFeedback } from '@background/multichain/remove-request-after-dialog-feedback.logic';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';
import { getRequiredWifType } from 'src/utils/requests.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
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
        await I18nUtils.getMessage('bgd_auth_canceled'),
        await I18nUtils.getMessage('bgd_auth_no_active'),
        request,
      );
      await removeRequestAfterDialogFeedback(
        requestHandler,
        request.request_id,
        tab,
      );
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
