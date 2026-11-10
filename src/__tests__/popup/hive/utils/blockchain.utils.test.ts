import BlockchainTransactionUtils from 'src/popup/hive/utils/blockchain.utils';

const TIME_REFERENCE = 1643236071000;
const HIVE_BLOCK_INTERVAL_MS = 3000;

describe('BlockchainTransactionUtils', () => {
  describe('getDelayRefreshMs', () => {
    it('waits through the next block and one more so a broadcast can be included', () => {
      const now = TIME_REFERENCE + 1500;

      const delay = BlockchainTransactionUtils.getDelayRefreshMs(now);

      expect(delay).toBe(4600);
      expect(now + delay).toBeGreaterThan(
        TIME_REFERENCE + 2 * HIVE_BLOCK_INTERVAL_MS,
      );
    });

    it('waits at least one full block when the next block is immediate', () => {
      const now = TIME_REFERENCE + HIVE_BLOCK_INTERVAL_MS - 1;

      const delay = BlockchainTransactionUtils.getDelayRefreshMs(now);

      expect(delay).toBe(3101);
      expect(delay).toBeGreaterThan(HIVE_BLOCK_INTERVAL_MS);
    });

    it('waits two blocks when the clock is on a block boundary', () => {
      expect(BlockchainTransactionUtils.getDelayRefreshMs(TIME_REFERENCE)).toBe(
        6100,
      );
    });
  });
});
