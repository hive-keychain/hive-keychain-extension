import {
  createOrUpdateDialog,
  getDialogWindowId,
  removeWindow,
} from '@background/multichain/dialog-lifecycle';
import {
  getCurrentDialogItem,
  getRequestHandlers,
  RequestHandlers,
} from '@background/multichain/dialog-request.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

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
    const windowId = await getDialogWindowId();
    if (windowId) {
      removeWindow(windowId);
    }
    return;
  }

  if (!message) return;

  await createOrUpdateDialog(
    () => CommunicationUtils.runtimeSendMessage(message),
    undefined,
    'dialog.html',
    height,
  );
};
