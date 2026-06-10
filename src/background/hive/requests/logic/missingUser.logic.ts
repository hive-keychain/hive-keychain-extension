import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createOrUpdateDialog } from '@background/multichain/dialog-lifecycle';
import sendErrors from '@background/multichain/errors';
import { removeRequestAfterDialogFeedback } from '@background/multichain/remove-request-after-dialog-feedback.logic';
import { KeychainRequest } from '@interfaces/keychain.interface';

import { I18nUtils } from 'src/utils/i18n.utils';
export const missingUser = (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
  username: string,
) => {
  /* istanbul ignore next */
  const callback = async () => {
    sendErrors(
      tab!,
      'user_cancel',
      await I18nUtils.getMessage('bgd_auth_canceled'),
      await I18nUtils.getMessage('bgd_auth_no_account', [username]),
      request,
    );
    await removeRequestAfterDialogFeedback(
      requestHandler,
      request.request_id,
      tab,
    );
  };
  createOrUpdateDialog(callback, requestHandler);
};
