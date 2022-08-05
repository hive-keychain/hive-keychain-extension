import { RequestsHandler } from '@background/requests';
import { addAccountRequest } from '@background/requests/logic';
import {
  KeychainKeyTypes,
  KeychainRequest,
  KeychainRequestData,
  KeychainRequestTypes,
  RequestDecode,
} from '@interfaces/keychain.interface';
import * as dialogLifeCycle from 'src/background/requests/dialog-lifecycle';
import config from 'src/__tests__/utils-for-testing/setups/config';

config.useChrome();
describe('addAccountRequest.logic tests:\n', () => {
  //   beforeEach(() => {
  //     global.chrome = chrome;
  //   });
  //SO:
  //    - the current executions of file as const exports may makes us configure the chrome, before any other file gets executed.
  //    -> find on google:
  //        -> configure chrome mock to run before any other file
  //            -> using: jest, webpack.
  it.skip('Must createPopup with sendError', () => {
    //spies & mocks
    const spies = {
      createPopup: () => jest.spyOn(dialogLifeCycle, 'createPopup'),
    };
    chrome.windows.onRemoved.addListener(() => {});
    ///////
    const requestHandler = new RequestsHandler();
    const requestDecode = {
      rpc: {},
      domain: '',
      key: '',
      type: KeychainRequestTypes.decode,
      username: '',
      message: '',
      method: KeychainKeyTypes.memo,
    } as RequestDecode;
    const keyChainRequestData: KeychainRequestData = {
      ...requestDecode,
      redirect_uri: '',
    };
    const keyChainRequest: KeychainRequest = {
      ...keyChainRequestData,
      request_id: 0,
    };
    addAccountRequest(requestHandler, 0, keyChainRequest, '');

    expect(spies.createPopup()).toBeCalledWith('');
  });
  it.todo('Must createPopup with sendMessage');
});
