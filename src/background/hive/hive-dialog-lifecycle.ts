import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

/* istanbul ignore next */
chrome.windows.onRemoved.addListener(async (id: number) => {
  const requestHandler = await HiveRequestsHandler.getFromLocalStorage();
  const { windowId, request, request_id, tab, confirmed, isMultisig } =
    requestHandler.data;
  if (id == windowId && !confirmed && tab) {
    chrome.tabs.sendMessage(tab!, {
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: false,
        error: isMultisig ? 'pending_multisig' : 'user_cancel',
        result: null,
        data: request,
        message: await chrome.i18n.getMessage(
          `bgd_lifecycle_request_${
            isMultisig ? 'pending_multisig' : 'canceled'
          }`,
        ),
        request_id,
      },
    });

    requestHandler.reset(true);
  }
});
