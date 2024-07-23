import { EVMToken } from '@popup/evm/interfaces/active-account.interface';
import { EVMTokenType } from '@popup/evm/interfaces/evm-tokens.interface';
import { GasFeeEstimation } from '@popup/evm/interfaces/gas-fee.interface';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import {
  HDNodeWallet,
  TransactionRequest,
  TransactionResponse,
  Wallet,
  ethers,
} from 'ethers';

const transfer = async (
  chain: EvmChain,
  token: EVMToken,
  receiverAddress: string,
  amount: number,
  wallet: HDNodeWallet,
  gasFee: GasFeeEstimation,
  nonce?: number,
) => {
  const provider = EthersUtils.getProvider(chain);
  const connectedWallet = new Wallet(wallet.signingKey, provider);
  let transactionRequest: TransactionRequest;
  if (token.tokenInfo.type === EVMTokenType.ERC20) {
    const contract = new ethers.Contract(
      token.tokenInfo.address!,
      Erc20Abi,
      connectedWallet,
    );

    const data = contract.interface.encodeFunctionData('transfer', [
      receiverAddress,
      amount * 1000000,
    ]);

    transactionRequest = {
      to: token.tokenInfo.address!,
      value: 0,
      data: data,
      from: connectedWallet.address,
      nonce: nonce ?? (await connectedWallet.getNonce()),
      maxPriorityFeePerGas: ethers.parseUnits(
        gasFee.priorityFee.toString(),
        'gwei',
      ),
      maxFeePerGas: ethers.parseUnits(gasFee.maxFeePerGas.toString(), 'gwei'),
      gasLimit: BigInt(gasFee.gasLimit.toFixed(0)),
      chainId: chain.chainId,
    };

    const transactionResponse = await connectedWallet.sendTransaction(
      transactionRequest,
    );
    return transactionResponse;
  } else {
    transactionRequest = {
      to: receiverAddress,
      value: amount * 1000000000000000000,
      from: connectedWallet.address,
      nonce: nonce ?? (await connectedWallet.getNonce()),
      maxPriorityFeePerGas: ethers.parseUnits(
        gasFee.priorityFee.toString(),
        'gwei',
      ),
      maxFeePerGas: ethers.parseUnits(gasFee.maxFeePerGas.toString(), 'gwei'),
      gasLimit: BigInt(gasFee.gasLimit.toFixed(0)),
      chainId: chain.chainId,
    };
  }
  const transactionResponse = await connectedWallet.sendTransaction(
    transactionRequest,
  );
  return transactionResponse;
};

const cancel = async (
  transactionResponse: TransactionResponse,
  chain: EvmChain,
  gasFee: GasFeeEstimation,
  wallet: HDNodeWallet,
) => {
  const newGasFee: GasFeeEstimation = {
    ...gasFee,
    maxFeePerGas: new Decimal(gasFee.maxFeePerGas).mul(1.5).toNumber(),
    priorityFee: new Decimal(gasFee.priorityFee).mul(1.5).toNumber(),
  };

  return transfer(
    chain,
    { tokenInfo: { type: EVMTokenType.NATIVE } } as EVMToken,
    ethers.ZeroAddress,
    0,
    wallet,
    newGasFee,
    transactionResponse.nonce,
  );
};

export const EvmTransactionsUtils = { transfer, cancel };
