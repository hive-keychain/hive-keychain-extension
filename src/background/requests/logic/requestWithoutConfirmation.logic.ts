import { performOperationFromIndex } from '@background/index';
import { RequestsHandler } from '@background/requests/request-handler';
import { KeychainRequest } from '@interfaces/keychain.interface';

export const requestWithoutConfirmation = async (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  performOperationFromIndex(requestHandler, tab, request, domain);
};
