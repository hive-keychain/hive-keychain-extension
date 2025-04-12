import { RequestsHandler } from '@background/requests/request-handler';
import KeylessKeychainUtils from '@background/utils/keylessKeychain.utils';
import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { KeylessRequest } from '@interfaces/keyless-keychain.interface';
import HASUtils from 'src/utils/has-utils';
export const keylessKeychainRequest = async (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {

  await HASUtils.connect();

  if (request.type === KeychainRequestTypes.signBuffer) {
    // handle login/registration
    const keylessAuthData = await KeylessKeychainUtils.registerUserAndDapp(request, domain);
    const keylessAuthDataUserDictionary = await KeylessKeychainUtils.getKeylessAuthDataUserDictionary();
    console.log(`initial keylessAuthDataUserDictionary:${JSON.stringify(keylessAuthDataUserDictionary,null,2)}`);
    if(keylessAuthData){
    const keylessRequest: KeylessRequest = {
      ...keylessAuthData,
      request: request,
    }
    //
    const auth_wait =   await HASUtils.authenticate(keylessRequest);
    await KeylessKeychainUtils.updateAuthenticatedKeylessAuthData(keylessRequest, auth_wait);
    const keylessAuthDataUserDictionary = await KeylessKeychainUtils.getKeylessAuthDataUserDictionary();
    console.log(`updated keylessAuthDataUserDictionary:${JSON.stringify(keylessAuthDataUserDictionary,null,2)}`);
    }
  }
};
