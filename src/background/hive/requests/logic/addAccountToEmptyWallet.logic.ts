import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createOrUpdateDialog } from '@background/multichain/dialog-lifecycle';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { PendingRequestSource } from '@interfaces/pending-request.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
export const addAccountToEmptyWallet = (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
  source?: PendingRequestSource,
) => {
  /* istanbul ignore next */
  createOrUpdateDialog(async () => {
    CommunicationUtils.runtimeSendMessage({
      command: DialogCommand.REGISTER,
      msg: {
        success: false,
        error: 'register',
        result: null,
        data: request,
        message: await I18nUtils.getMessage('popup_html_register'),
        display_msg: await I18nUtils.getMessage('popup_html_register'),
      },
      tab,
      domain,
      ...(source ? { requestSource: source } : {}),
    });
  }, requestHandler);
};
