import { EvmCallBatchModule } from '@background/evm/evm-call-batch.module';
import { EvmIncomingTransactionsModule } from '@background/evm/evm-incoming-transactions.module';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { initializeEvmProviderRegistration } from '@background/evm/evm-provider-registration';
import {
  addWhitelistedChainForOrigin,
  getAccountsForOrigin,
  getChainIdForOrigin,
  persistEvmDappLogoForDomain,
  setAccountsForOrigin,
  setChainIdForOrigin,
} from '@background/evm/evm-provider-state.utils';
import { EvmTransactionSubmissionModule } from '@background/evm/evm-transaction-submission.module';
import {
  EvmRequestHandler,
  EvmRequestLocator,
} from '@background/evm/requests/evm-request-handler';
import { initEvmRequestHandler } from '@background/evm/requests/init';
import { performEvmOperation } from '@background/evm/requests/operations/perform-operation';
import MkModule from '@background/hive/modules/mk.module';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import {
  getPendingRequestMessageOptions,
  getPendingRequestSource,
} from '@background/multichain/pending-request.interface';
import {
  EvmEventName,
  KeychainEvmRequestWrapper,
  ProviderRpcError,
  ProviderRpcErrorList,
  RoutedEvmEvent,
} from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import { EvmPendingTransactionsNotifications } from '@popup/evm/utils/evm-pending-transactions-notifications.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { TransactionResponse } from 'ethers';
import { validateEvmRequest } from 'src/content-scripts/evm/evm-request-validation';
import {
  getOriginFromMessageSender,
  getOriginFromUrl,
} from 'src/utils/browser-origin.utils';
import { CommunicationUtils } from 'src/utils/communication.utils';
import { EvmSubmissionClientUtils } from 'src/utils/evm/evm-submission-client.utils';
import Logger from 'src/utils/logger.utils';
import { RuntimeMessageSenderUtils } from 'src/utils/runtime-message-sender.utils';

let pendingRequestRehydration: Promise<void> = Promise.resolve();
const ENS_HOSTNAME_PATTERN = /^(?:[a-z0-9-]+\.)+eth$/i;
const CONTENT_SCRIPT_COMMANDS: ReadonlySet<BackgroundMessage['command']> =
  new Set([
    BackgroundCommand.SEND_EVM_INITIALIZE_PROVIDER_REQUEST,
    BackgroundCommand.SEND_EVM_REQUEST,
    BackgroundCommand.SEND_BACK_CHAIN_FROM_PROVIDER,
  ]);

const handleEnsNavigationError = (
  details: chrome.webNavigation.WebNavigationFramedErrorCallbackDetails,
): void => {
  if (details.frameId !== 0 || details.tabId < 0) {
    return;
  }

  try {
    const { hostname, protocol } = new URL(details.url);
    if (
      (protocol !== 'http:' && protocol !== 'https:') ||
      !ENS_HOSTNAME_PATTERN.test(hostname)
    ) {
      return;
    }

    void chrome.tabs.update(details.tabId, {
      url: `https://app.ens.domains/${hostname}`,
    });
  } catch {
    return;
  }
};
const executingBatches = new Set<string>();

const initializeServiceWorker = async () => {
  Object.assign(global, { contextType: 'service_worker' });

  Logger.info('Starting EVM service worker');
  pendingRequestRehydration = EvmRequestHandler.getFromLocalStorage()
    .then((requestHandler) => requestHandler.rehydrateNonInteractiveRequests())
    .catch((error) => {
      Logger.error('Unable to rehydrate pending EVM requests', error);
    });
  initializeEvmProviderRegistration();
  EvmIncomingTransactionsModule.start();
  EvmPendingTransactionsNotifications.registerClickListener();
  void EvmTransactionsUtils.rehydratePendingTransactions();
  EvmTransactionSubmissionModule.initialize(async (transaction, chainId) => {
    const chain = await ChainUtils.getChain<EvmChain>(chainId);
    await EvmTransactionsUtils.addPendingTransaction(
      transaction.from,
      transaction,
      chain,
    );
  });

  chrome.webNavigation.onErrorOccurred.addListener(handleEnsNavigationError, {
    url: [{ schemes: ['http', 'https'], hostSuffix: '.eth' }],
  });
};

