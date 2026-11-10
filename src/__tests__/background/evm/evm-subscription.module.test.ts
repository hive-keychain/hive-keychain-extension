import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import {
  EvmSubscriptionModule,
  SubscriptionRpc,
} from '@background/evm/evm-subscription.module';
import { EvmEventName } from '@interfaces/evm-provider.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';

jest.mock('src/utils/communication.utils', () => ({
  CommunicationUtils: {
    tabsSendMessage: jest.fn(),
  },
}));

jest.mock('@popup/multichain/utils/chain.utils', () => ({
  ChainUtils: { getChain: jest.fn() },
}));

jest.mock('@popup/evm/utils/ethers.utils', () => ({
  EthersUtils: { getProvider: jest.fn() },
}));

type Header = {
  number: string;
  hash: string;
  parentHash: string;
};

type Log = {
  address: string;
  blockHash: string;
  blockNumber: string;
  transactionHash: string;
  logIndex: string;
  removed?: boolean;
};

const CHAIN_ID = '0x1';
const ORIGIN = 'https://dapp.example';
const TAB_ID = 7;

const hex = (value: number) => `0x${value.toString(16)}`;

const header = (number: number, hash: string, parentHash: string): Header => ({
  number: hex(number),
  hash,
  parentHash,
});

const createRpc = () => {
  let blocks: Header[] = [
    header(0, '0xaaa0', '0x0000'),
    header(1, '0xaaa1', '0xaaa0'),
    header(2, '0xaaa2', '0xaaa1'),
  ];
  let logs: Log[] = [];
  const calls = { blocks: 0, logs: 0 };

  const rpc: SubscriptionRpc = {
    getBlockNumber: async () => blocks.length - 1,
    getBlock: async (_chainId, block) => {
      calls.blocks += 1;
      const number =
        typeof block === 'number' ? block : Number(BigInt(block));
      const found = blocks[number];
      if (!found) throw new Error(`missing block ${number}`);
      return found;
    },
    getLogs: async (_chainId, filter) => {
      calls.logs += 1;
      return logs.filter((log) => {
        const number = Number(BigInt(log.blockNumber));
        return number >= filter.fromBlock && number <= filter.toBlock;
      });
    },
  };

  return {
    rpc,
    calls,
    setBlocks: (next: Header[]) => {
      blocks = next;
    },
    setLogs: (next: Log[]) => {
      logs = next;
    },
    blocks: () => blocks,
  };
};

const owner = {
  tabId: TAB_ID,
  frameId: 0,
  origin: ORIGIN,
  chainId: CHAIN_ID,
};

const subscribe = (
  params: unknown[],
  method: EvmRequestMethod = EvmRequestMethod.SUBSCRIBE,
) =>
  EvmSubscriptionModule.handle({
    method,
    params,
    ...owner,
  });

