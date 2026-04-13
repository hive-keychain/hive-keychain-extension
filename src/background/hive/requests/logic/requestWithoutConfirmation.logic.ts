import { performOperationFromIndex } from '@background/hive/hive-service-worker';
import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { KeychainRequest } from '@interfaces/keychain.interface';

export const requestWithoutConfirmation = async (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
) => {
  await performOperationFromIndex(requestHandler, tab, request);
  // if ((await RequestHandlerUtils.countPendingRequest()) === 1) {
  //   requestHandler.closeWindow();
  // }
};
