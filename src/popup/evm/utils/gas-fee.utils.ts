import { EvmErc20TokenBalanceWithPrice } from '@moralisweb3/common-evm-utils';
import { MetamaskGasFeeApi } from '@popup/evm/api/metamask-gas-fee.api';
import EthersUtils from '@popup/evm/utils/ethers.utils';
import { Chain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import { HDNodeWallet } from 'ethers';
const estimate = async (
  chain: Chain,
  token: EvmErc20TokenBalanceWithPrice,
  receiverAddress: string,
  amount: number,
  wallet: HDNodeWallet,
) => {
  const totalEstimate = await MetamaskGasFeeApi.get(
    parseInt(chain.chainId).toString(),
  );

  console.log(totalEstimate);

  const test = await EthersUtils.getProvider().getFeeData();
  console.log(test);

  const gasAmountRequired = await EthersUtils.getGasAmount(
    chain,
    token,
    receiverAddress,
    amount,
    wallet,
  );
  console.log(Number(gasAmountRequired) * 1.5);

  const a = Decimal.div(Number(test.maxFeePerGas!), 1000000)
    .mul(Decimal.div(Number(gasAmountRequired), 1000000))
    .toNumber();
  console.log(a);

  return 30;
};

export const GasFeeUtils = {
  estimate,
};
