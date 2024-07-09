import { EVMToken } from '@popup/evm/interfaces/active-account.interface';
import {
  EVMTokenType,
  EvmTokenInfoShortErc20,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import { HDNodeWallet, Wallet, ethers } from 'ethers';

const getProvider = (chain: EvmChain) => {
  return new ethers.JsonRpcProvider(chain.rpc[0].url);
  // return new InfuraProvider(
  //   network,
  //   process.env.INFURA_PROJECT_ID,
  //   process.env.INFURA_SECRET,
  // );
};

const getGasLimit = async (
  chain: EvmChain,
  token: EVMToken,
  receiverAddress: string,
  amount: number,
  wallet: HDNodeWallet,
) => {
  const provider = getProvider(chain);
  const connectedWallet = new Wallet(wallet.signingKey, provider);

  if (token.tokenInfo.type === EVMTokenType.ERC20) {
    const erc20 = new ethers.Contract(
      (token.tokenInfo as EvmTokenInfoShortErc20).address!,
      Erc20Abi,
      connectedWallet,
    );
    const estimation = await erc20.transfer.estimateGas(
      receiverAddress,
      amount * 1000000,
    );

    let multiplier = chain.isEth ? 1.5 : 1;
    return Decimal.mul(Number(estimation), multiplier);
  } else {
    // const feeData = await provider.getFeeData();
    return 21000;
  }
};

export const EthersUtils = { getProvider, getGasLimit };
