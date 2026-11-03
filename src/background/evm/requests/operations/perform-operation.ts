import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmCallBatchModule } from '@background/evm/evm-call-batch.module';
import { EvmTransactionSubmissionModule } from '@background/evm/evm-transaction-submission.module';
import {
  EvmRequestHandler,
  EvmRequestLocator,
} from '@background/evm/requests/evm-request-handler';
import { EvmRequestAccountUtils } from '@background/evm/requests/evm-request-account.utils';
import { handleEvmError } from '@background/evm/requests/logic/handle-evm-error.logic';
import { resolveRequestChainId } from '@background/evm/requests/logic/resolve-request-chain-id.logic';
import {
  addWhitelistedChainForOrigin,
  setChainIdForOrigin,
} from '@background/evm/evm-provider-state.utils';
import {
  getRequestHandlers,
  willCloseDialogWindowAfterRemovingRequest,
} from '@background/multichain/dialog-request.utils';
import { decryptMessage } from '@background/evm/requests/operations/ops/decrypt-message';
import { getEncryptionKey } from '@background/evm/requests/operations/ops/get-encryption-key';
import { personalSign } from '@background/evm/requests/operations/ops/personal-sign';
import { sendEvmTransaction } from '@background/evm/requests/operations/ops/send-transaction';
import { signData } from '@background/evm/requests/operations/ops/sign-data';
import {
  EvmRequest,
  getEvmProviderRpcFullError,
  getErrorFromEtherJS,
} from '@interfaces/evm-provider.interface';
import { SignTypedDataVersion } from '@metamask/eth-sig-util';
import Decimal from 'decimal.js';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmGasPriceErrorUtils } from '@popup/evm/utils/evm-gas-price-error.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import {
  DIALOG_FEEDBACK_DISPLAY_MS,
  delayMs,
} from '@reference-data/dialog-feedback.constants';
import { KeychainError } from 'src/keychain-error';
import { CommunicationUtils } from 'src/utils/communication.utils';
import Logger from 'src/utils/logger.utils';
import { PendingRequestSource } from '@interfaces/pending-request.interface';
import { getPendingRequestMessageOptions } from '@background/multichain/pending-request.interface';

const getMinimumGasPriceInGwei = (error: unknown): string | undefined => {
  const minimumGasPriceWei =
    EvmGasPriceErrorUtils.getMinimumGasPriceWeiFromError(error);
  if (!minimumGasPriceWei) {
    return undefined;
  }
  return new Decimal(minimumGasPriceWei).div(1_000_000_000).toString();
};

const isLegacyCustomChainTransaction = (
  request: EvmRequest,
  chain: EvmChain,
): boolean => {
  const transaction = request.params?.[0] as { type?: EvmTransactionType };
  const transactionType = transaction?.type ?? chain.defaultTransactionType;
  return (
    chain.isCustom === true && transactionType === EvmTransactionType.LEGACY
  );
};

const handleRecoverableCustomGasPriceError = async (
  error: unknown,
  request: EvmRequest,
  tab: number,
  source?: PendingRequestSource,
) => {
  const chainId = resolveRequestChainId(request);
  if (
    !chainId ||
    !EvmGasPriceErrorUtils.isInsufficientGasPriceError(error)
  ) {
    return false;
  }

  const chain = await ChainUtils.getChain<EvmChain>(chainId);
  if (!chain || !isLegacyCustomChainTransaction(request, chain)) {
    return false;
  }

  const minimumGasPriceInGwei = getMinimumGasPriceInGwei(error);
  const updatedChain = minimumGasPriceInGwei
    ? await ChainUtils.updateCustomChainMinGasPrice(
        chain.chainId,
        minimumGasPriceInGwei,
      )
    : undefined;

  CommunicationUtils.runtimeSendMessage({
    command: DialogCommand.UPDATE_EVM_GAS_FEES,
    msg: {
      request_id: request.request_id,
      tab,
      chainId: chain.chainId,
      minGasPriceInGwei:
        updatedChain?.customMinGasPriceInGwei ?? minimumGasPriceInGwei,
      message: 'evm_gas_fee_warning_updated_after_insufficient_price',
    },
    ...(source ? { requestSource: source } : {}),
  });
  return true;
};

