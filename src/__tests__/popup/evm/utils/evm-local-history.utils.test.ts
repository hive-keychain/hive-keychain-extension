jest.mock('@popup/evm/utils/evm-transaction-parser.utils', () => ({
  EvmTransactionParserUtils: {
    parseData: jest.fn().mockResolvedValue(undefined),
  },
}));

import {
  EvmLocalHistoryUtils,
  MAX_EVM_LOCAL_HISTORY_EVENTS,
} from '@popup/evm/utils/evm-local-history.utils';
import {
  EvmUserHistory,
  EvmUserHistoryItemType,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { ethers, TransactionResponse } from 'ethers';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('evm-local-history.utils', () => {
  let storageMap: Map<LocalStorageKeyEnum, unknown>;

  const customChain: EvmChain = {
    chainId: '0x39',
    name: 'Custom',
    mainToken: 'ETH',
    isCustom: true,
  } as EvmChain;

  const wallet = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

  const nativeTx = (hash: string): TransactionResponse =>
    ({
      hash,
      nonce: 0,
      to: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      from: wallet,
      value: ethers.parseEther('0.01'),
      data: '0x',
      blockNumber: null,
      index: null,
    }) as TransactionResponse;

  beforeEach(() => {
    storageMap = new Map();
    storageMap.set(LocalStorageKeyEnum.EVM_LOCAL_HISTORY, undefined);

    chrome.i18n.getMessage = jest.fn((key: string, params?: string[]) => {
      if (params?.length) {
        return `${key}:${params.join(',')}`;
      }
      return key;
    });

    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) => storageMap.get(key as LocalStorageKeyEnum));

    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (key, value) => {
        storageMap.set(key as LocalStorageKeyEnum, value);
      });
  });

  it('appendBroadcastRecord does nothing when chain is not custom', async () => {
    const nonCustom = { ...customChain, isCustom: false } as EvmChain;
    await EvmLocalHistoryUtils.appendBroadcastRecord(
      nonCustom,
      wallet,
      nativeTx('0x01'),
    );
    expect(storageMap.get(LocalStorageKeyEnum.EVM_LOCAL_HISTORY)).toBeUndefined();
  });

  it('appendBroadcastRecord stores a native transfer for custom chain', async () => {
    await EvmLocalHistoryUtils.appendBroadcastRecord(
      customChain,
      wallet,
      nativeTx('0xabc'),
    );
    const stored = storageMap.get(LocalStorageKeyEnum.EVM_LOCAL_HISTORY) as Record<
      string,
      Record<string, EvmUserHistory>
    >;
    expect(stored['0x39'][wallet.toLowerCase()].events).toHaveLength(1);
    expect(stored['0x39'][wallet.toLowerCase()].events[0].transactionHash).toBe(
      '0xabc',
    );
    expect(stored['0x39'][wallet.toLowerCase()].fullyFetch).toBe(true);
    expect(stored['0x39'][wallet.toLowerCase()].nextCursor).toBeNull();
  });

  it('appendBroadcastRecord dedupes by transaction hash', async () => {
    const tx = nativeTx('0xdedupe');
    await EvmLocalHistoryUtils.appendBroadcastRecord(customChain, wallet, tx);
    await EvmLocalHistoryUtils.appendBroadcastRecord(customChain, wallet, tx);
    const stored = storageMap.get(LocalStorageKeyEnum.EVM_LOCAL_HISTORY) as Record<
      string,
      Record<string, EvmUserHistory>
    >;
    expect(stored['0x39'][wallet.toLowerCase()].events).toHaveLength(1);
  });

  it('appendBroadcastRecord keeps at most MAX_EVM_LOCAL_HISTORY_EVENTS items', async () => {
    const existing: EvmUserHistory = {
      events: Array.from({ length: MAX_EVM_LOCAL_HISTORY_EVENTS }, (_, i) => ({
        pageTitle: 't',
        type: EvmUserHistoryItemType.BASE_TRANSACTION,
        blockNumber: 0,
        transactionHash: `0x${(1000 + i).toString(16)}`,
        transactionIndex: 0,
        timestamp: i,
        label: 'l',
        nonce: i,
      })),
      nextCursor: null,
      fullyFetch: true,
    };
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.EVM_LOCAL_HISTORY,
      {
        '0x39': {
          [wallet.toLowerCase()]: existing,
        },
      },
    );

    await EvmLocalHistoryUtils.appendBroadcastRecord(
      customChain,
      wallet,
      nativeTx('0xnewcap'),
    );

    const stored = storageMap.get(LocalStorageKeyEnum.EVM_LOCAL_HISTORY) as Record<
      string,
      Record<string, EvmUserHistory>
    >;
    const events = stored['0x39'][wallet.toLowerCase()].events;
    expect(events).toHaveLength(MAX_EVM_LOCAL_HISTORY_EVENTS);
    expect(events[0].transactionHash).toBe('0xnewcap');
  });

  it('getLocalUserHistoryForCustomChain returns stored history', async () => {
    await EvmLocalHistoryUtils.appendBroadcastRecord(
      customChain,
      wallet,
      nativeTx('0xread'),
    );
    const h = await EvmLocalHistoryUtils.getLocalUserHistoryForCustomChain(
      '0x39',
      wallet,
    );
    expect(h.events).toHaveLength(1);
    expect(h.events[0].transactionHash).toBe('0xread');
    expect(h.fullyFetch).toBe(true);
  });

  it('getLocalUserHistoryForCustomChain returns empty when missing', async () => {
    const h = await EvmLocalHistoryUtils.getLocalUserHistoryForCustomChain(
      '0x9999',
      wallet,
    );
    expect(h.events).toHaveLength(0);
    expect(h.fullyFetch).toBe(true);
  });
});
