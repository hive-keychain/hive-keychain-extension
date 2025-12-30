import { EvmUnrestrictedMethods } from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { isWhitelisted } from 'src/utils/preferences.utils';

const countPendingRestrictedRequest = async () => {
  const [hiveRequestHandler, evmRequestHandler] = await getRequestHandlers();

  const restrictedHiveRequests = hiveRequestHandler?.requestsData?.filter(
    (requestData) =>
      !isWhitelisted(
        requestData.preferences!,
        requestData.request!,
        requestData.domain!,
        requestData.rpc!,
      ),
  );
  const restrictedEvmRequests = evmRequestHandler?.requestsData?.filter(
    (requestData) =>
      !EvmUnrestrictedMethods.includes(requestData.request!.method),
  );

  return (
    (restrictedHiveRequests?.length ?? 0) + (restrictedEvmRequests?.length ?? 0)
  );
};

const getRequestHandlers = async () => {
  return Promise.all([
    HiveRequestsHandler.getFromLocalStorage(),
    EvmRequestHandler.getFromLocalStorage(),
  ]);
};

const getWindowId = async () => {
  const [hiveRequestHandler, evmRequestHandler] = await getRequestHandlers();
  return hiveRequestHandler?.windowId ?? evmRequestHandler?.windowId;
};

const removeWindowId = async () => {
  await LocalStorageUtils.removeFromLocalStorage(
    LocalStorageKeyEnum.DIALOG_WINDOW_ID,
  );
};

export const RequestHandlerUtils = {
  countPendingRestrictedRequest,
  getWindowId,
  removeWindowId,
};