export const performEvmOperation = async (
  requestHandler: EvmRequestHandler,
  request: EvmRequest,
  tab: number,
  domain: string,
  origin: string,
  extraData: any,
  source?: PendingRequestSource,
) => {
  let message = null;
  let result = null;
  const locator: EvmRequestLocator = {
    requestId: request.request_id,
    tab,
    origin,
    frameId: source?.frameId,
    documentId: source?.documentId,
  };

  Logger.info('Perform evm operation');

  if (
    EvmRequestAccountUtils.requiresAccountAuthorization(request) &&
    !(await EvmRequestAccountUtils.isRequestedAccountAuthorizedForOrigin(
      request,
      origin,
    ))
  ) {
    const providerError = getEvmProviderRpcFullError('unauthorized');
    await handleEvmError(
      requestHandler,
      tab,
      request,
      providerError,
      providerError.message,
      [],
      origin,
      false,
      source,
    );
    return;
  }

  try {
    switch (request.method) {
      case EvmRequestMethod.WALLET_SEND_CALLS:
        result = await EvmCallBatchModule.submit(
          request,
          locator,
          extraData?.from,
          extraData?.fees,
        );
        break;
      case EvmRequestMethod.WALLET_SHOW_CALLS_STATUS:
        result = null;
        break;
      case EvmRequestMethod.ETH_SIGN_DATA_4: {
        message = await signData(
          requestHandler,
          request,
          locator,
          SignTypedDataVersion.V4,
        );
        result = message?.msg.result;
        break;
      }
      case EvmRequestMethod.ETH_SIGN_DATA_3: {
        message = await signData(
          requestHandler,
          request,
          locator,
          SignTypedDataVersion.V3,
        );
        result = message?.msg.result;
        break;
      }
      case EvmRequestMethod.ETH_SIGN_DATA: {
        message = await signData(
          requestHandler,
          request,
          locator,
          SignTypedDataVersion.V1,
        );
        result = message?.msg.result;
        break;
      }
      case EvmRequestMethod.PERSONAL_SIGN: {
        message = await personalSign(requestHandler, request, locator);
        result = message?.msg.result;
        break;
      }
      case EvmRequestMethod.GET_ENCRYPTION_KEY: {
        message = await getEncryptionKey(requestHandler, request, locator);
        result = message?.msg.result;
        break;
      }
      case EvmRequestMethod.ETH_DECRYPT: {
        message = await decryptMessage(requestHandler, request, locator);
        result = message?.msg.result;
        break;
      }
      case EvmRequestMethod.SEND_TRANSACTION: {
        message = await sendEvmTransaction(
          requestHandler,
          request,
          locator,
          extraData,
        );
        result = message?.msg.result;
        break;
      }
      case EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN: {
        const requestedChainId = resolveRequestChainId(request);
        if (!requestedChainId) {
          throw new Error('Missing chainId');
        }
        await addWhitelistedChainForOrigin(origin, requestedChainId);
        await setChainIdForOrigin(origin, requestedChainId, { tabId: tab });
        result = null;
        break;
      }
    }
    CommunicationUtils.tabsSendMessage(
      tab,
      {
        command: BackgroundCommand.SEND_EVM_RESPONSE,
        value: { requestId: request.request_id, result: result },
      },
      getPendingRequestMessageOptions(source),
    );
    if (message) {
      await CommunicationUtils.runtimeSendMessage(
        source ? { ...message, requestSource: source } : message,
      );
      const handlers = await getRequestHandlers();
      if (
        await willCloseDialogWindowAfterRemovingRequest(
          handlers,
          request.request_id,
          tab,
          origin,
        )
      ) {
        await delayMs(DIALOG_FEEDBACK_DISPLAY_MS);
      }
    }
    await requestHandler.removeRequestByLocator(locator);
    if (request.method === EvmRequestMethod.WALLET_SEND_CALLS) {
      void EvmTransactionSubmissionModule.reconcile().catch(() =>
        Logger.warn('EVM batch submission recovery failed'),
      );
    }
  } catch (err) {
    const error = err as any;
    if (
      await handleRecoverableCustomGasPriceError(
        error,
        request,
        tab,
        source,
      )
    ) {
      return;
    }

    const etherJSError =
      request.method === EvmRequestMethod.WALLET_SEND_CALLS &&
      typeof error.code === 'number'
        ? { code: error.code, message: error.message }
        : getErrorFromEtherJS(error.code);
    const errorMessage =
      error instanceof KeychainError ? error.message : etherJSError.message;
    const errorMessageParams =
      error instanceof KeychainError ? error.messageParams ?? [] : [];
    Logger.warn(`EVM operation failed: ${etherJSError.message}`);
    await handleEvmError(
      requestHandler,
      tab,
      request,
      etherJSError,
      errorMessage,
      errorMessageParams,
      origin,
      false,
      source,
    );
  }
};
