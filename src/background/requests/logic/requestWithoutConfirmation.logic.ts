import { performTransaction } from '@background/requests/operations';
import { KeychainRequest } from '@interfaces/keychain.interface';

export const requestWithoutConfirmation = (
  tab: number,
  request: KeychainRequest,
) => {
  chrome.runtime.sendMessage({
    command: 'broadcastingNoConfirm',
  });
  performTransaction(request, tab!, true);
};
