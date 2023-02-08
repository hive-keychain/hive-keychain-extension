import { broadcastPost } from '@background/requests/operations/ops/post';
import postMocks from 'src/__tests__/background/requests/operations/ops/mocks/post-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { ResultOperation } from 'src/__tests__/utils-for-testing/interfaces/assertions';
describe('post tests:\n', () => {
  const { methods, constants } = postMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('Empty comment_options:\n', () => {
    it('Must return error if no key on handler', async () => {
      const resultOperation = (await broadcastPost(
        requestHandler,
        data,
      )) as ResultOperation;
      const { success, result, error } = resultOperation.msg;
      expect(success).toBe(false);
      expect(result).toBeUndefined();
      expect((error as TypeError).message).toContain('private key');
    });
    it('Must return success', async () => {
      requestHandler.data.key = userData.one.nonEncryptKeys.posting;
      const result = await broadcastPost(requestHandler, data);
      methods.assertMsgSucess(result, data, 'bgd_ops_post');
    });
  });
  describe('With comment_options:\n', () => {
    it('Must return error if bad json', async () => {
      data.comment_options = '!{!}';
      const resultOperation = (await broadcastPost(
        requestHandler,
        data,
      )) as ResultOperation;
      const { success, result, error } = resultOperation.msg;
      expect(success).toBe(false);
      expect(result).toBeUndefined();
      expect((error as TypeError).message).toContain('JSON');
    });
    it('Must return error if no key on handler', async () => {
      const errorMsg = 'private key should be a Buffer';
      delete requestHandler.data.key;
      data.comment_options = '{"keychain":10000,"points":6}';
      const resultOperation = (await broadcastPost(
        requestHandler,
        data,
      )) as ResultOperation;
      const { success, result, error } = resultOperation.msg;
      expect(success).toBe(false);
      expect(result).toBeUndefined();
      expect((error as TypeError).message).toContain('private key');
    });
    it('Must return success', async () => {
      requestHandler.data.key = userData.one.nonEncryptKeys.posting;
      data.comment_options = '{"keychain":10000,"points":6}';
      const result = await broadcastPost(requestHandler, data);
      methods.assertMsgSucess(result, data, 'bgd_ops_post');
    });
  });
});
