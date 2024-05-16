import { EvmErc20TokenBalanceWithPrice } from '@moralisweb3/common-evm-utils';
import { MetamaskGasFeeApi } from '@popup/evm/api/metamask-gas-fee.api';
import { FullGasFeeEstimation } from '@popup/evm/interfaces/gas-fee.interface';
import EthersUtils from '@popup/evm/utils/ethers.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import { HDNodeWallet } from 'ethers';

const estimate = async (
  chain: EvmChain,
  token: EvmErc20TokenBalanceWithPrice,
  receiverAddress: string,
  amount: number,
  wallet: HDNodeWallet,
) => {
  const mmEstimates = await MetamaskGasFeeApi.get(
    parseInt(chain.chainId).toString(),
  );

  const gasLimit = await EthersUtils.getGasLimit(
    chain,
    token,
    receiverAddress,
    amount,
    wallet,
  );

  const low = Decimal.add(
    Number(mmEstimates.low.suggestedMaxFeePerGas),
    Number(mmEstimates.low.suggestedMaxPriorityFeePerGas),
  )
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000)
    .toNumber();
  const medium = Decimal.add(
    Number(mmEstimates.medium.suggestedMaxFeePerGas),
    Number(mmEstimates.medium.suggestedMaxPriorityFeePerGas),
  )
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000)
    .toNumber();
  const aggressive = Decimal.add(
    Number(mmEstimates.high.suggestedMaxFeePerGas),
    Number(mmEstimates.high.suggestedMaxPriorityFeePerGas),
  )
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000)
    .toNumber();

  return {
    suggested: {
      estimatedFee: low,
      estimatedMaxDuration: mmEstimates.low.maxWaitTimeEstimate / 1000,
    },
    low: {
      estimatedFee: low,
      estimatedMaxDuration: mmEstimates.low.maxWaitTimeEstimate / 1000,
    },
    medium: {
      estimatedFee: medium,
      estimatedMaxDuration: mmEstimates.medium.maxWaitTimeEstimate / 1000,
    },
    max: {
      estimatedFee: medium,
      estimatedMaxDuration: mmEstimates.medium.maxWaitTimeEstimate / 1000,
    },
    aggressive: {
      estimatedFee: aggressive,
      estimatedMaxDuration: mmEstimates.high.maxWaitTimeEstimate / 1000,
    },
  } as FullGasFeeEstimation;
};

export const GasFeeUtils = {
  estimate,
};
