import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';

type CreatedTx = Awaited<ReturnType<typeof HiveTxUtils.createTransaction>>;

/**
 * Ledger broadcast paths build a tx via `HiveTxUtils.createTransaction` before signing.
 * Tests mock signature + `broadcastAndConfirmTransactionWithSignature`; without this,
 * hive-tx tries real RPC and fails (e.g. `undefined.then`).
 */
export function mockHiveTxCreateTransactionForLedger(): void {
  jest
    .spyOn(HiveTxUtils, 'createTransaction')
    .mockResolvedValue({} as CreatedTx);
}
