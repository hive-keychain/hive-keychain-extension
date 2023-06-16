import LedgerModule from '@background/ledger.module';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { SignFromLedgerRequestMessage } from 'src/dialog/pages/sign-transaction';

describe('ledger module tests:\n', () => {
  const data: SignFromLedgerRequestMessage = {
    transaction: {
      ref_block_num: 1,
      ref_block_prefix: 1,
      expiration: '11221112',
      operations: [],
      extensions: [],
    },
    key: userData.one.nonEncryptKeys.posting,
  };
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('signTransactionFromLedger cases:\n', () => {
    it('Must call sendMessage', () => {
      const sSendMessage = jest
        .spyOn(chrome.runtime, 'sendMessage')
        .mockReturnValue(undefined);

      LedgerModule.signTransactionFromLedger(data);
      expect(sSendMessage).toBeCalledWith({
        command: DialogCommand.SIGN_WITH_LEDGER,
        ...data,
      });
    });
  });
});
