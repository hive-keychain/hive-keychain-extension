import { getEvmLightNodeBaseUrl } from '@api/evm-light-node';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmAccountUtils } from '@popup/evm/utils/evm-account.utils';
import { LightNodeHistoryItem } from '@popup/evm/utils/evm-light-node.utils';
import { EvmSettingsUtils } from '@popup/evm/utils/evm-settings.utils';
import { EvmTokensHistoryUtils } from '@popup/evm/utils/evm-tokens-history.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import { Socket, io } from 'socket.io-client';
import { CommunicationUtils } from 'src/utils/communication.utils';
import { I18nUtils } from 'src/utils/i18n.utils';
import Logger from 'src/utils/logger.utils';
import { RuntimeMessageSenderUtils } from 'src/utils/runtime-message-sender.utils';
import VaultUtils from 'src/utils/vault.utils';

const REGISTER_ACCOUNTS_EVENT = 'register_accounts';
const INCOMING_TRANSACTION_EVENT = 'incoming_transaction';
const NOTIFICATION_ID_PREFIX = 'evm-incoming';
const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const TRANSACTION_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;
const OP_INDEX_REGEX = /^\d+$/;

type IncomingTransactionPayload = {
  chainId: number;
  address: string;
  item: LightNodeHistoryItem;
};

const REGISTRATION_ACK_TIMEOUT_MS = 10_000;

let initialized = false;
let socket: Socket | undefined;
let localAccounts: EvmAccount[] = [];
let registeredAddresses = new Set<string>();
let syncVersion = 0;
let hasLoggedSocketConnectError = false;
let hasLoggedSocketDisconnect = false;
let closingSocket = false;
let loggedSubscriptionKey = '';
let idleReason = '';

const getNotificationId = (payload: IncomingTransactionPayload) =>
  `${NOTIFICATION_ID_PREFIX}:${payload.chainId}:${payload.item.txId}:${payload.item.opIndex}`;

const getAccountNamesForAddress = (address: string) =>
  [
    ...new Set(
      localAccounts
        .filter((account) => account.wallet.address.toLowerCase() === address)
        .map((account) => EvmAccountUtils.getAccountFullname(account)),
    ),
  ].join(', ');

const formatRegisteredAddresses = () =>
  [...registeredAddresses].sort().join(', ');

const logIdle = (reason: string) => {
  if (idleReason === reason) {
    return;
  }
  idleReason = reason;
  Logger.info(`EVM incoming socket idle: ${reason}`);
};

const registerAccounts = () => {
  const addresses = [...registeredAddresses];
  socket
    ?.timeout(REGISTRATION_ACK_TIMEOUT_MS)
    .emit(
      REGISTER_ACCOUNTS_EVENT,
      { addresses },
      (
        error: Error | null,
        result?: { subscribed?: number; rejected?: number },
      ) => {
        if (error) {
          Logger.warn(
            `EVM incoming socket registration was not acknowledged: ${error.message}`,
          );
          return;
        }
        Logger.info(
          `EVM incoming socket registration acknowledged for ${addresses.length} address(es): subscribed ${result?.subscribed ?? 0}, rejected ${result?.rejected ?? 0}`,
        );
      },
    );
};

