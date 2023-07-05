import { performOperationFromIndex } from '@background/index';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  KeychainRequestTypes,
  RequestId,
  RequestPost,
} from 'hive-keychain-commons';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import * as OperationIndex from 'src/background/requests/operations/index';

describe('index tests:\n', () => {
  const requestHandler = new RequestsHandler();
  const data = {
    domain: 'domain',
    username: mk.user.one,
    type: KeychainRequestTypes.post,
    title: 'title',
    body: 'body_stringyfied',
    parent_perm: 'https://hive.com/perm-link/',
    parent_username: 'theghost1980',
    json_metadata: 'metadata_stringyfied',
    permlink: 'https://hive.com/perm-link-1/',
    comment_options: '',
    request_id: 1,
  } as RequestPost & RequestId;

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  describe('performOperationFromIndex cases:\n', () => {
    it('Must call performOperation', async () => {
      const sPerformOperation = jest
        .spyOn(OperationIndex, 'performOperation')
        .mockResolvedValue(undefined);

      requestHandler.data.key = userData.one.nonEncryptKeys.posting;
      await performOperationFromIndex(requestHandler, 0, data);
      expect(sPerformOperation).toBeCalledTimes(1);
    });
  });
});
