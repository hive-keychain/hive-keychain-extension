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
import { ethers } from 'ethers';

export const validateRequest = (
  method: EvmRequestMethod,
  params: any,
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
      } else if (transactionParams.type === EvmTransactionType.EIP_1559) {
        if (!!transactionParams.gasPrice)
          throw ProviderRpcErrorList.invalidMethodParams as ProviderRpcError;
      } else if (isNaN(Number(transactionParams.value))) {
        throw {
          ...ProviderRpcErrorList.invalidMethodParams,
          message: `Invalid parameter. Value is not a valid number (value: ${transactionParams.value})`,
        } as ProviderRpcError;
      } else if (
        transactionParams.to &&
        !ethers.isAddress(transactionParams.to)
      ) {
        throw {
          ...ProviderRpcErrorList.invalidMethodParams,
          message: `Invalid parameter. Receiver address is not valid (receiver: ${transactionParams.to})`,
        } as ProviderRpcError;
      } else if (
        transactionParams.gasLimit &&
        isNaN(transactionParams.gasLimit)
      ) {
        throw {
          ...ProviderRpcErrorList.invalidMethodParams,
          message: `Invalid parameter. Gas limit is not a valid number (gasLimit: ${transactionParams.gasLimit})`,
        } as ProviderRpcError;
      } else if (
        transactionParams.maxFeePerGas &&
        isNaN(Number(transactionParams.maxFeePerGas))
      ) {
        throw {
          ...ProviderRpcErrorList.invalidMethodParams,
          message: `Invalid parameter. Max fee per gas is not a valid number (max fee per gas: ${transactionParams.maxFeePerGas})`,
        } as ProviderRpcError;
      } else if (
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
    }
  }
  return true;
};
