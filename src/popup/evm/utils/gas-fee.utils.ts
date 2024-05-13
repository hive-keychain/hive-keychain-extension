import { EvmErc20TokenBalanceWithPrice } from '@moralisweb3/common-evm-utils';
import EthersUtils from '@popup/evm/utils/ethers.utils';
import { Chain } from '@popup/multichain/interfaces/chains.interface';
import { HDNodeWallet } from 'ethers';
const estimate = async (
  chain: Chain,
  token: EvmErc20TokenBalanceWithPrice,
  receiverAddress: string,
  amount: number,
  wallet: HDNodeWallet,
) => {
  // const totalEstimate = await MetamaskGasFeeApi.get(
  //   parseInt(chain.chainId).toString(),
  // );

  // console.log(totalEstimate);

  const test = (await EthersUtils.getProvider().getFeeData()).maxFeePerGas;
  console.log(test);
  const gasAmountRequired = await EthersUtils.getGasAmount(
    chain,
    token,
    receiverAddress,
    amount,
    wallet,
  );

  console.log(test! * gasAmountRequired);

  return 30;
};

export const GasFeeUtils = {
  estimate,
};
