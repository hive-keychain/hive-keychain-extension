import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createOrUpdateDialog } from '@background/multichain/dialog-lifecycle';
import sendErrors from '@background/multichain/errors';
import { removeRequestAfterDialogFeedback } from '@background/multichain/remove-request-after-dialog-feedback.logic';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { PendingRequestSource } from '@interfaces/pending-request.interface';

import { I18nUtils } from 'src/utils/i18n.utils';
export const missingKey = (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
  username: string,
  typeWif: string,
  source?: PendingRequestSource,
) => {
  /* istanbul ignore next */
  createOrUpdateDialog(async () => {
    sendErrors(
      tab!,
      'user_cancel',
      await I18nUtils.getMessage('bgd_auth_canceled'),
      await I18nUtils.getMessage('bgd_auth_no_key', [username, typeWif]),
      request,
      source,
    );
    await removeRequestAfterDialogFeedback(
      requestHandler,
      request.request_id,
      tab,
      source,
    );
  }, requestHandler);
};
