import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import * as ResponseLogicModule from 'src/content-scripts/web-interface/response.logic';
import userData from 'src/__tests__/utils-for-testing/data/user-data';

const prevReq = {
  domain: 'domain',
  request_id: 1,
  type: KeychainRequestTypes.convert,
  username: userData.one.username,
  collaterized: true,
  amount: '1.000',
} as KeychainRequest;

const req = {} as KeychainRequest;

const spies = {
  sendResponse: jest
    .spyOn(ResponseLogicModule, 'sendResponse')
    .mockImplementation(() => {}),
  sendMessage: jest
    .spyOn(chrome.runtime, 'sendMessage')
    .mockImplementation(() => {}),
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
};

export default {
  prevReq,
  spies,
  req,
  methods,
};
