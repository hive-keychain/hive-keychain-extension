import { KeylessKeychainModule } from '@background/keyless-keychain.module';
import { createPopup } from '@background/requests/dialog-lifecycle';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
export const keylessKeychainRequest = async (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  const keylessAuthData = await KeylessKeychainModule.checkKeylessRegistration(
    request,
    domain,
    tab,
  );
  // when it is not yet registered or it is a signBuffer request
  if (!keylessAuthData || request.type === KeychainRequestTypes.signBuffer) {
    console.log('keyless: reauthentication or new registration');
    const callback = async () => {
      chrome.runtime.sendMessage({
        command: DialogCommand.REGISTER_KEYLESS_KEYCHAIN,
        data: request,
        domain,
        tab,
      });
    };
    createPopup(callback, requestHandler);
  } else {
    console.log('keyless: registered, proceed to sign');
    chrome.runtime.sendMessage({
      command: BackgroundCommand.KEYLESS_KEYCHAIN,
      data: request,
      domain,
      tab,
    });
  }
};
