import { EtherRPCCustomError } from '@popup/evm/interfaces/evm-errors.interface';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import { ethers, HDNodeWallet, TransactionRequest } from 'ethers';
import { EtherJsonRpcProvider } from 'src/utils/evm/ether-json-rpc-provider';

let jsonRpcProvider: ethers.JsonRpcApiProvider;
let chainId: EvmChain['chainId'];

const getProvider = async (chain: EvmChain, rpcUrl?: string) => {
  if (chainId !== chain.chainId) {
    return new EtherJsonRpcProvider(
      rpcUrl ?? (await EvmRpcUtils.getActiveRpc(chain)).url,
      undefined,
      { staticNetwork: ethers.Network.from(Number(chain.chainId)) },
    );
  } else {
    if (!jsonRpcProvider) {
      chainId = chain.chainId;
      jsonRpcProvider = new EtherJsonRpcProvider(
        rpcUrl ?? (await EvmRpcUtils.getActiveRpc(chain)).url,
        undefined,
        { staticNetwork: ethers.Network.from(Number(chain.chainId)) },
      );
    }

    return jsonRpcProvider;
    // return new ethers.JsonRpcProvider(rpcUrl ?? chain.rpcs[0].url, undefined, {
    //   staticNetwork: ethers.Network.from(Number(chain.chainId)),
    // });
  }
};

const setProvider = async (chain: EvmChain, rpcUrl: string) => {
  jsonRpcProvider = new EtherJsonRpcProvider(rpcUrl, undefined, {
    staticNetwork: ethers.Network.from(Number(chain.chainId)),
  });
};

