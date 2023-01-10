import { SignedTransaction } from '@hiveio/dhive';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { SignFromLedgerRequestMessage } from 'src/dialog/pages/sign-transaction';
import { KeychainError } from 'src/keychain-error';

const signTransactionFromLedger = (data: SignFromLedgerRequestMessage) => {
  chrome.runtime.sendMessage({
    command: DialogCommand.SIGN_WITH_LEDGER,
    ...data,
  });
};

const getSignatureFromLedger = () => {
  return new Promise<string>((resolve, reject) => {
    const getResponse = (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResp: (response?: any) => void,
    ) => {
      if (message.command === DialogCommand.RETURN_SIGNED_TRANSACTION) {
        chrome.runtime.onMessage.removeListener(getResponse);
        resolve((message.signedTransaction as SignedTransaction).signatures[0]);
      } else if (
        message.command === DialogCommand.RETURN_ERROR_SIGNING_TRANSACTION
      ) {
        chrome.runtime.onMessage.removeListener(getResponse);
        reject(new KeychainError(message.message));
      }
    };
    chrome.runtime.onMessage.addListener(getResponse);
  });
};

const LedgerModule = {
  signTransactionFromLedger,
  getSignatureFromLedger,
};

export default LedgerModule;
