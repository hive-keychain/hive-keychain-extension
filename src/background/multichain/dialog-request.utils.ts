import {
  EvmMethodPermissionMap,
  EvmRequestMethod,
  EvmUnrestrictedMethods,
} from '@background/evm/evm-methods/evm-methods.list';
import {
  EvmRequestData,
  EvmRequestHandler,
} from '@background/evm/requests/evm-request-handler';
import {
  HiveRequestData,
  HiveRequestsHandler,
} from '@background/hive/requests/hive-request-handler';
import {
  RequestAddCustomEvmChainDialogMessage,
  SendConfirmEvmMessage,
  SendConfirmHiveMessage,
} from '@background/multichain/background-message.interface';
import { KeychainRequestTypes, RequestTransfer } from '@interfaces/keychain.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { KeysUtils } from '@popup/hive/utils/keys.utils';
import { ChainType, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { anonymousRequests, getRequiredWifType } from 'src/utils/requests.utils';
import { isWhitelisted } from 'src/utils/preferences.utils';

export type RequestHandlers = {
  hiveRequestHandler: HiveRequestsHandler;
  evmRequestHandler: EvmRequestHandler;
};

type DialogChain = 'hive' | 'evm';

export type VisibleDialogRequest =
  | {
      chain: 'hive';
      arrivalOrder: number;
      requestId: number;
      tab: number;
      data: HiveRequestData;
    }
  | {
      chain: 'evm';
      arrivalOrder: number;
      requestId: number;
      tab: number;
      data: EvmRequestData;
    };

export type CurrentDialogItem = {
  message:
    | SendConfirmHiveMessage
    | SendConfirmEvmMessage
    | RequestAddCustomEvmChainDialogMessage
    | null;
  height: number;
  visibleRequests: VisibleDialogRequest[];
};

type ConfirmDialogMessage =
  | SendConfirmHiveMessage
  | SendConfirmEvmMessage
  | RequestAddCustomEvmChainDialogMessage;

const DEFAULT_DIALOG_HEIGHT = 600;
const EVM_TRANSACTION_DIALOG_HEIGHT = 800;

export const getRequestHandlers = async (): Promise<RequestHandlers> => {
  const [hiveRequestHandler, evmRequestHandler] = await Promise.all([
    HiveRequestsHandler.getFromLocalStorage(),
    EvmRequestHandler.getFromLocalStorage(),
  ]);

  return { hiveRequestHandler, evmRequestHandler };
};

const sortVisibleRequests = (
  left: VisibleDialogRequest,
  right: VisibleDialogRequest,
) => {
  return left.arrivalOrder - right.arrivalOrder || left.requestId - right.requestId;
};

const getRequestArrivalOrder = (
  data: HiveRequestData | EvmRequestData,
  requestId: number,
) => data.arrivalOrder ?? requestId;

const hasActiveKey = (account?: LocalAccount) => !!account?.keys.active;

const hasMemoKey = (account?: LocalAccount) => !!account?.keys.memo;

export const isHiveDialogVisibleRequest = async (
  requestData: HiveRequestData,
) => {
  const request = requestData.request;
  if (!request) return false;

  if (requestData.isKeyless) return true;

  if (request.type === KeychainRequestTypes.addAccount) return true;
  if (request.type === KeychainRequestTypes.transfer) return true;
  if (anonymousRequests.includes(request.type) && !request.username) return true;

  if (
    !requestData.accounts ||
    !requestData.preferences ||
    !requestData.rpc ||
    !requestData.domain
  ) {
    return true;
  }

  const account = requestData.accounts.find((acc) => acc.name === request.username);
  if (!account) return true;

  const typeWif = getRequiredWifType(request);
  const key = account.keys[typeWif];
  if (!key) return true;

  return (
    !isWhitelisted(
      requestData.preferences,
      { ...request, key: request.key ?? typeWif },
      requestData.domain,
      requestData.rpc,
    ) || KeysUtils.requireManualConfirmation(key)
  );
};

export const isEvmDialogVisibleRequest = async (requestData: EvmRequestData) => {
  const request = requestData.request;
  if (!request) return false;

  if (EvmUnrestrictedMethods.includes(request.method)) return false;

  if (
    request.method === EvmRequestMethod.REQUEST_ACCOUNTS &&
    requestData.dappInfo?.origin
  ) {
    const hasPermission = await EvmWalletUtils.hasPermission(
      requestData.dappInfo.origin,
      EvmMethodPermissionMap[request.method]!,
    );
    return !hasPermission;
  }

  return true;
};

export const getVisibleDialogRequests = async (
  handlers?: RequestHandlers,
): Promise<VisibleDialogRequest[]> => {
  const { hiveRequestHandler, evmRequestHandler } =
    handlers ?? (await getRequestHandlers());

  const hiveRequests = (
    await Promise.all(
      hiveRequestHandler.requestsData.map(async (requestData) => {
        if (
          !requestData.request_id ||
          !requestData.tab ||
          !(await isHiveDialogVisibleRequest(requestData))
        ) {
          return null;
        }
        return {
          chain: 'hive' as DialogChain,
          arrivalOrder: getRequestArrivalOrder(
            requestData,
            requestData.request_id,
          ),
          requestId: requestData.request_id,
          tab: requestData.tab,
          data: requestData,
        };
      }),
    )
  ).filter(Boolean) as VisibleDialogRequest[];

  const evmRequests = (
    await Promise.all(
      evmRequestHandler.requestsData.map(async (requestData) => {
        if (
          !requestData.request_id ||
          !requestData.tab ||
          !(await isEvmDialogVisibleRequest(requestData))
        ) {
          return null;
        }
        return {
          chain: 'evm' as DialogChain,
          arrivalOrder: getRequestArrivalOrder(
            requestData,
            requestData.request_id,
          ),
          requestId: requestData.request_id,
          tab: requestData.tab,
          data: requestData,
        };
      }),
    )
  ).filter(Boolean) as VisibleDialogRequest[];

  return [...hiveRequests, ...evmRequests].sort(sortVisibleRequests);
};

const attachQueueMetadata = (messages: ConfirmDialogMessage[]) => {
  const baseQueue = messages.map((message) => ({
    ...message,
    queue: undefined,
    queuePosition: undefined,
    queueSize: undefined,
  }));

  return messages.map((message, index) => ({
    ...message,
    queue: baseQueue,
    queuePosition: index + 1,
    queueSize: baseQueue.length,
  }));
};

const isSameDialogMessage = (
  left: ConfirmDialogMessage,
  right: ConfirmDialogMessage,
) => {
  const getRequestId = (message: ConfirmDialogMessage) =>
    message.command === DialogCommand.REQUEST_ADD_CUSTOM_EVM_CHAIN
      ? message.msg.request.request_id
      : (message.request as any).request_id;

  return (
    left.command === right.command &&
    left.tab === right.tab &&
    getRequestId(left) === getRequestId(right)
  );
};

const buildHiveTransferMessage = (
  requestData: HiveRequestData,
  queueSize: number,
  hiveRequestHandler: HiveRequestsHandler,
): SendConfirmHiveMessage | null => {
  const request = requestData.request as RequestTransfer | undefined;
  if (!request || !requestData.tab || !requestData.domain || !requestData.rpc) {
    return null;
  }

  const activeAccounts = (requestData.accounts ?? [])
    .filter((account) => hasActiveKey(account))
    .map((account) => account.name);

  const encode = !!request.memo && request.memo.length > 0 && request.memo[0] === '#';
  const enforced = request.enforce || encode;
  const selectedAccount = request.username
    ? requestData.accounts?.find((account) => account.name === request.username)
    : undefined;

  if (
    (enforced &&
      request.username &&
      selectedAccount &&
      !hasActiveKey(selectedAccount)) ||
    (selectedAccount && encode && !hasMemoKey(selectedAccount)) ||
    activeAccounts.length === 0
  ) {
    return null;
  }

  return {
    command: DialogCommand.SEND_DIALOG_CONFIRM,
    request,
    domain: requestData.domain,
    accounts: encode || enforced ? undefined : activeAccounts,
    tab: requestData.tab,
    rpc: requestData.rpc,
    hiveEngineConfig: hiveRequestHandler.hiveEngineConfig,
    queuePosition: 1,
    queueSize,
  };
};

const buildHiveAnonymousMessage = (
  requestData: HiveRequestData,
  queueSize: number,
  hiveRequestHandler: HiveRequestsHandler,
): SendConfirmHiveMessage | null => {
  const request = requestData.request;
  if (!request || !requestData.tab || !requestData.domain || !requestData.rpc) {
    return null;
  }

  const filterKey = getRequiredWifType(request);
  const accounts = (requestData.accounts ?? [])
    .filter((account) => !!account.keys[filterKey])
    .map((account) => account.name);

  if (!accounts.length) return null;

  return {
    command: DialogCommand.SEND_DIALOG_CONFIRM,
    request,
    domain: requestData.domain,
    accounts,
    tab: requestData.tab,
    rpc: requestData.rpc,
    hiveEngineConfig: hiveRequestHandler.hiveEngineConfig,
    queuePosition: 1,
    queueSize,
  };
};

const buildHiveConfirmationMessage = (
  requestData: HiveRequestData,
  queueSize: number,
  hiveRequestHandler: HiveRequestsHandler,
): SendConfirmHiveMessage | null => {
  const request = requestData.request;
  if (!request || !requestData.tab || !requestData.domain) return null;

  if (requestData.isKeyless) return null;

  if (request.type === KeychainRequestTypes.addAccount) {
    if (!requestData.accounts || !requestData.rpc) return null;

    const alreadyRegistered = requestData.accounts?.find(
      (account) => account.name === request.username,
    );
    if (alreadyRegistered) return null;

    return {
      command: DialogCommand.SEND_DIALOG_CONFIRM,
      request,
      domain: requestData.domain,
      tab: requestData.tab,
      rpc: requestData.rpc!,
      hiveEngineConfig: hiveRequestHandler.hiveEngineConfig,
      queuePosition: 1,
      queueSize,
    };
  }

  if (request.type === KeychainRequestTypes.transfer) {
    return buildHiveTransferMessage(
      requestData,
      queueSize,
      hiveRequestHandler,
    );
  }

  if (anonymousRequests.includes(request.type) && !request.username) {
    return buildHiveAnonymousMessage(
      requestData,
      queueSize,
      hiveRequestHandler,
    );
  }

  if (
    !requestData.accounts ||
    !requestData.preferences ||
    !requestData.rpc
  ) {
    return null;
  }

  const account = requestData.accounts.find((acc) => acc.name === request.username);
  if (!account) return null;

  const typeWif = getRequiredWifType(request);
  const key = account.keys[typeWif];
  if (!key) return null;

  if (
    !isWhitelisted(
      requestData.preferences,
      { ...request, key: request.key ?? typeWif },
      requestData.domain,
      requestData.rpc,
    ) ||
    KeysUtils.requireManualConfirmation(key)
  ) {
    return {
      command: DialogCommand.SEND_DIALOG_CONFIRM,
      request: { ...request, key: request.key ?? typeWif },
      domain: requestData.domain,
      tab: requestData.tab,
      rpc: requestData.rpc,
      hiveEngineConfig: hiveRequestHandler.hiveEngineConfig,
      queuePosition: 1,
      queueSize,
    };
  }

  return null;
};

const buildEvmConfirmationMessage = async (
  requestData: EvmRequestData,
  queueSize: number,
  evmRequestHandler: EvmRequestHandler,
): Promise<SendConfirmEvmMessage | RequestAddCustomEvmChainDialogMessage | null> => {
  const request = requestData.request;
  if (!request || !requestData.tab || !requestData.dappInfo) return null;

  if (requestData.dialogCommand === DialogCommand.REQUEST_ADD_CUSTOM_EVM_CHAIN) {
    const requestedChainId =
      typeof requestData.dialogData?.requestedChainId === 'string'
        ? requestData.dialogData.requestedChainId
        : '';
    return {
      command: DialogCommand.REQUEST_ADD_CUSTOM_EVM_CHAIN,
      msg: {
        request,
        dappInfo: requestData.dappInfo,
        requestedChainId,
        initialChain: {
          chainId: requestedChainId,
        },
      },
      tab: requestData.tab,
    };
  }

  if (EvmUnrestrictedMethods.includes(request.method)) return null;

  if (
    EvmMethodPermissionMap[request.method] &&
    requestData.dappInfo.origin &&
    request.method !== EvmRequestMethod.REQUEST_ACCOUNTS
  ) {
    const hasPermission = await EvmWalletUtils.hasPermission(
      requestData.dappInfo.origin,
      EvmMethodPermissionMap[request.method]!,
    );
    if (!hasPermission) return null;
  }

  if (
    request.method === EvmRequestMethod.REQUEST_ACCOUNTS &&
    requestData.dappInfo.origin
  ) {
    const hasPermission = await EvmWalletUtils.hasPermission(
      requestData.dappInfo.origin,
      EvmMethodPermissionMap[request.method]!,
    );
    if (hasPermission) return null;
  }

  if (!evmRequestHandler.accounts.length) return null;

  if (request.chainId) {
    const setupChains = await ChainUtils.getAllSetupChainsForType<EvmChain>(
      ChainType.EVM,
    );
    if (!setupChains.find((chain) => chain.chainId === request.chainId)) {
      return null;
    }
  }

  return {
    command: DialogCommand.SEND_DIALOG_CONFIRM_EVM,
    request,
    dappInfo: requestData.dappInfo,
    tab: requestData.tab,
    accounts: evmRequestHandler.accounts,
    queuePosition: 1,
    queueSize,
  };
};

const buildVisibleQueueMessages = async (
  visibleRequests: VisibleDialogRequest[],
  loadedHandlers: RequestHandlers,
) => {
  const builtMessages = (
    await Promise.all(
      visibleRequests.map(async (visibleRequest) => {
        if (visibleRequest.chain === 'hive') {
          return buildHiveConfirmationMessage(
            visibleRequest.data,
            visibleRequests.length,
            loadedHandlers.hiveRequestHandler,
          );
        }

        return buildEvmConfirmationMessage(
          visibleRequest.data,
          visibleRequests.length,
          loadedHandlers.evmRequestHandler,
        );
      }),
    )
  ).filter(Boolean) as ConfirmDialogMessage[];

  return attachQueueMetadata(builtMessages);
};

export const getCurrentDialogItem = async (
  handlers?: RequestHandlers,
): Promise<CurrentDialogItem> => {
  const loadedHandlers = handlers ?? (await getRequestHandlers());
  const visibleRequests = await getVisibleDialogRequests(loadedHandlers);
  const currentRequest = visibleRequests[0];

  if (!currentRequest) {
    return {
      message: null,
      height: DEFAULT_DIALOG_HEIGHT,
      visibleRequests: [],
    };
  }

  if (currentRequest.chain === 'hive') {
    const currentMessage = buildHiveConfirmationMessage(
      currentRequest.data,
      visibleRequests.length,
      loadedHandlers.hiveRequestHandler,
    );
    if (!currentMessage) {
      return {
        message: null,
        height: DEFAULT_DIALOG_HEIGHT,
        visibleRequests,
      };
    }

    const queueMessages = await buildVisibleQueueMessages(
      visibleRequests,
      loadedHandlers,
    );

    return {
      message:
        queueMessages.find((message) =>
          isSameDialogMessage(message, currentMessage),
        ) ?? currentMessage,
      height: DEFAULT_DIALOG_HEIGHT,
      visibleRequests,
    };
  }

  const currentMessage = await buildEvmConfirmationMessage(
    currentRequest.data,
    visibleRequests.length,
    loadedHandlers.evmRequestHandler,
  );
  if (!currentMessage) {
    return {
      message: null,
      height: DEFAULT_DIALOG_HEIGHT,
      visibleRequests,
    };
  }

  const queueMessages = await buildVisibleQueueMessages(
    visibleRequests,
    loadedHandlers,
  );
  const request = currentRequest.data.request;
  return {
    message:
      queueMessages.find((message) =>
        isSameDialogMessage(message, currentMessage),
      ) ?? currentMessage,
    height:
      request?.method === EvmRequestMethod.SEND_TRANSACTION
        ? EVM_TRANSACTION_DIALOG_HEIGHT
        : DEFAULT_DIALOG_HEIGHT,
    visibleRequests,
  };
};
