import {
  EVMTokenType,
  EvmTokenInfoShort,
  EvmTokenInfoShortErc20,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import { HDNodeWallet, TransactionRequest, Wallet, ethers } from 'ethers';

const getProvider = (chain: EvmChain, rpcUrl?: string) => {
  return new ethers.JsonRpcProvider(rpcUrl ?? chain.rpc[0].url);
};

const getGasLimit = async (
  chain: EvmChain,
  tokenInfo: EvmTokenInfoShort | undefined,
  receiverAddress: string | null,
  amount: number,
  wallet: HDNodeWallet,
  smartContract?: string,
) => {
  console.log('in get gas limit');
  console.log({
    chain,
    tokenInfo,
    receiverAddress,
    amount,
    wallet,
    smartContract,
  });

  const provider = getProvider(chain);
  const connectedWallet = new Wallet(wallet.signingKey, provider);

  console.log(receiverAddress, smartContract);

  if (!receiverAddress && smartContract) {
    console.log('here');
    const tx: TransactionRequest = {
      from: wallet.address,
      data: smartContract,
    };
    return await provider.estimateGas(tx);
  }

  if (tokenInfo && tokenInfo.type === EVMTokenType.ERC20) {
    const erc20 = new ethers.Contract(
      (tokenInfo as EvmTokenInfoShortErc20).address!,
      Erc20Abi,
      connectedWallet,
    );
    const estimation = await erc20.transfer.estimateGas(
      receiverAddress,
      amount * 1000000,
    );

    // let multiplier = chain.isEth ? 1 : 1.5;
    let multiplier = 1.5;
    return Decimal.mul(Number(estimation), multiplier).toNumber();
  } else {
    return 21000;
  }
};

export const EthersUtils = { getProvider, getGasLimit };