const sendEvmEventToTab = (tabId: number, event: RoutedEvmEvent) => {
  CommunicationUtils.tabsSendMessage(tabId, {
    command: BackgroundCommand.SEND_EVM_EVENT_TO_CONTENT_SCRIPT,
    value: event,
  });
};

const isOriginMatch = (tabUrl: string | undefined, origin: string) => {
  if (!tabUrl) return false;

  try {
    return getOriginFromUrl(tabUrl) === origin;
  } catch (error) {
    return false;
  }
};

const routeEvmEvent = (event: RoutedEvmEvent) => {
  switch (event.scope.kind) {
    case 'tab':
      sendEvmEventToTab(event.scope.tabId, event);
      break;
    case 'origin':
      const targetOrigin = event.scope.origin;
      chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
          if (tab.id && isOriginMatch(tab.url, targetOrigin)) {
            sendEvmEventToTab(tab.id, event);
          }
        }
      });
      break;
    case 'global':
      chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
          if (tab.id) {
            sendEvmEventToTab(tab.id, event);
          }
        }
      });
      break;
  }
};

const registerApprovedEvmChain = async (requestedChain: EvmChain) => {
  if (!requestedChain?.chainId || requestedChain.isCustom === true) {
    return;
  }

  try {
    await EvmLightNodeUtils.registerLocalAddresses(requestedChain.chainId);
  } catch (error) {
    Logger.error('Error while registering EVM address with light node', error);
  }
};

