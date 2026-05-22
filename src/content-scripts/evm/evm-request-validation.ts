import {
  doesMethodExist,
  EvmRequestMethod,
} from '@background/evm/evm-methods/evm-methods.list';
import {
  EvmRequest,
  ProviderRpcError,
  ProviderRpcErrorList,
} from '@interfaces/evm-provider.interface';
import {
  EvmTransactionType,
  getAllTransactionTypes,
  ProviderTransactionData,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { AddChainRequest } from '@popup/evm/interfaces/evm-requests.interfaces';
import { EvmRpcUrlUtils } from '@popup/evm/utils/evm-rpc-url.utils';
import { ethers } from 'ethers';

const EVM_CHAIN_ID_REGEX = /^0x[0-9a-fA-F]+$/;

const getProviderRpcError = (
  error: keyof typeof ProviderRpcErrorList,
  message?: string,
) =>
  ({
    ...ProviderRpcErrorList[error],
    ...(message ? { message } : {}),
  }) as ProviderRpcError;

const assertParamsArray = (params: unknown): unknown[] => {
  if (!Array.isArray(params)) {
    throw getProviderRpcError(
      'invalidMethodParams',
      'Invalid parameter. Params must be an array.',
    );
  }

  return params;
};

export const validateEvmRequest = (request: unknown): EvmRequest => {
  if (!request || typeof request !== 'object') {
    throw getProviderRpcError('nonValidRequest', 'Missing request.');
  }

  const evmRequest = request as Partial<EvmRequest>;
  if (
    typeof evmRequest.request_id !== 'number' ||
    !Number.isFinite(evmRequest.request_id)
  ) {
    throw getProviderRpcError(
      'nonValidRequest',
      'Invalid request. Missing or invalid request_id.',
    );
  }

  if (typeof evmRequest.method !== 'string') {
    throw getProviderRpcError(
      'nonValidRequest',
      'Invalid request. Missing or invalid method.',
    );
  }

  if (!doesMethodExist(evmRequest.method)) {
    throw getProviderRpcError('nonExistingMethod');
  }

  const params = evmRequest.params ?? [];
  assertParamsArray(params);
  validateRequest(evmRequest.method as EvmRequestMethod, params);

  return {
    ...evmRequest,
    method: evmRequest.method as EvmRequestMethod,
    params,
  } as EvmRequest;
};

export const validateRequest = (
  method: EvmRequestMethod,
  params: any,
): boolean => {
  switch (method) {
    case EvmRequestMethod.SEND_TRANSACTION: {
      const requestParams = assertParamsArray(params ?? []);
      const transactionParams = requestParams[0] as
        | ProviderTransactionData
        | undefined;

      if (!transactionParams || typeof transactionParams !== 'object') {
        throw {
          ...ProviderRpcErrorList.invalidMethodParams,
          message: 'Invalid parameter. Missing transaction parameters.',
        } as ProviderRpcError;
      }

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
      if (transactionParams.value && isNaN(Number(transactionParams.value))) {
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
      if (
        transactionParams.value &&
        !transactionParams.value.startsWith('0x')
      ) {
        throw {
          ...ProviderRpcErrorList.invalidMethodParams,
          message: `Invalid parameter. ${transactionParams.value} is not a valid hexadecimal`,
        } as ProviderRpcError;
      }
      break;
    }
    case EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN: {
      const requestParams = assertParamsArray(params);
      const switchParams = requestParams[0] as
        | { chainId?: unknown }
        | undefined;

      if (
        !switchParams ||
        typeof switchParams !== 'object' ||
        Array.isArray(switchParams)
      ) {
        throw {
          ...ProviderRpcErrorList.invalidMethodParams,
          message: `Invalid parameters. Missing chainId`,
        } as ProviderRpcError;
      }
      if (typeof switchParams.chainId !== 'string') {
        throw {
          ...ProviderRpcErrorList.invalidMethodParams,
          message: `Invalid parameter. ChainId must be a string`,
        } as ProviderRpcError;
      }
      if (!EVM_CHAIN_ID_REGEX.test(switchParams.chainId)) {
        throw {
          ...ProviderRpcErrorList.invalidMethodParams,
          message: `Invalid parameter. ${switchParams.chainId} is not a valid chainId. It must be using hexadecimal format`,
        } as ProviderRpcError;
      }
      // if (
      //   !(await ChainUtils.getDefaultChains()).find(
      //     (chain: Chain) => chain.chainId === params[0].chainId,
      //   )
      // ) {
      //   throw {
      //     ...ProviderRpcErrorList.chainNotAdded,
      //     message: `Invalid parameter. ${params[0].chainId} hasn't been added to Keychain`,
      //   } as ProviderRpcError;
      // }
      break;
    }
    case EvmRequestMethod.WALLET_ADD_ETH_CHAIN: {
      const requestParams = assertParamsArray(params ?? []);
      const addChainParams = requestParams[0] as
        | Partial<AddChainRequest>
        | undefined;

      if (
        !addChainParams ||
        typeof addChainParams !== 'object' ||
        Array.isArray(addChainParams)
      ) {
        throw getProviderRpcError(
          'invalidMethodParams',
          'Invalid parameter. Missing chain parameters.',
        );
      }

      if (
        typeof addChainParams.chainId !== 'string' ||
        !EVM_CHAIN_ID_REGEX.test(addChainParams.chainId)
      ) {
        throw getProviderRpcError(
          'invalidMethodParams',
          'Invalid parameter. ChainId must be a hexadecimal string.',
        );
      }

      if (
        !Array.isArray(addChainParams.rpcUrls) ||
        addChainParams.rpcUrls.length === 0
      ) {
        throw getProviderRpcError(
          'invalidMethodParams',
          'Invalid parameter. Missing RPC URLs.',
        );
      }

      if (
        addChainParams.rpcUrls.some(
          (rpcUrl) =>
            typeof rpcUrl !== 'string' ||
            !EvmRpcUrlUtils.isValidHttpsRpcUrl(rpcUrl),
        )
      ) {
        throw getProviderRpcError(
          'invalidMethodParams',
          'Invalid parameter. RPC URLs must use HTTPS.',
        );
      }
      break;
    }
  }
  return true;
};
