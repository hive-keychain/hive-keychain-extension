import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import {
  ProviderRpcError,
  ProviderRpcErrorList,
} from '@interfaces/evm-provider.interface';
import {
  EvmTransactionType,
  ProviderTransactionData,
} from '@popup/evm/interfaces/evm-transactions.interface';

export const validateRequest = (
  method: EvmRequestMethod,
  params: any,
): boolean => {
  console.log(method, params);
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
      }
    }
  }
  return true;
};
