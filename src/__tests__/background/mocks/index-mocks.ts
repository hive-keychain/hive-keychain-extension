import { RequestsHandler } from '@background/requests/request-handler';
import * as OperationIndex from 'src/background/requests/operations/index';
import postMocks from 'src/__tests__/background/requests/operations/ops/mocks/post-mocks';

const requestHandler = new RequestsHandler();

const spies = {
  performOperation: jest
    .spyOn(OperationIndex, 'performOperation')
    .mockResolvedValue(undefined),
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
};

const constants = {
  requestHandler,
  requestData: postMocks.constants.data,
};

export default {
  methods,
  constants,
  spies,
};