describe('EVM log subscriptions', () => {
  const chain = createRpc();

  afterEach(() => {
    EvmSubscriptionModule.resetForTests();
    jest.clearAllMocks();
  });

  const install = () => {
    chain.setBlocks([
      header(0, '0xaaa0', '0x0000'),
      header(1, '0xaaa1', '0xaaa0'),
      header(2, '0xaaa2', '0xaaa1'),
    ]);
    chain.setLogs([]);
    chain.calls.blocks = 0;
    chain.calls.logs = 0;
    EvmSubscriptionModule.resetForTests({ rpc: chain.rpc });
  };

  it('pushes a new head after the block number changes', async () => {
    install();
    const { CommunicationUtils } = await import('src/utils/communication.utils');
    const id = await subscribe(['newHeads']);
    expect(id).toEqual(expect.stringMatching(/^0x[0-9a-f]{32}$/));
    expect(EvmSubscriptionModule.takeNotifications().map((notice) => notice.event.eventType)).toContain(
      EvmEventName.ETH_SUBSCRIPTION_HOLD,
    );

    await EvmSubscriptionModule.poll();
    expect(CommunicationUtils.tabsSendMessage).not.toHaveBeenCalled();

    chain.setBlocks([
      ...chain.blocks(),
      header(3, '0xaaa3', '0xaaa2'),
    ]);
    await EvmSubscriptionModule.poll();

    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(
      TAB_ID,
      {
        command: BackgroundCommand.SEND_EVM_EVENT_TO_CONTENT_SCRIPT,
        value: expect.objectContaining({
          eventType: EvmEventName.ETH_SUBSCRIPTION,
          args: {
            type: 'eth_subscription',
            data: {
              subscription: id,
              result: expect.objectContaining({ hash: '0xaaa3' }),
            },
          },
        }),
      },
      { frameId: 0 },
    );
  });

  it('delivers a historical log once for eth_subscribe logs', async () => {
    install();
    const historical: Log = {
      address: '0x00000000000000000000000000000000000000aa',
      blockHash: '0xaaa1',
      blockNumber: '0x1',
      transactionHash: '0xbb',
      logIndex: '0x0',
    };
    chain.setLogs([historical]);
    await subscribe([
      'logs',
      { fromBlock: '0x1', address: historical.address },
    ]);
    const notices = EvmSubscriptionModule.takeNotifications();
    const delivery = notices.find(
      (notice) => notice.event.eventType === EvmEventName.ETH_SUBSCRIPTION,
    );
    expect(delivery?.event.args.data.result).toEqual(
      expect.objectContaining({ transactionHash: '0xbb' }),
    );

    const { CommunicationUtils } = await import('src/utils/communication.utils');
    await EvmSubscriptionModule.poll();
    expect(CommunicationUtils.tabsSendMessage).not.toHaveBeenCalled();
  });

  it('emits removed logs and the replacement after a reorg', async () => {
    install();
    const { CommunicationUtils } = await import('src/utils/communication.utils');
    const original: Log = {
      address: '0x00000000000000000000000000000000000000aa',
      blockHash: '0xaaa2',
      blockNumber: '0x2',
      transactionHash: '0xold',
      logIndex: '0x0',
    };
    chain.setLogs([original]);
    await subscribe([
      'logs',
      { fromBlock: '0x2', address: original.address },
    ]);
    EvmSubscriptionModule.takeNotifications();
    await EvmSubscriptionModule.poll();

    const replacement: Log = {
      address: original.address,
      blockHash: '0xbbb2',
      blockNumber: '0x2',
      transactionHash: '0xnew',
      logIndex: '0x0',
    };
    chain.setBlocks([
      header(0, '0xaaa0', '0x0000'),
      header(1, '0xaaa1', '0xaaa0'),
      header(2, '0xbbb2', '0xaaa1'),
    ]);
    chain.setLogs([replacement]);
    await EvmSubscriptionModule.poll();

    const results = (CommunicationUtils.tabsSendMessage as jest.Mock).mock.calls.map(
      (call) => call[1].value.args?.data?.result,
    );
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ transactionHash: '0xold', removed: true }),
        expect.objectContaining({ transactionHash: '0xnew' }),
      ]),
    );
  });

  it('clears eth_getFilterChanges and keeps eth_getFilterLogs', async () => {
    install();
    const log: Log = {
      address: '0x00000000000000000000000000000000000000aa',
      blockHash: '0xaaa2',
      blockNumber: '0x2',
      transactionHash: '0xkeep',
      logIndex: '0x0',
    };
    chain.setLogs([log]);
    const id = await subscribe(
      [{ fromBlock: '0x2', address: log.address }],
      EvmRequestMethod.NEW_FILTER,
    );
    const first = await subscribe([id], EvmRequestMethod.GET_FILTER_CHANGES);
    const second = await subscribe([id], EvmRequestMethod.GET_FILTER_CHANGES);
    const retained = await subscribe([id], EvmRequestMethod.GET_FILTER_LOGS);
    expect(first).toEqual([
      expect.objectContaining({ transactionHash: '0xkeep' }),
    ]);
    expect(second).toEqual([]);
    expect(retained).toEqual([
      expect.objectContaining({ transactionHash: '0xkeep' }),
    ]);
  });

  it('returns block hashes from a block filter and rejects eth_getFilterLogs', async () => {
    install();
    const id = await subscribe([], EvmRequestMethod.NEW_BLOCK_FILTER);
    chain.setBlocks([
      ...chain.blocks(),
      header(3, '0xaaa3', '0xaaa2'),
    ]);
    await EvmSubscriptionModule.poll();
    const changes = await subscribe([id], EvmRequestMethod.GET_FILTER_CHANGES);
    expect(changes).toEqual(['0xaaa3']);
    await expect(
      subscribe([id], EvmRequestMethod.GET_FILTER_LOGS),
    ).rejects.toMatchObject({ code: -32602 });
  });

  it('rejects a log range above 2000 blocks before eth_getLogs', async () => {
    install();
    chain.setBlocks(
      Array.from({ length: 2501 }, (_, number) =>
        header(number, hex(0x1000 + number), number === 0 ? '0x0000' : hex(0x1000 + number - 1)),
      ),
    );
    await expect(
      subscribe(['logs', { fromBlock: '0x0', toBlock: '0x9c4' }]),
    ).rejects.toMatchObject({ code: -32005 });
    expect(chain.calls.logs).toBe(0);
    expect(chain.calls.blocks).toBe(0);
  });

  it('rejects pending and syncing subscriptions without calling the provider', async () => {
    install();
    await expect(
      subscribe(['newPendingTransactions']),
    ).rejects.toMatchObject({ code: 4200 });
    await expect(subscribe(['syncing'])).rejects.toMatchObject({ code: 4200 });
    await expect(
      subscribe([], EvmRequestMethod.NEW_PENDING_TRANSACTION_FILTER),
    ).rejects.toMatchObject({ code: 4200 });
    expect(chain.calls.blocks).toBe(0);
    expect(chain.calls.logs).toBe(0);
  });

  it('stops events after unsubscribe, chain change, and port disconnect', async () => {
    install();
    const { CommunicationUtils } = await import('src/utils/communication.utils');
    const subscriptionCalls = () =>
      (CommunicationUtils.tabsSendMessage as jest.Mock).mock.calls.filter(
        (call) => call[1].value.eventType === EvmEventName.ETH_SUBSCRIPTION,
      );
    const id = await subscribe(['newHeads']);
    expect(await subscribe([id], EvmRequestMethod.UNSUBSCRIBE)).toBe(true);
    chain.setBlocks([...chain.blocks(), header(3, '0xaaa3', '0xaaa2')]);
    await EvmSubscriptionModule.poll();
    expect(subscriptionCalls()).toEqual([]);

    const replacement = await subscribe(['newHeads']);
    EvmSubscriptionModule.takeNotifications();
    await EvmSubscriptionModule.dropOrigin(ORIGIN);
    chain.setBlocks([...chain.blocks(), header(4, '0xaaa4', '0xaaa3')]);
    await EvmSubscriptionModule.poll();
    expect(subscriptionCalls()).toEqual([]);

    chain.setBlocks([
      header(0, '0xaaa0', '0x0000'),
      header(1, '0xaaa1', '0xaaa0'),
      header(2, '0xaaa2', '0xaaa1'),
    ]);
    const revived = await subscribe(['newHeads']);
    expect(revived).not.toBe(replacement);
    EvmSubscriptionModule.takeNotifications();
    await EvmSubscriptionModule.dropTab(TAB_ID);
    chain.setBlocks([...chain.blocks(), header(3, '0xaaa3', '0xaaa2')]);
    await EvmSubscriptionModule.poll();
    expect(subscriptionCalls()).toEqual([]);
  });

  it('resumes a stored subscription id after the worker restarts', async () => {
    install();
    const store: Record<string, unknown> = {};
    const session = {
      get: async (key: string) => ({ [key]: store[key] }),
      set: async (items: Record<string, unknown>) => {
        Object.assign(store, items);
      },
    };
    EvmSubscriptionModule.resetForTests({ rpc: chain.rpc, session });
    const log: Log = {
      address: '0x00000000000000000000000000000000000000aa',
      blockHash: '0xaaa2',
      blockNumber: '0x2',
      transactionHash: '0xstored',
      logIndex: '0x0',
    };
    chain.setLogs([log]);
    const id = await subscribe(
      [{ fromBlock: '0x2', address: log.address }],
      EvmRequestMethod.NEW_FILTER,
    );
    EvmSubscriptionModule.resetForTests({ rpc: chain.rpc, session });
    await EvmSubscriptionModule.initialize();
    const changes = await subscribe([id], EvmRequestMethod.GET_FILTER_CHANGES);
    expect(changes).toEqual([
      expect.objectContaining({ transactionHash: '0xstored' }),
    ]);
  });
});
