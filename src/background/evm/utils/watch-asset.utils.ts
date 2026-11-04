import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { handleEvmError } from '@background/evm/requests/logic/handle-evm-error.logic';
import { getPendingRequestMessageOptions } from '@background/multichain/pending-request.interface';
import {
  EvmRequest,
  ProviderRpcErrorList,
} from '@interfaces/evm-provider.interface';
import { PendingRequestSource } from '@interfaces/pending-request.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { ethers } from 'ethers';
import { CommunicationUtils } from 'src/utils/communication.utils';
import { ImageUrlUtils } from 'src/utils/image-url.utils';

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
    (typeof params.options.image !== 'string' ||
      !ImageUrlUtils.getSafeImageUrl(params.options.image))
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

const getWatchAssetAddress = (request: EvmRequest) => {
  const options = (
    request.params?.[0] as { options?: { address?: unknown } } | undefined
  )?.options;
  return typeof options?.address === 'string' ? options.address : undefined;
};

const isTokenAlreadyWatched = async (chain: EvmChain, request: EvmRequest) => {
  const address = getWatchAssetAddress(request);
  if (!address) {
    return false;
  }

  const customTokens = await EvmTokensUtils.getCustomTokens(chain, '');
  return customTokens.some(
    (token) =>
      token.type === EVMSmartContractType.ERC20 &&
      token.address.toLowerCase() === address.toLowerCase(),
  );
};

const acceptWatchAssetRequest = async (
  requestHandler: EvmRequestHandler,
  tab: number,
  request: EvmRequest,
  origin: string,
  source?: PendingRequestSource,
) => {
  await requestHandler.removeRequestByLocator({
    requestId: request.request_id,
    tab,
    origin,
    frameId: source?.frameId,
    documentId: source?.documentId,
  });
  CommunicationUtils.tabsSendMessage(
    tab,
    {
      command: BackgroundCommand.SEND_EVM_RESPONSE,
      value: {
        requestId: request.request_id,
        result: true,
      },
    },
    getPendingRequestMessageOptions(source),
  );
};

const rejectWatchAssetRequest = async (
  requestHandler: EvmRequestHandler,
  tab: number,
  request: EvmRequest,
  origin: string,
  message: string,
  source?: PendingRequestSource,
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
    origin,
    true,
    source,
  );
};

export const EvmWatchAssetUtils = {
  rejectWatchAssetRequest,
  acceptWatchAssetRequest,
  isTokenAlreadyWatched,
  isValidWatchAssetRequest,
  isWatchAssetRequest,
  WATCH_ASSET_INVALID_PARAMS_ERROR,
};
