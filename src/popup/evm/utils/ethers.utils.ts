import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import { ethers, HDNodeWallet, TransactionRequest } from 'ethers';

const getProvider = (chain: EvmChain, rpcUrl?: string) => {
  return new ethers.JsonRpcProvider(rpcUrl ?? chain.rpc[0].url);
};

const getGasLimit = async (
  chain: EvmChain,
  wallet: HDNodeWallet,
  abi?: any,
  method?: string,
  args?: any[],
  data?: string,
  to?: string,
) => {
  console.log('in get gas limit', { method, args, data, to });

  const provider = getProvider(chain);

  if (abi && to && method && args) {
    try {
      console.log('ici');
      const contract = new ethers.Contract(to, abi, wallet);

      const estimation = await contract[method].estimateGas(...args);

      // let multiplier = chain.isEth ? 1 : 1.5;
      let multiplier = 1.5;
      return Decimal.mul(Number(estimation), multiplier).toNumber();
    } catch (e) {
      console.log(e);
      const tx: TransactionRequest = {
        from: wallet.address,
        data: data,
        to: to,
      };
      return getGasLimitFromRawTx(tx, provider);
    }
  } else if (data) {
    console.log('la');
    const tx: TransactionRequest = {
      from: wallet.address,
      data: data,
      to: to,
    };
    return getGasLimitFromRawTx(tx, provider);
  } else {
    return 21000;
  }
};

const getGasLimitFromRawTx = async (
  tx: TransactionRequest,
  provider: ethers.Provider,
) => {
  const estimation = await provider.estimateGas(tx);

  let multiplier = 1.5;
  return Decimal.mul(Number(estimation), multiplier).toNumber();
};

export const EthersUtils = { getProvider, getGasLimit };
