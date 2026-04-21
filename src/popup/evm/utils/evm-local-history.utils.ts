import {
  EvmLocalHistory,
  EvmUserHistory,
  EvmUserHistoryItem,
  EvmUserHistoryItemDetailType,
  EvmUserHistoryItemType,
  EvmUsersHistory,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { ethers, TransactionResponse } from 'ethers';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

/** Max events per wallet per chain; oldest dropped after append. */
export const MAX_EVM_LOCAL_HISTORY_EVENTS = 150;

const emptyUserHistory = (): EvmUserHistory => ({
  events: [],
  nextCursor: null,
  fullyFetch: true,
});

const normalizeWalletKey = (walletAddress: string) =>
  walletAddress.toLowerCase();

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

const parseStoredLocalHistory = (raw: unknown): EvmLocalHistory => {
  if (!isPlainObject(raw)) return {};
  const out: EvmLocalHistory = {};
  for (const [chainId, bucket] of Object.entries(raw)) {
    if (!isPlainObject(bucket)) continue;
    const users: EvmUsersHistory = {};
    for (const [addr, hist] of Object.entries(bucket)) {
      if (
        hist &&
        typeof hist === 'object' &&
        !Array.isArray(hist) &&
        Array.isArray((hist as EvmUserHistory).events)
      ) {
        users[addr] = hist as EvmUserHistory;
      }
    }
    if (Object.keys(users).length > 0) {
      out[chainId] = users;
    }
  }
  return out;
};

const isCalldataEmpty = (data: null | string | undefined): boolean => {
  if (data == null || data === '0x') return true;
  const hex = data.replace(/^0x/i, '');
  return hex.length === 0;
};

export const buildHistoryItemFromBroadcast = async (
  tx: TransactionResponse,
  chain: EvmChain,
  walletAddress: string,
): Promise<EvmUserHistoryItem> => {
  const walletLower = walletAddress.toLowerCase();
  const now = Date.now();
  const base = {
    blockNumber: tx.blockNumber ?? 0,
    transactionHash: tx.hash,
    transactionIndex: tx.index ?? 0,
    nonce: Number(tx.nonce),
    timestamp: now,
  };

  if (!tx.to) {
    return {
      ...base,
      type: EvmUserHistoryItemType.SMART_CONTRACT_CREATION,
      pageTitle: 'evm_history_smart_contract_creation',
      label: chrome.i18n.getMessage(
        'evm_history_smart_contract_creation_message_no_address',
      ),
      detailFields: [],
    };
  }

  const valueWei = tx.value ?? BigInt(0);
  const emptyData = isCalldataEmpty(tx.data);

  if (emptyData && valueWei > BigInt(0)) {
    const amountS = FormatUtils.withCommas(
      ethers.formatEther(valueWei),
      18,
      true,
    );
    const counterparty = EvmFormatUtils.formatAddress(tx.to);
    return {
      ...base,
      type: EvmUserHistoryItemType.TRANSFER_OUT,
      pageTitle: 'popup_html_transfer_funds',
      label: chrome.i18n.getMessage('popup_html_evm_history_transfer_out', [
        amountS,
        chain.mainToken,
        counterparty,
      ]),
      detailFields: [
        {
          label: 'popup_html_evm_transaction_info_from',
          value: walletLower,
          type: EvmUserHistoryItemDetailType.ADDRESS,
        },
        {
          label: 'popup_html_evm_transaction_info_to',
          value: tx.to,
          type: EvmUserHistoryItemDetailType.ADDRESS,
        },
      ],
    };
  }

  if (!emptyData && tx.data.length >= 10) {
    try {
      const decoded = await EvmTransactionParserUtils.parseData(tx.data, chain);
      if (decoded?.operationName) {
        const contractLabel = chrome.i18n.getMessage(
          'evm_history_smart_contract',
        );
        return {
          ...base,
          type: EvmUserHistoryItemType.SMART_CONTRACT,
          pageTitle: 'evm_broadcast',
          label: chrome.i18n.getMessage(
            'evm_history_operation_generic_smart_contract_messages_out',
            [
              decoded.operationName,
              contractLabel,
              EvmFormatUtils.formatAddress(tx.to),
            ],
          ),
          detailFields: [
            {
              label: 'evm_history_smart_contract',
              value: tx.to,
              type: EvmUserHistoryItemDetailType.ADDRESS,
            },
          ],
        };
      }
    } catch {
      /* fall through */
    }

    return {
      ...base,
      type: EvmUserHistoryItemType.SMART_CONTRACT,
      pageTitle: 'evm_broadcast',
      label: chrome.i18n.getMessage(
        'evm_history_default_out_smart_contract_operation',
      ),
      detailFields: [
        {
          label: 'evm_history_smart_contract',
          value: tx.to,
          type: EvmUserHistoryItemDetailType.ADDRESS,
        },
      ],
    };
  }

  return {
    ...base,
    type: EvmUserHistoryItemType.BASE_TRANSACTION,
    pageTitle: 'evm_broadcast',
    label: chrome.i18n.getMessage('evm_history_generic_message'),
    detailFields: [],
  };
};

export const appendBroadcastRecord = async (
  chain: EvmChain,
  walletAddress: string,
  tx: TransactionResponse,
): Promise<void> => {
  if (!chain.isCustom) return;

  const walletKey = normalizeWalletKey(walletAddress);
  const raw = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_LOCAL_HISTORY,
  );
  const storage = parseStoredLocalHistory(raw);

  const item = await buildHistoryItemFromBroadcast(tx, chain, walletAddress);

  const chainId = chain.chainId;
  const forChain = { ...(storage[chainId] ?? {}) };
  const previous = forChain[walletKey] ?? emptyUserHistory();

  const hashLower = item.transactionHash.toLowerCase();
  const deduped = previous.events.filter(
    (e) => e.transactionHash.toLowerCase() !== hashLower,
  );

  const next: EvmUserHistory = {
    events: [item, ...deduped].slice(0, MAX_EVM_LOCAL_HISTORY_EVENTS),
    nextCursor: null,
    fullyFetch: true,
  };

  forChain[walletKey] = next;
  storage[chainId] = forChain;

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_LOCAL_HISTORY,
    storage,
  );
};

export const getLocalUserHistoryForCustomChain = async (
  chainId: string,
  walletAddress: string,
): Promise<EvmUserHistory> => {
  const walletKey = normalizeWalletKey(walletAddress);
  const raw = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_LOCAL_HISTORY,
  );
  const storage = parseStoredLocalHistory(raw);
  const bucket = storage[chainId];
  const slice = bucket?.[walletKey];
  if (!slice?.events?.length) {
    return emptyUserHistory();
  }
  return {
    events: slice.events,
    nextCursor: null,
    fullyFetch: true,
  };
};

export const EvmLocalHistoryUtils = {
  appendBroadcastRecord,
  getLocalUserHistoryForCustomChain,
  buildHistoryItemFromBroadcast,
  MAX_EVM_LOCAL_HISTORY_EVENTS,
};
