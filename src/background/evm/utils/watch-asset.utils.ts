import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { handleEvmError } from '@background/evm/requests/logic/handle-evm-error.logic';
import {
  EvmRequest,
  ProviderRpcErrorList,
} from '@interfaces/evm-provider.interface';
import { ethers } from 'ethers';

const WATCH_ASSET_CUSTOM_CHAIN_ERROR =
  'wallet_watchAsset is only supported on custom chains in Keychain';

const WATCH_ASSET_INVALID_PARAMS_ERROR =
  'Invalid wallet_watchAsset parameters. Keychain only supports ERC20 assets';

const isWatchAssetRequest = (request: EvmRequest) =>
  request.method === EvmRequestMethod.WALLET_WATCH_ASSETS ||
  request.method === EvmRequestMethod.MM_WATCH_ASSET;

const isValidWatchAssetRequest = (request: EvmRequest) => {
  const params = request.params?.[0] as
    | {
        type?: unknown;
        options?: {
          address?: unknown;
          symbol?: unknown;
          decimals?: unknown;
          image?: unknown;
        };
      }
    | undefined;

  if (
    !params ||
    params.type !== 'ERC20' ||
    !params.options ||
    typeof params.options.address !== 'string' ||
    !ethers.isAddress(params.options.address)
  ) {
    return false;
  }

  if (
    params.options.symbol !== undefined &&
    typeof params.options.symbol !== 'string'
  ) {
    return false;
  }

  if (
    params.options.image !== undefined &&
    typeof params.options.image !== 'string'
  ) {
    return false;
  }

  if (params.options.decimals === undefined) {
    return true;
  }

  return (
    typeof params.options.decimals === 'number' &&
    Number.isInteger(params.options.decimals) &&
    params.options.decimals >= 0 &&
    params.options.decimals <= 255
  );
};

const rejectWatchAssetRequest = async (
  requestHandler: EvmRequestHandler,
  tab: number,
  request: EvmRequest,
  message: string,
) => {
  await handleEvmError(
    requestHandler,
    tab,
    request,
    {
      ...ProviderRpcErrorList.invalidMethodParams,
      message,
    },
    message,
    [],
    true,
  );
};

export const EvmWatchAssetUtils = {
  rejectWatchAssetRequest,
  isValidWatchAssetRequest,
  isWatchAssetRequest,
  WATCH_ASSET_CUSTOM_CHAIN_ERROR,
  WATCH_ASSET_INVALID_PARAMS_ERROR,
};