const chromeMessageHandler = async (
  backgroundMessage: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
  sendResp: (response?: any) => void,
) => {
  if (
    !CONTENT_SCRIPT_COMMANDS.has(backgroundMessage.command) &&
    !RuntimeMessageSenderUtils.isInternalExtensionSender(sender)
  ) {
    return;
  }

  await pendingRequestRehydration;
  Logger.log(
    'Background message evm service worker',
    backgroundMessage.command,
  );

  switch (backgroundMessage.command) {
    case BackgroundCommand.SEND_EVM_INITIALIZE_PROVIDER_REQUEST: {
      const origin = getOriginFromMessageSender(sender);
      if (sender?.tab?.id !== undefined && origin) {
        sendEvmEventToTab(sender.tab!.id!, {
          eventType: EvmEventName.INITIALIZE_PROVIDER_RESPONSE,
          scope: {
            kind: 'origin',
            origin,
            tabId: sender.tab!.id!,
          },
          args: {
            chainId: await EvmChainUtils.getLastEvmChainIdForOrigin(origin),
            accounts: await getAccountsForOrigin(origin),
          },
        });
      }
      break;
    }
    case BackgroundCommand.SET_EVM_PROVIDER_CHAIN: {
      const { origin, chainId, tabId } = backgroundMessage.value ?? {};
      if (typeof origin !== 'string' || typeof chainId !== 'string') {
        break;
      }

      await setChainIdForOrigin(
        origin,
        chainId,
        typeof tabId === 'number' ? { tabId } : {},
      );
      break;
    }
    case BackgroundCommand.SEND_EVM_REQUEST: {
      const evmMessage = backgroundMessage as KeychainEvmRequestWrapper;
      try {
        evmMessage.request = validateEvmRequest(evmMessage.request);
        evmMessage.request_id = evmMessage.request.request_id;
      } catch (error) {
        if (sender.tab?.id !== undefined) {
          const requestId = evmMessage.request?.request_id;
          const source = getPendingRequestSource(sender) ?? undefined;
          CommunicationUtils.tabsSendMessage(
            sender.tab.id,
            {
              command: BackgroundCommand.SEND_EVM_ERROR,
              value: {
                requestId,
                request_id: requestId,
                error,
              },
            },
            getPendingRequestMessageOptions(source),
          );
        }
        break;
      }

      let requestHandler = await EvmRequestHandler.getFromLocalStorage();
      if (!requestHandler) {
        requestHandler = new EvmRequestHandler();
      }
      await requestHandler.sendRequest(sender, evmMessage);

      break;
    }
    case BackgroundCommand.SEND_EVM_EVENT: {
      routeEvmEvent(backgroundMessage.value as RoutedEvmEvent);
      break;
    }
    case BackgroundCommand.UNLOCK_FROM_DIALOG: {
      const { mk, data, tab, request_id } = backgroundMessage.value;

      if (data.command === DialogCommand.UNLOCK_EVM) {
        const login = await MkModule.login(mk);
        if (login) {
          MkModule.saveMk(mk);
          await initEvmRequestHandler(
            data.msg.data,
            tab,
            data.dappInfo,
            await EvmRequestHandler.getFromLocalStorage(),
          );
        } else {
          CommunicationUtils.runtimeSendMessage({
            ...data,
            msg: { ...data.msg, wrongMk: true },
            command: DialogCommand.UNLOCK_EVM,
          });
        }
      }

      break;
    }
    case BackgroundCommand.SEND_EVM_RESPONSE_TO_SW: {
      const message = backgroundMessage.value;
      const requestId = message.requestId ?? message.request_id;
      const { tab, origin, requestSource } = message;
      if (
        requestId === null ||
        requestId === undefined ||
        tab === null ||
        tab === undefined ||
        !origin
      ) {
        break;
      }
      const locator: EvmRequestLocator = {
        requestId,
        tab,
        origin,
        frameId: requestSource?.frameId,
        documentId: requestSource?.documentId,
      };
      const requestHandler = await EvmRequestHandler.getFromLocalStorage();
      const requestData = requestHandler?.getRequestDataByLocator(locator);
      if (requestData?.tab === null || requestData?.tab === undefined) {
        break;
      }

      if (
        requestData?.dappInfo?.origin &&
        requestData.request &&
        message.providerState?.accounts &&
        [
          EvmRequestMethod.REQUEST_ACCOUNTS,
          EvmRequestMethod.WALLET_REQUEST_PERMISSIONS,
        ].includes(requestData.request.method)
      ) {
        const accounts = await setAccountsForOrigin(
          requestData.dappInfo.origin,
          message.providerState.accounts,
        );
        await addWhitelistedChainForOrigin(
          requestData.dappInfo.origin,
          requestData.request.chainId ??
            (await getChainIdForOrigin(requestData.dappInfo.origin)),
        );
        await persistEvmDappLogoForDomain(
          requestData.dappInfo,
          accounts.length,
        );
      }

      await requestHandler.removeRequestByLocator(locator);

      const responseMessage = {
        command: BackgroundCommand.SEND_EVM_RESPONSE,
        value: {
          requestId,
          result: message.result,
        },
      } as BackgroundMessage;
      await CommunicationUtils.tabsSendMessage(
        requestData.tab,
        responseMessage,
        getPendingRequestMessageOptions(requestData.dappInfo?.requestSource),
      );

      break;
    }
    case BackgroundCommand.ACCEPT_EVM_TRANSACTION:
      const { request, tab, domain, origin, extraData, requestSource } =
        backgroundMessage.value;
      if (!origin) {
        break;
      }
      const requestHandler = await EvmRequestHandler.getFromLocalStorage();
      const locator: EvmRequestLocator = {
        requestId: request.request_id,
        tab,
        origin,
        frameId: requestSource?.frameId,
        documentId: requestSource?.documentId,
      };
      const requestData = requestHandler.getRequestDataByLocator(locator);
      if (!requestData?.request) {
        Logger.warn('Cannot perform EVM operation: pending request not found');
        break;
      }
      const batchExecutionKey = JSON.stringify(locator);
      if (requestData.request.method === EvmRequestMethod.WALLET_SEND_CALLS) {
        if (executingBatches.has(batchExecutionKey)) break;
        executingBatches.add(batchExecutionKey);
      }
      try {
        await performEvmOperation(
          requestHandler,
          requestData.request,
          tab,
          requestData.dappInfo?.domain ?? domain,
          origin,
          extraData,
          requestData.dappInfo?.requestSource,
        );
      } finally {
        executingBatches.delete(batchExecutionKey);
      }

      break;

    case BackgroundCommand.REJECT_EVM_TRANSACTION: {
      const { request, tab, domain, origin, requestSource } =
        backgroundMessage.value;
      if (!origin) {
        break;
      }
      const requestHandler = await EvmRequestHandler.getFromLocalStorage();
      const rejectionMessage = {
        command: BackgroundCommand.SEND_EVM_ERROR,
        value: {
          requestId: request.request_id,
          error: ProviderRpcErrorList.userReject as ProviderRpcError,
        },
      } as BackgroundMessage;
      await CommunicationUtils.tabsSendMessage(
        tab,
        rejectionMessage,
        getPendingRequestMessageOptions(requestSource),
      );
      await requestHandler.removeRequestByLocator({
        requestId: request.request_id,
        tab,
        origin,
        frameId: requestSource?.frameId,
        documentId: requestSource?.documentId,
      });
      break;
    }
    case BackgroundCommand.GET_CHAIN_FROM_PROVIDER: {
      // Query the active tab only to avoid broadcasting the bootstrap request
      // across every provider-enabled page.
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const [activeTab] = tabs;
        if (!activeTab?.id) {
          return;
        }

        CommunicationUtils.tabsSendMessage(activeTab.id, {
          command: BackgroundCommand.SEND_EVM_EVENT_TO_CONTENT_SCRIPT,
          value: { eventType: EvmEventName.GET_CHAIN_FROM_PROVIDER },
        });
      });
      break;
    }
    case BackgroundCommand.SEND_BACK_CHAIN_FROM_PROVIDER: {
      // Content scripts already publish this extension-wide runtime message.
      // Forwarding it from the service worker loops the same command back here.
      break;
    }
    case BackgroundCommand.WAIT_FOR_EVM_TRANSACTION_CONFIRMATION: {
      const value = backgroundMessage.value;
      const transactionResponse = new TransactionResponse(
        value.transactionResponse,
        await EthersUtils.getProvider(value.chain as EvmChain),
      );
      EvmPendingTransactionsNotifications.waitForTransaction(
        transactionResponse,
      );
      break;
    }
    case BackgroundCommand.ACCEPT_ADD_EVM_CHAIN: {
      const { request, tab, dappInfo, requestedChain } =
        backgroundMessage.value;

      await ChainUtils.addChainToSetupChains(requestedChain);
      await registerApprovedEvmChain(requestedChain);

      await initEvmRequestHandler(
        request,
        tab,
        dappInfo,
        await EvmRequestHandler.getFromLocalStorage(),
      );
      break;
    }
    case BackgroundCommand.ACCEPT_ADD_CUSTOM_EVM_CHAIN: {
      const { request, tab, dappInfo, requestedChain } =
        backgroundMessage.value as {
          request: KeychainEvmRequestWrapper['request'];
          tab: number;
          dappInfo: KeychainEvmRequestWrapper['dappInfo'];
          requestedChain: EvmChain;
        };
      const requestHandler = await EvmRequestHandler.getFromLocalStorage();

      await ChainUtils.addCustomChain(requestedChain);
      if (requestedChain.rpcs.length > 0) {
        await EvmRpcUtils.setActiveRpc(requestedChain.rpcs[0], requestedChain);
      }
      await requestHandler?.setRequestDialogByLocator(
        {
          requestId: request.request_id,
          tab,
          origin: dappInfo.origin,
          frameId: dappInfo.requestSource?.frameId,
          documentId: dappInfo.requestSource?.documentId,
        },
        undefined,
        undefined,
      );
      await initEvmRequestHandler(request, tab, dappInfo, requestHandler);
      break;
    }
  }
};

