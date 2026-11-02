import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import {
  getRequestHandlers,
  willCloseDialogWindowAfterRemovingRequest,
} from '@background/multichain/dialog-request.utils';
import {
  DIALOG_FEEDBACK_DISPLAY_MS,
  delayMs,
} from '@reference-data/dialog-feedback.constants';
import { PendingRequestSource } from '@interfaces/pending-request.interface';

export const removeRequestAfterDialogFeedback = async (
  requestHandler: HiveRequestsHandler,
  requestId: number,
  tab: number,
  source?: PendingRequestSource,
) => {
  const handlers = await getRequestHandlers();
  if (
    await willCloseDialogWindowAfterRemovingRequest(
      handlers,
      requestId,
      tab,
      source?.origin,
    )
  ) {
    await delayMs(DIALOG_FEEDBACK_DISPLAY_MS);
  }
  if (source) {
    await requestHandler.removeRequestByLocator({
      requestId,
      ...source,
    });
    return;
  }
  await requestHandler.removeRequestById(requestId, tab);
};
