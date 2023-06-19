import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import {
  KeychainRequestTypes,
  RequestId,
  RequestSendToken,
} from 'hive-keychain-commons';
import { transactionConfirmationSuccess } from 'src/__tests__/utils-for-testing/data/confirmations';
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
    it('Must return an answerRequest with success', () => {
      const result = createMessage(
        undefined,
        transactionConfirmationSuccess,
        datas,
        chrome.i18n.getMessage('bgd_ops_transfer_success', [
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
          result: transactionConfirmationSuccess,
          data: data,
          message: chrome.i18n.getMessage('bgd_ops_transfer_success', [
            datas.amount,
            datas.currency,
            datas.username!,
            datas.to,
          ]),
          request_id,
        },
      });
    });

    it('Must return an answerRequest with error', () => {
      const errorMsg = 'Error while waiting confirmation';
      const result = createMessage(
        `${chrome.i18n.getMessage('bgd_ops_error')} : ${errorMsg}`,
        undefined,
        datas,
        null,
        `${chrome.i18n.getMessage('bgd_ops_error')} : ${errorMsg}`,
        undefined,
      );
      const { request_id, ...data } = datas;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          error: `${chrome.i18n.getMessage('bgd_ops_error')} : ${errorMsg}`,
          success: false,
          result: undefined,
          data: data,
          message: `${chrome.i18n.getMessage('bgd_ops_error')} : ${errorMsg}`,
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