const getSocket = () => {
  if (socket) {
    return socket;
  }

  socket = io(getEvmLightNodeBaseUrl(), {
    transports: ['websocket'],
    reconnection: true,
    autoConnect: false,
  });
  socket.on('connect', () => {
    hasLoggedSocketConnectError = false;
    hasLoggedSocketDisconnect = false;
    const addresses = formatRegisteredAddresses();
    Logger.info(
      `EVM incoming socket connected to ${getEvmLightNodeBaseUrl()} for ${registeredAddresses.size} address(es): ${addresses}`,
    );
    registerAccounts();
  });
  socket.on('disconnect', (reason) => {
    if (closingSocket || hasLoggedSocketDisconnect) {
      return;
    }
    hasLoggedSocketDisconnect = true;
    Logger.info(`EVM incoming socket disconnected: ${reason}`);
  });
  socket.on(INCOMING_TRANSACTION_EVENT, (payload: unknown) => {
    void handleIncomingTransaction(payload).catch((error) => {
      Logger.warn(
        `Unable to display EVM incoming transaction notification: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    });
  });
  socket.on('connect_error', (error) => {
    if (hasLoggedSocketConnectError) {
      return;
    }
    hasLoggedSocketConnectError = true;
    Logger.warn(
      `Unable to connect to EVM incoming transaction socket: ${error.message}`,
    );
  });
  return socket;
};

const disconnect = () => {
  registeredAddresses = new Set();
  localAccounts = [];
  hasLoggedSocketConnectError = false;
  hasLoggedSocketDisconnect = false;
  loggedSubscriptionKey = '';
  closingSocket = true;
  socket?.disconnect();
  closingSocket = false;
};

const syncConnectionWithWalletState = async () => {
  const currentSyncVersion = ++syncVersion;
  try {
    const mk = await VaultUtils.getValueFromVault(VaultKey.__MK);
    if (currentSyncVersion !== syncVersion) {
      return;
    }
    if (!mk) {
      disconnect();
      logIdle('wallet is locked');
      return;
    }

    const accounts = await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
    if (currentSyncVersion !== syncVersion) {
      return;
    }
    localAccounts = accounts;
    registeredAddresses = new Set(
      localAccounts.map((account) => account.wallet.address.toLowerCase()),
    );
    if (registeredAddresses.size === 0) {
      disconnect();
      logIdle('no EVM accounts');
      return;
    }

    const subscriptionKey = formatRegisteredAddresses();
    const subscriptionChanged =
      subscriptionKey !== loggedSubscriptionKey || idleReason !== '';
    loggedSubscriptionKey = subscriptionKey;
    idleReason = '';
    const incomingSocket = getSocket();
    if (incomingSocket.connected) {
      registerAccounts();
      if (subscriptionChanged) {
        Logger.info(
          `EVM incoming socket updated subscription at ${getEvmLightNodeBaseUrl()} for ${registeredAddresses.size} address(es): ${subscriptionKey}`,
        );
      }
    } else {
      if (subscriptionChanged) {
        Logger.info(
          `EVM incoming socket connecting to ${getEvmLightNodeBaseUrl()} for ${registeredAddresses.size} address(es): ${subscriptionKey}`,
        );
      }
      incomingSocket.connect();
    }
  } catch (error) {
    if (currentSyncVersion !== syncVersion) {
      return;
    }
    disconnect();
    Logger.warn(
      `Unable to sync EVM incoming transaction subscriptions: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

const getIncomingPayloadRejectionReason = (
  payload: unknown,
): string | undefined => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return 'payload is not an object';
  }
  const value = payload as Partial<IncomingTransactionPayload>;
  if (
    typeof value.chainId !== 'number' ||
    !Number.isInteger(value.chainId) ||
    value.chainId <= 0
  ) {
    return `unexpected chainId ${JSON.stringify(value.chainId)}`;
  }
  if (
    typeof value.address !== 'string' ||
    !EVM_ADDRESS_REGEX.test(value.address)
  ) {
    return `unexpected address ${JSON.stringify(value.address)}`;
  }
  if (!value.item || typeof value.item !== 'object') {
    return 'missing history item';
  }
  if (
    typeof value.item.txId !== 'string' ||
    !TRANSACTION_HASH_REGEX.test(value.item.txId)
  ) {
    return `unexpected txId ${JSON.stringify(value.item.txId)}`;
  }
  if (
    typeof value.item.opIndex !== 'string' ||
    !OP_INDEX_REGEX.test(value.item.opIndex)
  ) {
    return `unexpected opIndex ${JSON.stringify(value.item.opIndex)}`;
  }
  if (value.item.direction !== 'IN') {
    return `direction ${JSON.stringify(value.item.direction)}`;
  }
  if (!Array.isArray(value.item.in) || !Array.isArray(value.item.out)) {
    return 'history flows are not arrays';
  }
  return undefined;
};

const isIncomingTransactionPayload = (
  payload: unknown,
): payload is IncomingTransactionPayload =>
  getIncomingPayloadRejectionReason(payload) === undefined;

const handleIncomingTransaction = async (payload: unknown) => {
  if (!isIncomingTransactionPayload(payload)) {
    Logger.warn(
      `Ignored invalid EVM incoming transaction socket payload: ${
        getIncomingPayloadRejectionReason(payload) ?? 'unknown'
      }`,
    );
    return;
  }

  const address = payload.address.toLowerCase();
  const chainId = `0x${payload.chainId.toString(16)}`;
  Logger.info(
    `EVM incoming transaction received for ${address} on chain ${payload.chainId} (${chainId}) tx ${payload.item.txId}`,
  );
  if (!registeredAddresses.has(address)) {
    Logger.info(
      `EVM incoming transaction ignored for unregistered address ${address} on chain ${chainId}`,
    );
    return;
  }
  const accountNames = getAccountNamesForAddress(address);
  if (!accountNames) {
    Logger.info(
      `EVM incoming transaction ignored because ${address} has no account name`,
    );
    return;
  }

  const chain = await ChainUtils.getChainFromDefaultChains<EvmChain>(chainId);
  if (!chain) {
    Logger.info(
      `EVM incoming transaction ignored because chain ${chainId} is not loaded`,
    );
    return;
  }
  if (!chain.blockExplorer?.url) {
    Logger.info(
      `EVM incoming transaction ignored because chain ${chain.name} (${chainId}) has no block explorer`,
    );
    return;
  }

  const visibleItem = EvmTokensHistoryUtils.getVisibleHistoryItem(
    payload.item,
    await EvmSettingsUtils.getSettings(),
  );
  if (!visibleItem) {
    Logger.info(
      `EVM incoming transaction hidden by spam or unverified-token display settings for ${address} on ${chain.name} (${chainId})`,
    );
    return;
  }

  const historyItem = await EvmTokensHistoryUtils.parseHistoryItem(
    visibleItem,
    chain,
    address,
    localAccounts,
  );
  if (!registeredAddresses.has(address)) {
    Logger.info(
      'EVM incoming transaction ignored because the wallet locked before notification',
    );
    return;
  }

  Logger.info(
    `EVM incoming transaction notification for ${accountNames} on ${chain.name} (${chainId}) ${payload.item.txId}`,
  );
  void CommunicationUtils.runtimeSendMessage({
    command: BackgroundCommand.EVM_INCOMING_TRANSACTION,
    value: {
      chainId,
      address,
      txId: payload.item.txId,
    },
  });

  chrome.notifications.create(
    getNotificationId(payload),
    {
      type: 'basic',
      iconUrl: '/assets/images/iconhive.png',
      title: I18nUtils.getMessage(
        'evm_incoming_transaction_notification_title',
        [accountNames, chain.name],
      ),
      message: historyItem.label,
      priority: 0,
    },
    () => {
      if (chrome.runtime.lastError) {
        Logger.warn(
          `Unable to display EVM incoming transaction notification: ${chrome.runtime.lastError.message}`,
        );
      }
    },
  );
};

const onRuntimeMessage = (
  message: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
) => {
  if (!RuntimeMessageSenderUtils.isInternalExtensionSender(sender)) {
    return;
  }
  if (
    message.command === BackgroundCommand.EVM_WALLET_LOCK_STATE_CHANGED ||
    message.command === BackgroundCommand.VAULT_LOADED
  ) {
    void syncConnectionWithWalletState();
  }
};

const onStorageChanged = (
  changes: Record<string, chrome.storage.StorageChange>,
  areaName: string,
) => {
  if (
    areaName === 'local' &&
    changes[LocalStorageKeyEnum.EVM_ACCOUNTS] !== undefined
  ) {
    void syncConnectionWithWalletState();
  }
};

const onNotificationClicked = async (notificationId: string) => {
  if (!notificationId.startsWith(`${NOTIFICATION_ID_PREFIX}:`)) {
    return;
  }
  const [, rawChainId, transactionHash] = notificationId.split(':');
  const chainId = Number(rawChainId);
  if (!Number.isInteger(chainId) || !transactionHash) {
    return;
  }
  const chain = await ChainUtils.getChainFromDefaultChains<EvmChain>(
    `0x${chainId.toString(16)}`,
  );
  if (chain?.blockExplorer?.url) {
    chrome.tabs.create({
      url: `${chain.blockExplorer.url}/tx/${transactionHash}`,
    });
  }
};

const start = () => {
  if (initialized) {
    return;
  }
  initialized = true;
  VaultUtils.addWalletLockStateListener(() => {
    void syncConnectionWithWalletState();
  });
  chrome.runtime.onMessage.addListener(onRuntimeMessage);
  chrome.storage.onChanged.addListener(onStorageChanged);
  chrome.notifications.onClicked.addListener(onNotificationClicked);
  void syncConnectionWithWalletState();
};

export const EvmIncomingTransactionsModule = {
  start,
};
