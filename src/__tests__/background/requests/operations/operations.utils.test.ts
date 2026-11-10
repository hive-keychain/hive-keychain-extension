import {
  beautifyErrorMessage,
  createMessage,
  feedbackI18n,
  feedbackPlain,
} from '@background/hive/requests/operations/operations.utils';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import {
  KeychainRequestTypes,
  RequestId,
  RequestSendToken,
} from 'hive-keychain-commons';
import mk from 'src/__tests__/utils-for-testing/data/mk';

import { I18nUtils } from 'src/utils/i18n.utils';
describe('operations.utils tests:\n', () => {
  const datas = {
    domain: 'domain',
    type: KeychainRequestTypes.sendToken,
    username: mk.user.one,
    to: mk.user.two,
    amount: '1000',
    memo: 'The Quan',
    currency: 'LEO',
  } as RequestSendToken & RequestId;

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  describe('createMessage cases:\n', () => {
    it('Must return an answerRequest with success', async () => {
      const result = await createMessage(
        undefined,
        {
          tx_id: 'tx_id',
          id: 'id',
          confirmed: true,
        } as TransactionResult,
        datas,
        undefined,
        feedbackI18n('bgd_ops_transfer_success', [
          datas.amount,
          datas.currency,
          datas.username!,
          datas.to,
        ]),
        null,
        undefined,
      );
      const { request_id, ...data } = datas;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: true,
          result: {
            tx_id: 'tx_id',
            id: 'id',
            confirmed: true,
          } as TransactionResult,
          data: data,
          message: I18nUtils.getMessage('bgd_ops_transfer_success', [
            datas.amount,
            datas.currency,
            datas.username!,
            datas.to,
          ]),
          messageKey: 'bgd_ops_transfer_success',
          messageParams: [
            datas.amount,
            datas.currency,
            datas.username!,
            datas.to,
          ],
          error: undefined,
          publicKey: undefined,
          request_id,
          tab: undefined,
        },
      });
    });

    it('Must return an answerRequest with error', async () => {
      const errorMsg = 'Error while waiting confirmation';
      const result = await createMessage(
        `${I18nUtils.getMessage('bgd_ops_error')} : ${errorMsg}`,
        undefined,
        datas,
        null,
        undefined,
        feedbackPlain(`${I18nUtils.getMessage('bgd_ops_error')} : ${errorMsg}`),
        undefined,
      );
      const { request_id, ...data } = datas;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          error: `${I18nUtils.getMessage('bgd_ops_error')} : ${errorMsg}`,
          success: false,
          result: undefined,
          data: data,
          message: `${I18nUtils.getMessage('bgd_ops_error')} : ${errorMsg}`,
          request_id,
          publicKey: undefined,
          tab: null,
        },
      });
    });

    it('uses multisig pending message when tx is routed to signers', async () => {
      const multisigMsg = I18nUtils.getMessage(
        'multisig_transaction_sent_to_signers',
      );
      const result = await createMessage(
        null,
        { isUsingMultisig: true, tx_id: '' },
        datas,
        'would-be-success',
        feedbackI18n('ignored-success'),
        feedbackI18n('ignored-fail'),
      );
      expect(result.msg.success).toBe(true);
      expect(result.msg.message).toBe(multisigMsg);
      expect(result.msg.messageKey).toBe('multisig_transaction_sent_to_signers');
    });
  });

  describe('beautifyErrorMessage cases:\n', () => {
    it('Must return null', async () => {
      expect(await beautifyErrorMessage(null)).toBe(null);
    });

    it('Must remove an exception on error and return bgd_ops_error', async () => {
      const error = new Error(
        'Removed all around here, Exception:Private key not defined. Code 191',
      );
      const errorMessage = await beautifyErrorMessage(error);
      expect(errorMessage).toBe(
        `${I18nUtils.getMessage(
          'bgd_ops_error',
        )} : Private key not defined. Code 191`,
      );
    });

    it('Must return an unknown_error', async () => {
      const error = new Error(' ');
      const errorMessage = await beautifyErrorMessage(error);
      expect(errorMessage).toBe(I18nUtils.getMessage('unknown_error'));
    });

    it('uses colon split when no Exception substring is present', async () => {
      const error = new Error('rpc:node timeout');
      const out = await beautifyErrorMessage(error);
      expect(out).toContain('node timeout');
    });

    it('passes through simple messages when no colon', async () => {
      const error = new Error('network down');
      const out = await beautifyErrorMessage(error);
      expect(out).toContain('network down');
    });
  });
});
