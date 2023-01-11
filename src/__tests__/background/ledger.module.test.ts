import LedgerModule from '@background/ledger.module';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import ledgerModuleMocks from 'src/__tests__/background/mocks/ledger.module-mocks';

describe('ledger module tests:\n', () => {
  const { data, spies } = ledgerModuleMocks;
  describe('signTransactionFromLedger cases:\n', () => {
    it('Must call sendMessage', () => {
      LedgerModule.signTransactionFromLedger(data);
      expect(spies.sendMessage).toBeCalledWith({
        command: DialogCommand.SIGN_WITH_LEDGER,
        ...data,
      });
    });
  });
});
