import { performOperationFromIndex } from '@background/index';
import indexMocks from 'src/__tests__/background/mocks/index-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('index tests:\n', () => {
  const { constants, spies, methods } = indexMocks;
  const { requestHandler, requestData } = constants;
  methods.afterEach;
  describe('performOperationFromIndex cases:\n', () => {
    it('Must call performOperation', async () => {
      requestHandler.data.key = userData.one.nonEncryptKeys.posting;
      await performOperationFromIndex(requestHandler, 0, requestData);
      expect(spies.performOperation).toBeCalledTimes(1);
    });
  });
});
