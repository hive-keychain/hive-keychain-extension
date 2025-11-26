import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import {
  KeychainRequestTypes,
  RequestId,
  RequestSendToken,
} from 'hive-keychain-commons';
import mk from 'src/__tests__/utils-for-testing/data/mk';

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
      const successMsg = chrome.i18n.getMessage('bgd_ops_transfer_success', [
        datas.amount,
        datas.currency,
        datas.username!,
        datas.to,
      ]);
      const result = await createMessage(
        undefined,
        {
          tx_id: 'tx_id',
          id: 'id',
          confirmed: true,
        } as TransactionResult,
        datas,
        successMsg,
        null,
        undefined,
      );
      const { request_id, ...data } = datas;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: true,
          error: undefined,
          result: {
            tx_id: 'tx_id',
            id: 'id',
            confirmed: true,
          } as TransactionResult,
          data: data,
          message: successMsg,
          request_id,
          publicKey: undefined,
        },
      });
    });

    it('Must return an answerRequest with error', async () => {
      const errorMsg = 'Error while waiting confirmation';
      const errorMessage = `${chrome.i18n.getMessage('bgd_ops_error')} : ${errorMsg}`;
      const result = await createMessage(
        errorMessage,
        undefined,
        datas,
        null,
        errorMessage,
        undefined,
      );
      const { request_id, ...data } = datas;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          error: errorMessage,
          success: false,
          result: undefined,
          data: data,
          message: errorMessage,
          request_id,
          publicKey: undefined,
        },
      });
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
        `${chrome.i18n.getMessage(
          'bgd_ops_error',
        )} : Private key not defined. Code 191`,
      );
    });

    it('Must return an unknown_error', async () => {
      const error = new Error(' ');
      const errorMessage = await beautifyErrorMessage(error);
      expect(errorMessage).toBe(chrome.i18n.getMessage('unknown_error'));
    });
  });
});
