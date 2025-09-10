import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import {
  ProviderRpcError,
  ProviderRpcErrorList,
} from '@interfaces/evm-provider.interface';
import {
  EvmTransactionType,
  getAllTransactionTypes,
  ProviderTransactionData,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { Chain } from '@popup/multichain/interfaces/chains.interface';
import { defaultChainList } from '@popup/multichain/reference-data/chains.list';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { ethers } from 'ethers';

export const validateRequest = (
  method: EvmRequestMethod,
  params: any,
  domain: string,
): boolean => {
  switch (method) {
    case EvmRequestMethod.SEND_TRANSACTION: {
      const transactionParams = params[0] as ProviderTransactionData;

      if (transactionParams.type === EvmTransactionType.LEGACY) {
        if (
          !!transactionParams.maxFeePerGas ||
          !!transactionParams.maxPriorityFeePerGas
        ) {
          throw ProviderRpcErrorList.invalidMethodParams as ProviderRpcError;
        }
      }
      if (transactionParams.type === EvmTransactionType.EIP_1559) {
        if (!!transactionParams.gasPrice)
          throw ProviderRpcErrorList.invalidMethodParams as ProviderRpcError;
      }
      if (isNaN(Number(transactionParams.value))) {
        throw {
          ...ProviderRpcErrorList.invalidMethodParams,
          message: `Invalid parameter. Value is not a valid number (value: ${transactionParams.value})`,
        } as ProviderRpcError;
      }
      if (transactionParams.to && !ethers.isAddress(transactionParams.to)) {
        throw {
          ...ProviderRpcErrorList.invalidMethodParams,
          message: `Invalid parameter. Receiver address is not valid (receiver: ${transactionParams.to})`,
        } as ProviderRpcError;
      }
      if (transactionParams.gasLimit && isNaN(transactionParams.gasLimit)) {
        throw {
          ...ProviderRpcErrorList.invalidMethodParams,
          message: `Invalid parameter. Gas limit is not a valid number (gasLimit: ${transactionParams.gasLimit})`,
        } as ProviderRpcError;
      }
      if (
        transactionParams.maxFeePerGas &&
        isNaN(Number(transactionParams.maxFeePerGas))
      ) {
        throw {
          ...ProviderRpcErrorList.invalidMethodParams,
          message: `Invalid parameter. Max fee per gas is not a valid number (max fee per gas: ${transactionParams.maxFeePerGas})`,
        } as ProviderRpcError;
      }
      if (
        transactionParams.type &&
        !getAllTransactionTypes().includes(transactionParams.type)
      ) {
        throw {
          ...ProviderRpcErrorList.invalidMethodParams,
          message: `Invalid parameter. Transaction Type should be included in [${getAllTransactionTypes().join(
            ', ',
          )}] (type: ${transactionParams.type})`,
        } as ProviderRpcError;
      }
      if (!transactionParams.value.startsWith('0x')) {
        throw {
          ...ProviderRpcErrorList.invalidMethodParams,
          message: `Invalid parameter. ${transactionParams.value} is not a valid hexadecimal`,
        } as ProviderRpcError;
      }
      break;
    }
    case EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN: {
      if (!params[0]) {
        throw {
          ...ProviderRpcErrorList.invalidMethodParams,
          message: `Invalid parameters. Missing chainId`,
        } as ProviderRpcError;
      }
      if (typeof params[0].chainId !== 'string') {
        throw {
          ...ProviderRpcErrorList.invalidMethodParams,
          message: `Invalid parameter. ChainId must be a string`,
        } as ProviderRpcError;
      }
      if (!params[0].chainId.startsWith('0x')) {
        throw {
          ...ProviderRpcErrorList.invalidMethodParams,
          message: `Invalid parameter. ${params[0]} is not a valid chainId. It must be using hexadecimal format`,
        } as ProviderRpcError;
      }
      if (
        !defaultChainList.find(
          (chain: Chain) => chain.chainId === params[0].chainId,
        )
      ) {
        throw {
          ...ProviderRpcErrorList.chainNotAdded,
          message: `Invalid parameter. ${params[0].chainId} hasn't been added to Keychain`,
        } as ProviderRpcError;
      }
      break;
    }
    case EvmRequestMethod.WALLET_ADD_ETH_CHAIN: {
      if (
        !ChainUtils.getDefaultChains().find(
          (chain) =>
            params[0].chainId.toLowerCase() === chain.chainId.toLowerCase(),
        )
      ) {
        throw {
          ...ProviderRpcErrorList.invalidMethodParams,
          message: `Chain ${params[0].chainId} is not compatible with Keychain`,
        } as ProviderRpcError;
      }
      break;
    }
  }
  return true;
};
