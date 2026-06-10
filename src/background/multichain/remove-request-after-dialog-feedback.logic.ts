import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import {
  getRequestHandlers,
  willCloseDialogWindowAfterRemovingRequest,
} from '@background/multichain/dialog-request.utils';
import {
  DIALOG_FEEDBACK_DISPLAY_MS,
  delayMs,
} from '@reference-data/dialog-feedback.constants';

export const removeRequestAfterDialogFeedback = async (
  requestHandler: HiveRequestsHandler,
  requestId: number,
  tab: number,
) => {
  const handlers = await getRequestHandlers();
  if (
    await willCloseDialogWindowAfterRemovingRequest(
      handlers,
      requestId,
      tab,
    )
  ) {
    await delayMs(DIALOG_FEEDBACK_DISPLAY_MS);
  }
  await requestHandler.removeRequestById(requestId, tab);
};
