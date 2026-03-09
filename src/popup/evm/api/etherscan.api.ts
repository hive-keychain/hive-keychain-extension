// https://gas.api.cx.metamask.io/networks/43114/suggestedGasFees

import { KeychainApi } from '@api/keychain';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';

const getPendingTransactions = async (chain: EvmChain, address: string) => {
  const result = await KeychainApi.get(
    `evm/smart-contracts-info/etherscan?function=pending-tx-list&address=${address}&chain=${chain.chainId}`,
  );
  return result ?? [];
};

export const EtherscanApi = {
  getPendingTransactions,
};
