import { EvmTokenInfoShort } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import { HDNodeWallet, TransactionRequest, ethers } from 'ethers';

const getProvider = (chain: EvmChain, rpcUrl?: string) => {
  return new ethers.JsonRpcProvider(rpcUrl ?? chain.rpc[0].url);
};

const getGasLimit = async (
  chain: EvmChain,
  tokenInfo: EvmTokenInfoShort | undefined,
  wallet: HDNodeWallet,
  data?: string,
) => {
  console.log('in get gas limit');

  const provider = getProvider(chain);

  if (data) {
    console.log(data, tokenInfo?.address);
    const tx: TransactionRequest = {
      from: wallet.address,
      data: data,
      to: tokenInfo?.address,
    };
    const estimation = await provider.estimateGas(tx);

    let multiplier = 1.5;
    return Decimal.mul(Number(estimation), multiplier).toNumber();
  }

  // if (tokenInfo && tokenInfo.type === EVMTokenType.ERC20) {
  //   const erc20 = new ethers.Contract(
  //     (tokenInfo as EvmTokenInfoShortErc20).address!,
  //     Erc20Abi,
  //     connectedWallet,
  //   );
  //   const estimation = await erc20.transfer.estimateGas(
  //     receiverAddress,
  //     amount * 1000000,
  //   );

  //   // let multiplier = chain.isEth ? 1 : 1.5;
  //   let multiplier = 1.5;
  //   return Decimal.mul(Number(estimation), multiplier).toNumber();
  // }
  else {
    return 21000;
  }
};

export const EthersUtils = { getProvider, getGasLimit };
