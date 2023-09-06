import { performOperationFromIndex } from '@background/index';
import * as BgOperationsIndex from '@background/requests/operations/index';
import { RequestsHandler } from '@background/requests/request-handler';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';

describe('requestWithoutConfirmation.logic tests:\n', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Must call performOperation', async () => {
    const requestHandler = new RequestsHandler();
    const sPerformOperation = jest
      .spyOn(BgOperationsIndex, 'performOperation')
      .mockResolvedValue(undefined);
    await performOperationFromIndex(
      requestHandler,
      0,
      keychainRequest.noValues.decode,
    );
    expect(sPerformOperation).toBeCalledWith(
      requestHandler,
      keychainRequest.noValues.decode,
      0,
      keychainRequest.noValues.decode.domain,
      false,
    );
  });
});
