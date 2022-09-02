import * as BgIndex from 'src/background/index';
import backgroundMessages from 'src/__tests__/background/mocks/data/backgroundMessages';
import indexMocks from 'src/__tests__/background/mocks/index-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('index tests:\n', () => {
  const { constants, spies, methods } = indexMocks;
  const { requestHandler, requestData } = constants;
  const { messages } = backgroundMessages;
  methods.afterEach;
  describe('performOperationFromIndex cases:\n', () => {
    it('Must call performOperation', async () => {
      requestHandler.data.key = userData.one.nonEncryptKeys.posting;
      await BgIndex.performOperationFromIndex(requestHandler, 0, requestData);
      expect(spies.performOperation).toBeCalledWith(
        requestHandler,
        requestData,
        0,
        requestData.domain,
        false,
      );
    });
    it('Must call each case', async () => {
      for (let i = 0; i < messages.length; i++) {
        const element = messages[i];
        if (element.mocking) {
          element.mocking();
        }
        await BgIndex.chromeMessageHandler(
          element.backgroundMessage,
          chrome.runtime,
          () => {},
        );
        element.assertions();
        jest.clearAllMocks();
      }
    });
  });
});
