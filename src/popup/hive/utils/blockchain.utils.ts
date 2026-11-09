import { AsyncUtils } from 'src/utils/async.utils';

const HIVE_BLOCK_INTERVAL_MS = 3000;
const TIME_REFERENCE = 1643236071000;
const REFRESH_BUFFER_MS = 100;

const getDelayRefreshMs = (now: number) => {
  const elapsedInInterval = (now - TIME_REFERENCE) % HIVE_BLOCK_INTERVAL_MS;
  const delayUntilNextBlock = HIVE_BLOCK_INTERVAL_MS - elapsedInInterval;
  return delayUntilNextBlock + HIVE_BLOCK_INTERVAL_MS + REFRESH_BUFFER_MS;
};

const delayRefresh = async (): Promise<void> => {
  await AsyncUtils.sleep(getDelayRefreshMs(Date.now()));
};

const BlockchainTransactionUtils = {
  getDelayRefreshMs,
  delayRefresh,
};

export default BlockchainTransactionUtils;
