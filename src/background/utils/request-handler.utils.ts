import {
  getRequestHandlers,
  getVisibleDialogRequests,
} from '@background/multichain/dialog-request.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const countPendingRestrictedRequest = async (
  requestId: number,
  tab: number,
) => {
  const visibleRequests = await getVisibleDialogRequests();

  return visibleRequests.filter(
    (request) => request.requestId !== requestId || request.tab !== tab,
  ).length;
};

const getWindowId = async () => {
  return LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.DIALOG_WINDOW_ID,
  );
};

const removeWindowId = async () => {
  await LocalStorageUtils.removeFromLocalStorage(
    LocalStorageKeyEnum.DIALOG_WINDOW_ID,
  );
};

export const RequestHandlerUtils = {
  countPendingRestrictedRequest,
  getRequestHandlers,
  getWindowId,
  removeWindowId,
};
