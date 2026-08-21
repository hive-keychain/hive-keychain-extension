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

let initialized = false;
let socket: Socket | undefined;
let localAccounts: EvmAccount[] = [];
let registeredAddresses = new Set<string>();
let syncVersion = 0;

const getNotificationId = (payload: IncomingTransactionPayload) =>
  `${NOTIFICATION_ID_PREFIX}:${payload.chainId}:${payload.item.txId}:${payload.item.opIndex}`;

const getAccountNamesForAddress = (address: string) =>
  [
    ...new Set(
      localAccounts
        .filter(
          (account) => account.wallet.address.toLowerCase() === address,
        )
        .map((account) => EvmAccountUtils.getAccountFullname(account)),
    ),
  ].join(', ');

const registerAccounts = () => {
  socket?.emit(REGISTER_ACCOUNTS_EVENT, {
    addresses: [...registeredAddresses],
  });
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
  socket.on('connect', registerAccounts);
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
    Logger.warn(
      `Unable to connect to EVM incoming transaction socket: ${error.message}`,
    );
  });
  return socket;
};

const disconnect = () => {
  registeredAddresses = new Set();
  localAccounts = [];
  socket?.disconnect();
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
      return;
    }

    const incomingSocket = getSocket();
    if (incomingSocket.connected) {
      registerAccounts();
    } else {
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

const isIncomingTransactionPayload = (
  payload: unknown,
): payload is IncomingTransactionPayload => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return false;
  }
  const value = payload as Partial<IncomingTransactionPayload>;
  return (
    typeof value.chainId === 'number' &&
    Number.isInteger(value.chainId) &&
    value.chainId > 0 &&
    typeof value.address === 'string' &&
    EVM_ADDRESS_REGEX.test(value.address) &&
    !!value.item &&
    typeof value.item.txId === 'string' &&
    TRANSACTION_HASH_REGEX.test(value.item.txId) &&
    typeof value.item.opIndex === 'string' &&
    OP_INDEX_REGEX.test(value.item.opIndex) &&
    value.item.direction === 'IN' &&
    Array.isArray(value.item.in) &&
    Array.isArray(value.item.out)
  );
};

const handleIncomingTransaction = async (payload: unknown) => {
  if (!isIncomingTransactionPayload(payload)) {
    Logger.warn('Ignored invalid EVM incoming transaction socket payload');
    return;
  }

  const address = payload.address.toLowerCase();
  if (!registeredAddresses.has(address)) {
    return;
  }
  const accountNames = getAccountNamesForAddress(address);
  if (!accountNames) {
    return;
  }

  const chainId = `0x${payload.chainId.toString(16)}`;
  const chain = await ChainUtils.getChainFromDefaultChains<EvmChain>(chainId);
  if (!chain?.blockExplorer?.url) {
    return;
  }

  const visibleItem = EvmTokensHistoryUtils.getVisibleHistoryItem(
    payload.item,
    await EvmSettingsUtils.getSettings(),
  );
  if (!visibleItem) {
    return;
  }

  const historyItem = await EvmTokensHistoryUtils.parseHistoryItem(
    visibleItem,
    chain,
    address,
    localAccounts,
  );
  if (!registeredAddresses.has(address)) {
    return;
  }

  void CommunicationUtils.runtimeSendMessage({
    command: BackgroundCommand.EVM_INCOMING_TRANSACTION,
    value: {
      chainId,
      address,
      txId: payload.item.txId,
    },
  });

  chrome.notifications.create(getNotificationId(payload), {
    type: 'basic',
    iconUrl: '/assets/images/iconhive.png',
    title: I18nUtils.getMessage('evm_incoming_transaction_notification_title', [
      accountNames,
      chain.name,
    ]),
    message: historyItem.label,
    priority: 0,
  });
};

const isInternalSender = (sender: chrome.runtime.MessageSender) =>
  sender.id === chrome.runtime.id;

const onRuntimeMessage = (
  message: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
) => {
  if (!isInternalSender(sender)) {
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
