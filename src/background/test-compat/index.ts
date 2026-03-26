import { KeychainRequest } from '@interfaces/keychain.interface';
import { performOperation } from './requests/operations';
import { RequestsHandler } from './requests/request-handler';

export const performOperationFromIndex = async (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  noConfirm = false,
) => {
  await performOperation(
    requestHandler,
    request,
    tab,
    request.domain,
    noConfirm,
  );
};

export const performKeylessOperation = async (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  const { KeylessKeychainModule } = require('@background/keyless-keychain.module');
  KeylessKeychainModule.handleOperation(requestHandler, request, domain, tab);
};
