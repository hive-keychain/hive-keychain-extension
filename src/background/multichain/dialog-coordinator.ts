import {
  createOrUpdateDialog,
  getDialogWindowId,
  removeWindow,
} from '@background/multichain/dialog-lifecycle';
import {
  ConfirmDialogMessage,
  getCurrentDialogItem,
  getRequestHandlers,
  isEquivalentDialogDispatch,
  isQueueGrowthOnlyDispatch,
  RequestHandlers,
} from '@background/multichain/dialog-request.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

let lastDispatchedDialogMessage: ConfirmDialogMessage | null = null;

export const getNextDialogRequestOrder = async () => {
  const currentOrder =
    (await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.DIALOG_REQUEST_ORDER,
    )) ?? 0;
  const nextOrder = currentOrder + 1;

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.DIALOG_REQUEST_ORDER,
    nextOrder,
  );

  return nextOrder;
};

export const syncSharedDialogWindow = async (
  overrides?: Partial<RequestHandlers>,
) => {
  const handlers = overrides
    ? {
        ...(await getRequestHandlers()),
        ...overrides,
      }
    : undefined;

  const { message, height, visibleRequests } = await getCurrentDialogItem(
    handlers,
  );
  if (!visibleRequests.length) {
    lastDispatchedDialogMessage = null;
    const windowId = await getDialogWindowId();
    if (windowId) {
      removeWindow(windowId);
    }
    return;
  }

  if (!message) return;

  const windowId = await getDialogWindowId();
  const confirmMessage = message as ConfirmDialogMessage;

  if (
    windowId &&
    isEquivalentDialogDispatch(lastDispatchedDialogMessage, confirmMessage)
  ) {
    return;
  }

  const queueGrowthOnly = isQueueGrowthOnlyDispatch(
    lastDispatchedDialogMessage,
    confirmMessage,
  );

  await createOrUpdateDialog(
    () => {
      CommunicationUtils.runtimeSendMessage(message);
      lastDispatchedDialogMessage = confirmMessage;
    },
    undefined,
    'dialog.html',
    height,
    { focus: !queueGrowthOnly },
  );
};
