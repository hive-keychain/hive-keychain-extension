import { RequestsHandler } from '@background/requests';
import * as BgIndex from 'src/background/index';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';

const request = keychainRequest.noValues.decode;
const tab = 0;
const requestHandler = new RequestsHandler();

const spies = {
  performOperation: jest
    .spyOn(BgIndex, 'performOperationFromIndex')
    .mockResolvedValue(undefined),
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
};

const constants = {
  request,
  tab,
  requestHandler,
};

export default {
  methods,
  constants,
  spies,
};
