import { performOperationFromIndex } from '@background/index';
import { KeychainRequest } from '@interfaces/keychain.interface';

export const requestWithoutConfirmation = async (
  tab: number,
  request: KeychainRequest,
) => {
  performOperationFromIndex(tab, request);
};
