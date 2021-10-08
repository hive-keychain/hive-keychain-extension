import { performTransaction } from '@background/requests/operations';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

export const requestWithoutConfirmation = (
  tab: number,
  request: KeychainRequest,
) => {
  chrome.runtime.sendMessage({
    command: DialogCommand.BROADCASTING_WITHOUT_CONFIRMATION,
  });
  performTransaction(request, tab!, true);
};
