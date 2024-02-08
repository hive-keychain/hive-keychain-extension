/* istanbul ignore next */
const delayRefresh = async (): Promise<void> => {
  const TIME_REFERENCE = 1643236071000;
  const delay = Math.min(
    ((Date.now() - TIME_REFERENCE) % 3) * 1000 + 100,
    3000,
  );
  return new Promise(function (fulfill, reject) {
    setTimeout(() => {
      fulfill();
    }, delay);
  });
};

const BlockchainTransactionUtils = {
  delayRefresh,
};

export default BlockchainTransactionUtils;
