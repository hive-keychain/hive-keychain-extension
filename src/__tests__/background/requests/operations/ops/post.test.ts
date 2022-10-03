import { broadcastPost } from '@background/requests/operations/ops/post';
import postMocks from 'src/__tests__/background/requests/operations/ops/mocks/post-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('post tests:\n', () => {
  const { methods, constants } = postMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('Empty comment_options:\n', () => {
    it('Must return error if no key on handler', async () => {
      const result = await broadcastPost(requestHandler, data);
      methods.assertMsgError(
        result,
        new TypeError('private key should be a Buffer'),
        data,
        `${chrome.i18n.getMessage(
          'bgd_ops_error',
        )} : private key should be a Buffer`,
      );
    });
    it('Must return success', async () => {
      requestHandler.data.key = userData.one.nonEncryptKeys.posting;
      const result = await broadcastPost(requestHandler, data);
      methods.assertMsgSucess(result, data, 'bgd_ops_post');
    });
  });
  describe('With comment_options:\n', () => {
    it('Must return error if bad json', async () => {
      const errorMsg = 'Unexpected token ! in JSON at position 0';
      data.comment_options = '!{!}';
      const result = await broadcastPost(requestHandler, data);
      methods.assertMsgError(
        result,
        new SyntaxError(errorMsg),
        data,
        `${chrome.i18n.getMessage('bgd_ops_error')} : ${errorMsg}`,
      );
    });
    it('Must return error if no key on handler', async () => {
      const errorMsg = 'private key should be a Buffer';
      delete requestHandler.data.key;
      data.comment_options = '{"keychain":10000,"points":6}';
      const result = await broadcastPost(requestHandler, data);
      methods.assertMsgError(
        result,
        new TypeError(errorMsg),
        data,
        `${chrome.i18n.getMessage('bgd_ops_error')} : ${errorMsg}`,
      );
    });
    it('Must return success', async () => {
      requestHandler.data.key = userData.one.nonEncryptKeys.posting;
      data.comment_options = '{"keychain":10000,"points":6}';
      const result = await broadcastPost(requestHandler, data);
      methods.assertMsgSucess(result, data, 'bgd_ops_post');
    });
  });
});
