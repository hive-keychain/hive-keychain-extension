import { EvmErc20TokenBalanceWithPrice } from '@moralisweb3/common-evm-utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';

const getTotalBalanceInUsd = (tokens: EvmErc20TokenBalanceWithPrice[]) => {
  return tokens.reduce((a, b) => a + b.usdValue, 0);
};

const getTotalBalanceInMainToken = (
  tokens: EvmErc20TokenBalanceWithPrice[],
  chain: EvmChain,
) => {
  const mainToken = tokens.find((token) => token.symbol === chain.mainToken);
  if (mainToken) {
    const valueInUsd = getTotalBalanceInUsd(tokens);
    return valueInUsd / parseFloat(mainToken?.usdPrice);
  } else return 0;
};

export const EvmTokensUtils = {
  getTotalBalanceInMainToken,
  getTotalBalanceInUsd,
};
