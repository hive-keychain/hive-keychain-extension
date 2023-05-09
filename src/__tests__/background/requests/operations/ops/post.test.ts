import { broadcastPost } from '@background/requests/operations/ops/post';
import postMocks from 'src/__tests__/background/requests/operations/ops/mocks/post-mocks';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { ResultOperation } from 'src/__tests__/utils-for-testing/interfaces/assertions';
//TODO check & fix tests bellow!
describe('post tests:\n', () => {
  const { methods, constants } = postMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;

  it('Must return error if no key on handler', async () => {
    delete requestHandler.data.key;
    const result = await broadcastPost(requestHandler, data);
    methods.assertMsgError(
      result,
      new Error('html_popup_error_while_signing_transaction'),
      data,
      mocksImplementation.i18nGetMessageCustom(
        'html_popup_error_while_signing_transaction',
      ),
    );
  });

  it('Must return error if no key', async () => {
    delete requestHandler.data.key;
    data.comment_options = '{"keychain":10000,"points":6}';
    const result = await broadcastPost(requestHandler, data);
    methods.assertMsgError(
      result,
      new Error('html_popup_error_while_signing_transaction'),
      data,
      mocksImplementation.i18nGetMessageCustom(
        'html_popup_error_while_signing_transaction',
      ),
    );
  });

  // describe('Empty comment_options:\n', () => {
  //   it('Must return success', async () => {
  //     requestHandler.data.key = userData.one.nonEncryptKeys.posting;
  //     const mHiveTxSendOp = jest
  //       .spyOn(HiveTxUtils, 'sendOperation')
  //       .mockResolvedValueOnce(transactionConfirmationSuccess);
  //     const result = await broadcastPost(requestHandler, data);
  //     methods.assertMsgSucess(result, data, 'bgd_ops_post');
  //     mHiveTxSendOp.mockClear();
  //     mHiveTxSendOp.mockReset();
  //   });
  // });

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
    // it('Must return success', async () => {
    //   requestHandler.data.key = userData.one.nonEncryptKeys.posting;
    //   data.comment_options = '{"keychain":10000,"points":6}';
    //   const mHiveTxSendOp = jest
    //     .spyOn(HiveTxUtils, 'sendOperation')
    //     .mockResolvedValueOnce(transactionConfirmationSuccess);
    //   const result = await broadcastPost(requestHandler, data);
    //   methods.assertMsgSucess(result, data, 'bgd_ops_post');
    //   mHiveTxSendOp.mockClear();
    //   mHiveTxSendOp.mockReset();
    // });
  });
});
