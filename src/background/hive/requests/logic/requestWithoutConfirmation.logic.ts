import { performOperationFromIndex } from '@background/hive/hive-service-worker';
import { RequestsHandler } from '@background/hive/requests/request-handler';
import { KeychainRequest } from '@interfaces/keychain.interface';

export const requestWithoutConfirmation = async (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
) => {
  performOperationFromIndex(requestHandler, tab, request);
};
