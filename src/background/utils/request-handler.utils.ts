import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';

const countPendingRequest = async () => {
  const hiveRequestHandler = await HiveRequestsHandler.getFromLocalStorage();
  const evmRequestHandler = await EvmRequestHandler.getFromLocalStorage();

  return (
    (hiveRequestHandler?.requestsData?.length ?? 0) +
    (evmRequestHandler?.requestsData?.length ?? 0)
  );
};

export const RequestHandlerUtils = {
  countPendingRequest,
};
