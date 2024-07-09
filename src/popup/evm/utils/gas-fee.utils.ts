import { EVMToken } from '@popup/evm/interfaces/active-account.interface';
import { FullGasFeeEstimation } from '@popup/evm/interfaces/gas-fee.interface';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { Chain, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import { HDNodeWallet } from 'ethers';
import { KeychainApi } from 'src/api/keychain';

const getGasFeeEstimations = async (chain: Chain) => {
  return await KeychainApi.get(`evm/gasPriceEstimate/${chain.chainId}`);
};

const estimate = async (
  chain: EvmChain,
  token: EVMToken,
  receiverAddress: string,
  amount: number,
  wallet: HDNodeWallet,
) => {
  const estimates = await getGasFeeEstimations(chain);

  const gasLimit = await EthersUtils.getGasLimit(
    chain,
    token,
    receiverAddress,
    amount,
    wallet,
  );

  const low = new Decimal(Number(estimates.low.suggestedMaxFeePerGas))
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000)
    .toNumber();
  const medium = new Decimal(Number(estimates.medium.suggestedMaxFeePerGas))
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000)
    .toNumber();
  const aggressive = new Decimal(Number(estimates.high.suggestedMaxFeePerGas))
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000)
    .toNumber();

  return {
    gasLimit: gasLimit,
    suggested: {
      estimatedFee: low,
      estimatedMaxDuration: estimates.low.maxWaitTimeEstimate / 1000,
    },
    low: {
      estimatedFee: low,
      estimatedMaxDuration: estimates.low.maxWaitTimeEstimate / 1000,
    },
    medium: {
      estimatedFee: medium,
      estimatedMaxDuration: estimates.medium.maxWaitTimeEstimate / 1000,
    },
    max: {
      estimatedFee: aggressive,
      estimatedMaxDuration: estimates.high.maxWaitTimeEstimate / 1000,
    },
    aggressive: {
      estimatedFee: aggressive,
      estimatedMaxDuration: estimates.high.maxWaitTimeEstimate / 1000,
    },
  } as FullGasFeeEstimation;
};

export const GasFeeUtils = {
  estimate,
};
