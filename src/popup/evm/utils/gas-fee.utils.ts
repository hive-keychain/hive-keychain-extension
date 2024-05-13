import { EvmErc20TokenBalanceWithPrice } from '@moralisweb3/common-evm-utils';
import { MetamaskGasFeeApi } from '@popup/evm/api/metamask-gas-fee.api';
import EthersUtils from '@popup/evm/utils/ethers.utils';
import { Chain } from '@popup/multichain/interfaces/chains.interface';

const estimate = async (chain: Chain, token: EvmErc20TokenBalanceWithPrice) => {
  const totalEstimate = await MetamaskGasFeeApi.get(
    parseInt(chain.chainId).toString(),
  );

  const gasAmountRequired = EthersUtils.getGasAmount(chain, token);

  return 30;
};

export const GasFeeUtils = {
  estimate,
};
