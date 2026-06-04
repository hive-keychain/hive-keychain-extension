import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createOrUpdateDialog } from '@background/multichain/dialog-lifecycle';
import sendErrors from '@background/multichain/errors';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
export const addAccountRequest = (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
  account?: LocalAccount,
) => {
  if (account) {
    /* istanbul ignore next */
    createOrUpdateDialog(async () => {
      sendErrors(
        tab!,
        'user_cancel',
        await I18nUtils.getMessage('bgd_auth_canceled'),
        await I18nUtils.getMessage('popup_accounts_already_registered', [
          account.name,
        ]),
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
        tab,
      });
    };
    createOrUpdateDialog(callback, requestHandler);
  }
};