const previewEvmDecryptMessage = async (
  locator: EvmRequestLocator,
): Promise<string> => {
  const requestHandler = await EvmRequestHandler.getFromLocalStorage();
  if (!requestHandler) {
    throw new Error('No request handler');
  }
  const requestData = requestHandler.getRequestDataByLocator(locator);
  const request = requestData?.request;
  const encryptedMessage = request?.params?.[0];
  const accountAddress = request?.params?.[1];
  if (
    typeof encryptedMessage !== 'string' ||
    typeof accountAddress !== 'string'
  ) {
    throw new Error('Invalid decrypt request');
  }
  const account = requestHandler.accounts.find((account: EvmAccount) => {
    return (
      account.wallet.address.toLowerCase() === accountAddress.toLowerCase()
    );
  });
  if (!account) {
    throw new Error('Account not found');
  }
  return EvmRequestsUtils.decryptMessage(account, encryptedMessage);
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (RuntimeMessageSenderUtils.isVaultRuntimeMessage(message)) {
    return false;
  }

  const isExtensionPage =
    sender.id === chrome.runtime.id &&
    !!sender.url &&
    sender.url.startsWith(chrome.runtime.getURL(''));
  if (
    [
      BackgroundCommand.EVM_TRANSACTION_SUBMISSION,
      BackgroundCommand.PREVIEW_EVM_CALLS,
      BackgroundCommand.GET_EVM_CALLS_STATUS,
    ].includes(message?.command)
  ) {
    if (!isExtensionPage) {
      sendResponse({
        success: false,
        error: { code: 4100, message: 'Extension page required' },
      });
      return false;
    }
    void (async () => {
      await pendingRequestRehydration;
      if (message.command === BackgroundCommand.EVM_TRANSACTION_SUBMISSION) {
        return EvmSubmissionClientUtils.execute(message.value);
      }
      const handler = await EvmRequestHandler.getFromLocalStorage();
      const record = handler.getRequestDataByLocator(message.value.locator);
      if (!record?.request || !record.dappInfo)
        throw { code: 4100, message: 'Pending request not found' };
      const locator = handler.getRequestLocator(record)!;
      if (
        message.command === BackgroundCommand.PREVIEW_EVM_CALLS &&
        record.request.method === EvmRequestMethod.WALLET_SEND_CALLS
      ) {
        const accounts = await EvmCallBatchModule.getEligibleAccounts(
          record.dappInfo.origin,
        );
        const addresses = accounts.map((account) => account.wallet.address);
        try {
          const preview = await EvmCallBatchModule.prepare(
            record.request,
            locator,
            message.value.from,
          );
          return { preview, addresses };
        } catch {
          return { addresses };
        }
      }
      if (
        message.command === BackgroundCommand.GET_EVM_CALLS_STATUS &&
        record.request.method === EvmRequestMethod.WALLET_SHOW_CALLS_STATUS
      ) {
        return EvmTransactionSubmissionModule.getStatus(
          record.request.params[0],
          record.dappInfo.origin,
        );
      }
      throw { code: -32602, message: 'Unexpected batch request' };
    })()
      .then((result) => sendResponse({ success: true, result }))
      .catch((error) =>
        sendResponse({
          success: false,
          error: {
            code: typeof error?.code === 'number' ? error.code : -32000,
            message:
              typeof error?.message === 'string'
                ? error.message
                : 'Unable to prepare batch',
          },
        }),
      );
    return true;
  }
  if (
    message?.command === BackgroundCommand.ACCEPT_EVM_TRANSACTION &&
    !isExtensionPage
  )
    return false;
  if (
    message &&
    typeof message === 'object' &&
    (message as BackgroundMessage).command ===
      BackgroundCommand.PREVIEW_EVM_DECRYPT
  ) {
    if (!RuntimeMessageSenderUtils.isInternalExtensionSender(sender)) {
      sendResponse({ success: false, error: 'Unauthorized sender' });
      return true;
    }

    const value = (
      message as {
        value?: { request_id?: number; tab?: number; origin?: string };
      }
    ).value;
    const request_id = value?.request_id;
    if (request_id == null || value?.tab == null || !value.origin) {
      sendResponse({ success: false, error: 'Missing request locator' });
      return true;
    }
    void previewEvmDecryptMessage({
      requestId: request_id,
      tab: value.tab,
      origin: value.origin,
    })
      .then((plaintext) => sendResponse({ success: true, plaintext }))
      .catch((err) =>
        sendResponse({
          success: false,
          error: err instanceof Error ? err.message : String(err),
        }),
      );
    return true;
  }
  return chromeMessageHandler(
    message as BackgroundMessage,
    sender,
    sendResponse,
  );
});

export const EvmServiceWorker = { initializeServiceWorker };
export { handleEnsNavigationError };
