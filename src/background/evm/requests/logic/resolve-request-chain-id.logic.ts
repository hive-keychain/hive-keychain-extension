import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequest } from '@interfaces/evm-provider.interface';

type ChainParam = { chainId?: unknown };

export const resolveRequestChainId = (request: EvmRequest): string | undefined => {
  if (
    request.method === EvmRequestMethod.WALLET_ADD_ETH_CHAIN ||
    request.method === EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN
  ) {
    return (request.params?.[0] as ChainParam | undefined)?.chainId as
      | string
      | undefined;
  }

  return request.chainId;
};