const getGasLimit = async (
  chain: EvmChain,
  wallet: HDNodeWallet,
  abi?: any,
  method?: string,
  args?: any[],
  data?: string,
  to?: string,
  value?: string,
) => {
  const provider = await getProvider(chain);

  if (abi && to && method && args) {
    try {
      const contract = new ethers.Contract(to, abi, wallet);

      const estimation = await contract[method].estimateGas(...args);

      // let multiplier = chain.isEth ? 1 : 1.5;
      let multiplier = 1.5;
      return Decimal.mul(Number(estimation), multiplier).toNumber();
    } catch (e) {
      const tx: TransactionRequest = {
        from: wallet.address,
        data: data,
        to: to,
        value: value,
      };
      return getGasLimitFromRawTx(tx, provider);
    }
  } else if (data) {
    const tx: TransactionRequest = {
      from: wallet.address,
      data: data,
      to: to,
      value: value,
    };
    return getGasLimitFromRawTx(tx, provider);
  } else {
    return getGasLimitFromRawTx(
      {
        from: wallet.address,
        to: to,
        value: value,
      },
      provider,
    );
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

const reasonIncludes = (reason: string, patterns: string[]) => {
  return patterns.some((pattern) => reason.includes(pattern));
};

const getCallExceptionMessage = (
  reason?: string,
  shortMessage?: string,
  fallbackMessage?: string,
): EtherRPCCustomError => {
  const normalizedReason = [reason, shortMessage, fallbackMessage]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    reasonIncludes(normalizedReason, [
      'transfer amount exceeds allowance',
      'insufficient allowance',
    ])
  ) {
    return {
      message: 'evm_error_message_transfer_amount_exceeds_allowance',
      isBlocking: true,
    };
  }

  if (
    reasonIncludes(normalizedReason, [
      'transfer amount exceeds balance',
      'insufficient balance',
    ])
  ) {
    return {
      message: 'evm_error_message_insufficient_token_balance',
      isBlocking: true,
    };
  }

  if (
    reasonIncludes(normalizedReason, [
      'gas required exceeds allowance',
      'gas required exceeds allowance or always failing transaction',
    ])
  ) {
    return {
      message:
        'evm_transaction_result_error_message_gas_required_exceeds_allowance',
      isBlocking: true,
    };
  }

  if (reasonIncludes(normalizedReason, ['missing revert data'])) {
    return {
      message: 'evm_transaction_result_error_message_missing_revert_data',
      isBlocking: true,
    };
  }

  if (
    reasonIncludes(normalizedReason, [
      'ownable',
      'access control',
      'accesscontrol',
      'caller is not the owner',
      'not owner',
      'not authorized',
      'unauthorized',
    ])
  ) {
    return {
      message: 'evm_transaction_result_error_message_access_denied',
      isBlocking: true,
    };
  }

  if (reasonIncludes(normalizedReason, ['paused'])) {
    return {
      message: 'evm_transaction_result_error_message_paused',
      isBlocking: true,
    };
  }

  if (reasonIncludes(normalizedReason, ['blacklist', 'blacklisted'])) {
    return {
      message: 'evm_transaction_result_error_message_blacklisted',
      isBlocking: true,
    };
  }

  if (reasonIncludes(normalizedReason, ['deadline', 'expired'])) {
    return {
      message: 'evm_transaction_result_error_message_transaction_expired',
      isBlocking: true,
    };
  }

  if (
    reasonIncludes(normalizedReason, [
      'slippage',
      'too little received',
      'insufficient output amount',
    ])
  ) {
    return {
      message: 'evm_transaction_result_error_message_slippage',
      isBlocking: true,
    };
  }

  if (
    reasonIncludes(normalizedReason, [
      'user rejected',
      'user denied',
      'rejected the request',
      'denied transaction signature',
      'denied transaction',
      'rejected transaction',
    ])
  ) {
    return {
      message: 'evm_transaction_result_error_message_user_rejected',
    };
  }

  if (reasonIncludes(normalizedReason, ['execution reverted'])) {
    return {
      message: 'evm_transaction_result_error_message_execution_reverted',
      isBlocking: true,
    };
  }

  return {
    message: 'evm_transaction_result_error_message_call_exception',
    isBlocking: true,
  };
};

const getErrorMessage = (
  code?: string,
  reason?: string,
  shortMessage?: string,
  fallbackMessage?: string,
): EtherRPCCustomError => {
  switch (code) {
    case 'REPLACEMENT_UNDERPRICED':
      return { message: 'evm_transaction_result_error_message_underpriced' };
    case 'NONCE_EXPIRED':
      return { message: 'evm_transaction_result_error_message_nonce_expired' };
    case 'INSUFFICIENT_FUNDS':
      return {
        message: 'evm_transaction_result_error_message_insufficient_funds',
        isBlocking: true,
      };
    case 'ACTION_REJECTED':
    case 'CANCELLED':
      return {
        message: 'evm_transaction_result_error_message_user_rejected',
      };
    case 'TRANSACTION_REPLACED':
      return {
        message: 'evm_transaction_result_error_message_transaction_replaced',
      };
    case 'NETWORK_ERROR':
    case 'SERVER_ERROR':
    case 'TIMEOUT':
    case 'UNKNOWN_ERROR':
      return { message: 'evm_transaction_result_error_message_network' };
    case 'BAD_DATA':
    case 'BUFFER_OVERRUN':
      return {
        message: 'evm_transaction_result_error_message_bad_data',
        isBlocking: true,
      };
    case 'NUMERIC_FAULT':
    case 'INVALID_ARGUMENT':
    case 'MISSING_ARGUMENT':
    case 'UNEXPECTED_ARGUMENT':
    case 'VALUE_MISMATCH':
      return {
        message: 'evm_transaction_result_error_message_invalid_parameters',
        isBlocking: true,
      };
    case 'UNSUPPORTED_OPERATION':
    case 'NOT_IMPLEMENTED':
    case 'UNCONFIGURED_NAME':
    case 'OFFCHAIN_FAULT':
      return {
        message: 'evm_transaction_result_error_message_unsupported_operation',
        isBlocking: true,
      };
    case 'CALL_EXCEPTION':
      return getCallExceptionMessage(reason, shortMessage, fallbackMessage);
    default:
      return { message: 'evm_transaction_result_unknown_error' };
  }
};

export const EthersUtils = {
  getProvider,
  getGasLimit,
  getErrorMessage,
  setProvider,
};
