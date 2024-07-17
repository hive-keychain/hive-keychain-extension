import { EVMToken } from '@popup/evm/interfaces/active-account.interface';
import { EVMTokenType } from '@popup/evm/interfaces/evm-tokens.interface';
import { GasFeeEstimation } from '@popup/evm/interfaces/gas-fee.interface';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { HDNodeWallet, TransactionRequest, Wallet, ethers } from 'ethers';

const transfer = async (
  chain: EvmChain,
  token: EVMToken,
  receiverAddress: string,
  amount: number,
  wallet: HDNodeWallet,
  gasFee: GasFeeEstimation,
) => {
  if (token.tokenInfo.type === EVMTokenType.ERC20) {
    const provider = EthersUtils.getProvider(chain);
    const connectedWallet = new Wallet(wallet.signingKey, provider);
    const contract = new ethers.Contract(
      token.tokenInfo.address!,
      Erc20Abi,
      connectedWallet,
    );

    const data = contract.interface.encodeFunctionData('transfer', [
      receiverAddress,
      amount * 1000000,
    ]);

    const transactionRequest: TransactionRequest = {
      to: token.tokenInfo.address!,
      value: 0,
      data: data,
      from: connectedWallet.address,
      nonce: await connectedWallet.getNonce(),
      maxPriorityFeePerGas: BigInt(gasFee.priorityFee),
      gasLimit: BigInt(gasFee.gasLimit.toFixed(0)),
      chainId: chain.chainId,
    };

    const transactionResponse = await connectedWallet.sendTransaction(
      transactionRequest,
    );
    return transactionResponse.wait();
  }
};

export const EvmTransferUtils = { transfer };
