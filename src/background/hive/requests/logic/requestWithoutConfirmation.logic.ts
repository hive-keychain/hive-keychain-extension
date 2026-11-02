import { performOperationFromIndex } from '@background/hive/hive-service-worker';
import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { PendingRequestSource } from '@interfaces/pending-request.interface';

export const requestWithoutConfirmation = async (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
  source?: PendingRequestSource,
) => {
  await performOperationFromIndex(requestHandler, tab, request, domain, source);
  // if ((await RequestHandlerUtils.countPendingRequest()) === 1) {
  //   requestHandler.closeWindow();
  // }
};
