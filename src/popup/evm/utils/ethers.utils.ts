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
    return 21000;
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

const getErrorMessage = (code: string, reason: string): EtherRPCCustomError => {
  switch (code) {
    case 'REPLACEMENT_UNDERPRICED':
      return { message: 'evm_transaction_result_error_message_underpriced' };
    case 'NONCE_EXPIRED':
      return { message: 'evm_transaction_result_error_message_nonce_expired' };
    case 'CALL_EXCEPTION': {
      if (reason && reason.includes('transfer amount exceeds allowance')) {
        return {
          message: 'evm_error_message_transfer_amount_exceeds_allowance',
          isBlocking: true,
        };
      }
    }
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
