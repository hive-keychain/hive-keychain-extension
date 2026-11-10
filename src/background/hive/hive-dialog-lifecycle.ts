import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { isHiveDialogVisibleRequest } from '@background/multichain/dialog-request.utils';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { getPendingRequestMessageOptions } from '@background/multichain/pending-request.interface';
import { CommunicationUtils } from 'src/utils/communication.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
/* istanbul ignore next */
export const onRemoveHive = async (id: number) => {
  const requestHandler = await HiveRequestsHandler.getFromLocalStorage();

  if (!requestHandler || id !== requestHandler.windowId) {
    return;
  }

  for (const requestData of [...requestHandler.requestsData]) {
    if (
      !requestData.confirmed &&
      requestData.tab &&
      requestData.request &&
      (!requestData.source ||
        (await isHiveDialogVisibleRequest(requestData)))
    ) {
      const HiveAuthUtils = (await import('src/utils/hive-auth.utils'))
        .default;
      HiveAuthUtils.cancelPreCorrelationRequest(requestHandler);
      if (
        requestData.request?.type?.includes('vsc') &&
        requestData.isWaitingForConfirmation
      ) {
        return;
      }
      await CommunicationUtils.tabsSendMessage(
        requestData.tab,
        {
          command: DialogCommand.ANSWER_REQUEST,
          msg: {
            success: false,
            error: requestData.isMultisig ? 'pending_multisig' : 'user_cancel',
            result: null,
            data: requestData.request,
            message: await I18nUtils.getMessage(
              `bgd_lifecycle_request_${
                requestData.isMultisig ? 'pending_multisig' : 'canceled'
              }`,
            ),
            request_id: requestData.request_id,
            tab: requestData.tab,
          },
        },
        getPendingRequestMessageOptions(requestData.source),
      );
      const locator = requestHandler.getRequestLocator(requestData);
      if (locator) {
        await requestHandler.removeRequestByLocator(locator, false);
      } else {
        await requestHandler.removeRequestById(
          requestData.request.request_id,
          requestData.tab,
          false,
        );
      }
    }
  }
};
