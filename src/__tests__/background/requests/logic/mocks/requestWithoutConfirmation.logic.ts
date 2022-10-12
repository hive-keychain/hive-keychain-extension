import { RequestsHandler } from '@background/requests';
import * as BgOperationsIndex from '@background/requests/operations/index';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import manipulateStrings from 'src/__tests__/utils-for-testing/helpers/manipulate-strings';

const request = keychainRequest.noValues.decode;
const tab = 0;
const requestHandler = new RequestsHandler();

const spies = {
  performOperation: jest
    .spyOn(BgOperationsIndex, 'performOperation')
    .mockResolvedValue(undefined),
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
  clean: (str: string) => manipulateStrings.removeTabs(str),
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
