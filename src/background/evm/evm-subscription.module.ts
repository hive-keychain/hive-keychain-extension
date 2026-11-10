import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import {
  EVM_SUBSCRIPTION_PORT_NAME,
  EvmEventName,
  ProviderRpcErrorList,
  RoutedEvmEvent,
} from '@interfaces/evm-provider.interface';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { ethers } from 'ethers';
import { CommunicationUtils } from 'src/utils/communication.utils';
import Logger from 'src/utils/logger.utils';

const POLL_INTERVAL_MS = 4000;
const MAX_BLOCK_RANGE = 2000;
const CANONICAL_WINDOW = 20;
const ALARM_NAME = 'evm-log-subscription-poll';
const SESSION_KEY = 'evmLogSubscriptions';
const LIMIT_EXCEEDED = -32005;
const FILTER_NOT_FOUND = -32000;

type Topic = string | string[] | null;

type EvmLog = {
  removed?: boolean;
  blockHash?: string;
  blockNumber?: string;
  transactionHash?: string;
  logIndex?: string;
  [key: string]: unknown;
};

type RpcBlock = {
  hash?: string;
  parentHash?: string;
  number?: string;
  [key: string]: unknown;
};

type LogQuery = {
  address?: string | string[];
  topics?: Topic[];
};

export type SubscriptionRpc = {
  getBlockNumber: (chainId: string) => Promise<number>;
  getBlock: (chainId: string, block: number | string) => Promise<RpcBlock>;
  getLogs: (
    chainId: string,
    filter: LogQuery & { fromBlock: number; toBlock: number },
  ) => Promise<EvmLog[]>;
};

type SubscriptionKind = 'newHeads' | 'logs' | 'blockFilter';
type SubscriptionTransport = 'push' | 'poll';

type SubscriptionRecord = {
  id: string;
  tabId: number;
  frameId: number;
  origin: string;
  chainId: string;
  kind: SubscriptionKind;
  transport: SubscriptionTransport;
  address?: string | string[];
  topics?: Topic[];
  nextBlock: number;
  toBlock?: number;
  afterBlock: number;
  buffer: unknown[];
  retainedLogs: EvmLog[];
};

type CanonicalBlock = {
  number: number;
  hash: string;
  parentHash: string;
  header: RpcBlock;
};

type ChainCursor = {
  chainId: string;
  blocks: CanonicalBlock[];
};

type SessionSnapshot = {
  version: 1;
  subscriptions: SubscriptionRecord[];
  cursors: ChainCursor[];
};

type SessionArea = {
  get: (key: string) => Promise<Record<string, unknown>>;
  set: (items: Record<string, unknown>) => Promise<void>;
};

type Subscriber = {
  tabId: number;
  frameId: number;
  origin: string;
  chainId: string;
};

type PendingNotice = {
  tabId: number;
  frameId: number;
  event: RoutedEvmEvent;
};

export class EvmSubscriptionError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
  }
}

const subscriptions = new Map<string, SubscriptionRecord>();
const cursors = new Map<string, ChainCursor>();
const portsByTab = new Map<number, Set<chrome.runtime.Port>>();
const chainLocks = new Map<string, Promise<unknown>>();
let pendingNotices: PendingNotice[] = [];
let rpcOverride: SubscriptionRpc | undefined;
let sessionOverride: SessionArea | undefined;
let timersEnabled = false;
let pollTimer: ReturnType<typeof setInterval> | undefined;
let chromeBound = false;

const invalidParams = (message: string) =>
  new EvmSubscriptionError(
    ProviderRpcErrorList.invalidMethodParams.code,
    message,
  );

const unsupportedMethod = () =>
  new EvmSubscriptionError(
    ProviderRpcErrorList.unsupportedMethod.code,
    ProviderRpcErrorList.unsupportedMethod.message,
  );

const filterNotFound = () =>
  new EvmSubscriptionError(FILTER_NOT_FOUND, 'filter not found');

const createId = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
};

const defaultRpc = (): SubscriptionRpc => ({
  getBlockNumber: async (chainId) => {
    const provider = await providerFor(chainId);
    const hex = await provider.send('eth_blockNumber', []);
    return Number(BigInt(hex));
  },
  getBlock: async (chainId, block) => {
    const provider = await providerFor(chainId);
    const tag = typeof block === 'number' ? ethers.toQuantity(block) : block;
    return provider.send('eth_getBlockByNumber', [tag, false]);
  },
  getLogs: async (chainId, filter) => {
    const provider = await providerFor(chainId);
    const param: Record<string, unknown> = {
      fromBlock: ethers.toQuantity(filter.fromBlock),
      toBlock: ethers.toQuantity(filter.toBlock),
    };
    if (filter.address !== undefined) param.address = filter.address;
    if (filter.topics !== undefined) param.topics = filter.topics;
    const logs = await provider.send('eth_getLogs', [param]);
    return Array.isArray(logs) ? logs : [];
  },
});

const providerFor = async (chainId: string) => {
  const chain = await ChainUtils.getChain<EvmChain>(chainId);
  if (!chain) {
    throw new EvmSubscriptionError(FILTER_NOT_FOUND, 'Chain is not configured');
  }
  return EthersUtils.getProvider(chain);
};

const rpc = () => rpcOverride ?? defaultRpc();

const sessionArea = (): SessionArea | undefined =>
  sessionOverride ??
  (chrome.storage?.session as SessionArea | undefined);

const withLock = async <T>(chainId: string, task: () => Promise<T>): Promise<T> => {
  const previous = chainLocks.get(chainId) ?? Promise.resolve();
  const run = previous.then(task, task);
  chainLocks.set(
    chainId,
    run.then(
      () => undefined,
      () => undefined,
    ),
  );
  return run;
};

const tabSubscriptions = (tabId: number) =>
  [...subscriptions.values()].filter((entry) => entry.tabId === tabId);

const enqueue = (notice: PendingNotice) => {
  pendingNotices.push(notice);
};

const sendNotice = async (notice: PendingNotice) => {
  const options =
    notice.frameId == null ? undefined : { frameId: notice.frameId };
  await CommunicationUtils.tabsSendMessage(
    notice.tabId,
    {
      command: BackgroundCommand.SEND_EVM_EVENT_TO_CONTENT_SCRIPT,
      value: notice.event,
    },
    options,
  );
};

const flushNotifications = async () => {
  const batch = pendingNotices;
  pendingNotices = [];
  for (const notice of batch) {
    await sendNotice(notice);
  }
};

const holdOrRelease = (tabId: number, hold: boolean) => {
  enqueue({
    tabId,
    frameId: 0,
    event: {
      eventType: hold
        ? EvmEventName.ETH_SUBSCRIPTION_HOLD
        : EvmEventName.ETH_SUBSCRIPTION_RELEASE,
      scope: { kind: 'tab', tabId },
    },
  });
};

const pushSubscription = (
  entry: SubscriptionRecord,
  result: unknown,
) => {
  enqueue({
    tabId: entry.tabId,
    frameId: entry.frameId,
    event: {
      eventType: EvmEventName.ETH_SUBSCRIPTION,
      args: {
        type: 'eth_subscription',
        data: { subscription: entry.id, result },
      },
      scope: { kind: 'tab', tabId: entry.tabId },
    },
  });
};

const ensureActivity = () => {
  if (!timersEnabled) return;
  if (subscriptions.size === 0) {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = undefined;
    }
    try {
      void chrome.alarms?.clear(ALARM_NAME);
    } catch {
      return;
    }
    return;
  }
  if (!pollTimer) {
    pollTimer = setInterval(() => {
      void poll().catch((error) => {
        Logger.warn(
          `EVM subscription poll failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      });
    }, POLL_INTERVAL_MS);
  }
  try {
    void chrome.alarms?.create(ALARM_NAME, { periodInMinutes: 1 });
  } catch {
    return;
  }
};

const persist = async () => {
  const area = sessionArea();
  if (!area || typeof area.set !== 'function') return;
  const snapshot: SessionSnapshot = {
    version: 1,
    subscriptions: [...subscriptions.values()],
    cursors: [...cursors.values()],
  };
  try {
    await area.set({ [SESSION_KEY]: snapshot });
  } catch {
    return;
  }
};

const restore = async () => {
  const area = sessionArea();
  if (!area?.get) return;
  const stored = await area.get(SESSION_KEY);
  const snapshot = stored?.[SESSION_KEY] as SessionSnapshot | undefined;
  if (!snapshot || snapshot.version !== 1) return;
  subscriptions.clear();
  cursors.clear();
  for (const entry of snapshot.subscriptions ?? []) {
    subscriptions.set(entry.id, entry);
  }
  for (const cursor of snapshot.cursors ?? []) {
    cursors.set(cursor.chainId, cursor);
  }
};

const removeEntry = (entry: SubscriptionRecord) => {
  const hadTabEntries = tabSubscriptions(entry.tabId).length;
  subscriptions.delete(entry.id);
  if (hadTabEntries > 0 && tabSubscriptions(entry.tabId).length === 0) {
    holdOrRelease(entry.tabId, false);
  }
};

const findOwned = (
  id: unknown,
  owner: Subscriber,
  transport?: SubscriptionTransport,
) => {
  if (typeof id !== 'string') return undefined;
  const entry = subscriptions.get(id);
  if (!entry) return undefined;
  if (
    entry.origin !== owner.origin ||
    entry.tabId !== owner.tabId ||
    entry.frameId !== owner.frameId
  ) {
    return undefined;
  }
  if (transport && entry.transport !== transport) return undefined;
  return entry;
};

const isHex32 = (value: string) => /^0x[0-9a-fA-F]{64}$/.test(value);

const parseAddress = (address: unknown): string | string[] | undefined => {
  if (address == null) return undefined;
  if (typeof address === 'string' && ethers.isAddress(address)) return address;
  if (
    Array.isArray(address) &&
    address.length > 0 &&
    address.every((item) => typeof item === 'string' && ethers.isAddress(item))
  ) {
    return address;
  }
  throw invalidParams('Invalid log filter address');
};

const parseTopics = (topics: unknown): Topic[] | undefined => {
  if (topics == null) return undefined;
  if (!Array.isArray(topics)) throw invalidParams('Invalid log filter topics');
  return topics.map((topic) => {
    if (topic == null) return null;
    if (typeof topic === 'string' && isHex32(topic)) return topic;
    if (
      Array.isArray(topic) &&
      topic.every((item) => typeof item === 'string' && isHex32(item))
    ) {
      return topic;
    }
    throw invalidParams('Invalid log filter topics');
  });
};

const parseLogQuery = (filter: unknown): LogQuery => {
  if (filter == null) return {};
  if (!filter || typeof filter !== 'object' || Array.isArray(filter)) {
    throw invalidParams('Invalid log filter');
  }
  const source = filter as {
    address?: unknown;
    topics?: unknown;
    fromBlock?: unknown;
    toBlock?: unknown;
  };
  return {
    address: parseAddress(source.address),
    topics: parseTopics(source.topics),
  };
};

const quantity = (value: string) => Number(BigInt(value));

const bothQuantities = (from: unknown, to: unknown) => {
  if (typeof from !== 'string' || typeof to !== 'string') return undefined;
  if (!/^0x[0-9a-fA-F]+$/.test(from) || !/^0x[0-9a-fA-F]+$/.test(to)) {
    return undefined;
  }
  return { from: quantity(from), to: quantity(to) };
};

const headerNumber = (block: RpcBlock, fallback: number) => {
  if (typeof block.number === 'string' && block.number.startsWith('0x')) {
    return quantity(block.number);
  }
  return fallback;
};

const toCanonical = (block: RpcBlock, fallbackNumber: number): CanonicalBlock => {
  if (typeof block.hash !== 'string' || typeof block.parentHash !== 'string') {
    throw new Error('Block header is missing hash');
  }
  return {
    number: headerNumber(block, fallbackNumber),
    hash: block.hash,
    parentHash: block.parentHash,
    header: block,
  };
};

const resolveBound = async (
  value: unknown,
  head: number,
  chainId: string,
): Promise<number> => {
  if (value == null) return head;
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0) {
    return value;
  }
  if (typeof value !== 'string') throw invalidParams('Invalid block tag');
  const tag = value.toLowerCase();
  if (tag === 'latest' || tag === 'pending') return head;
  if (tag === 'earliest') return 0;
  if (tag === 'safe' || tag === 'finalized') {
    const block = await rpc().getBlock(chainId, tag);
    return headerNumber(block, head);
  }
  if (/^0x[0-9a-fA-F]+$/.test(value)) return quantity(value);
  throw invalidParams('Invalid block tag');
};

const assertRange = (from: number, to: number) => {
  if (to < from) throw invalidParams('Invalid log filter block range');
  if (to - from + 1 > MAX_BLOCK_RANGE) {
    throw new EvmSubscriptionError(
      LIMIT_EXCEEDED,
      'Log range exceeds 2000 blocks',
    );
  }
};

const logKey = (log: EvmLog) =>
  `${log.transactionHash ?? ''}:${log.logIndex ?? ''}:${log.blockHash ?? ''}`;

const logBlockNumber = (log: EvmLog) => {
  if (typeof log.blockNumber === 'string' && log.blockNumber.startsWith('0x')) {
    return quantity(log.blockNumber);
  }
  return undefined;
};

const rememberLog = (entry: SubscriptionRecord, log: EvmLog) => {
  entry.retainedLogs.push(log);
  if (entry.transport === 'poll') entry.buffer.push(log);
  else pushSubscription(entry, log);
};

const deliverRemoved = (entry: SubscriptionRecord, removedHashes: Set<string>) => {
  const dropped = entry.retainedLogs.filter(
    (log) => !!log.blockHash && removedHashes.has(log.blockHash),
  );
  if (!dropped.length) return;
  const droppedKeys = new Set(dropped.map(logKey));
  const bufferedKeys = new Set(
    entry.buffer
      .filter((item) => droppedKeys.has(logKey(item as EvmLog)))
      .map((item) => logKey(item as EvmLog)),
  );
  entry.retainedLogs = entry.retainedLogs.filter(
    (log) => !droppedKeys.has(logKey(log)),
  );
  entry.buffer = entry.buffer.filter(
    (item) => !droppedKeys.has(logKey(item as EvmLog)),
  );
  for (const log of dropped) {
    if (bufferedKeys.has(logKey(log))) continue;
    const removed = { ...log, removed: true };
    if (entry.transport === 'poll') entry.buffer.push(removed);
    else pushSubscription(entry, removed);
  }
};

const fetchLogs = async (
  entry: SubscriptionRecord,
  fromBlock: number,
  toBlock: number,
) => {
  const end = entry.toBlock == null ? toBlock : Math.min(toBlock, entry.toBlock);
  if (fromBlock > end) {
    entry.nextBlock = end + 1;
    return;
  }
  const cappedFrom =
    end - fromBlock + 1 > MAX_BLOCK_RANGE
      ? end - MAX_BLOCK_RANGE + 1
      : fromBlock;
  const logs = await rpc().getLogs(entry.chainId, {
    fromBlock: cappedFrom,
    toBlock: end,
    address: entry.address,
    topics: entry.topics,
  });
  logs.sort((left, right) => (logBlockNumber(left) ?? 0) - (logBlockNumber(right) ?? 0));
  for (const log of logs) rememberLog(entry, log);
  entry.nextBlock = end + 1;
};

const oldestNeeded = (chainId: string) => {
  const relevant = [...subscriptions.values()].filter(
    (entry) => entry.chainId === chainId,
  );
  if (!relevant.length) return undefined;
  return Math.min(
    ...relevant.map((entry) =>
      entry.kind === 'logs' ? entry.nextBlock : entry.afterBlock + 1,
    ),
  );
};

const adoptBlocks = (
  chainId: string,
  previous: CanonicalBlock[],
  ancestor: CanonicalBlock | undefined,
  addedNewestFirst: CanonicalBlock[],
) => {
  const added = [...addedNewestFirst].reverse();
  const kept = ancestor
    ? previous.filter((block) => block.number <= ancestor.number)
    : [];
  const blocks = [...kept, ...added].slice(-CANONICAL_WINDOW);
  cursors.set(chainId, { chainId, blocks });
  return added;
};

const walkCanonical = async (
  chainId: string,
  head: RpcBlock,
  headNumber: number,
  known: Map<string, CanonicalBlock>,
) => {
  const walked: CanonicalBlock[] = [];
  let block = head;
  let number = headNumber;
  let ancestor: CanonicalBlock | undefined;
  while (walked.length < CANONICAL_WINDOW) {
    const canonical = toCanonical(block, number);
    const match = known.get(canonical.hash);
    if (match) {
      ancestor = match;
      break;
    }
    walked.push(canonical);
    if (canonical.number === 0) break;
    number = canonical.number - 1;
    block = await rpc().getBlock(chainId, number);
  }
  return { ancestor, walked };
};

const syncChain = async (chainId: string) => {
  const headNumber = await rpc().getBlockNumber(chainId);
  const head = await rpc().getBlock(chainId, headNumber);
  const cursor = cursors.get(chainId);
  if (!cursor || cursor.blocks.length === 0) {
    const needed = oldestNeeded(chainId) ?? headNumber + 1;
    const collected: CanonicalBlock[] = [];
    let number = headNumber;
    let block = head;
    while (collected.length < CANONICAL_WINDOW) {
      collected.push(toCanonical(block, number));
      if (number <= needed || number === 0) break;
      number -= 1;
      block = await rpc().getBlock(chainId, number);
    }
    const added = adoptBlocks(chainId, [], undefined, collected).filter(
      (canonical) => canonical.number >= needed,
    );
    await publish(chainId, [], added, headNumber);
    return;
  }

  const latest = cursor.blocks[cursor.blocks.length - 1];
  const headCanonical = toCanonical(head, headNumber);
  if (headCanonical.hash === latest.hash) return;

  const known = new Map(cursor.blocks.map((block) => [block.hash, block]));
  const { ancestor, walked } = await walkCanonical(
    chainId,
    head,
    headNumber,
    known,
  );
  const removed = ancestor
    ? cursor.blocks.filter((block) => block.number > ancestor.number)
    : [...cursor.blocks];
  adoptBlocks(chainId, cursor.blocks, ancestor, walked);
  await publish(chainId, removed, [...walked].reverse(), headNumber);
};

const publish = async (
  chainId: string,
  removed: CanonicalBlock[],
  added: CanonicalBlock[],
  headNumber: number,
) => {
  const removedHashes = new Set(removed.map((block) => block.hash));
  const entries = [...subscriptions.values()].filter(
    (entry) => entry.chainId === chainId,
  );
  for (const entry of entries) {
    if (entry.kind === 'logs' && removedHashes.size) {
      deliverRemoved(entry, removedHashes);
      const rewind = added.length
        ? added[0].number
        : (removed[removed.length - 1]?.number ?? entry.nextBlock);
      entry.nextBlock = Math.min(entry.nextBlock, rewind);
    }
    if (entry.kind === 'newHeads' || entry.kind === 'blockFilter') {
      for (const block of added) {
        if (block.number <= entry.afterBlock) continue;
        if (entry.kind === 'newHeads') pushSubscription(entry, block.header);
        else entry.buffer.push(block.hash);
        entry.afterBlock = block.number;
      }
    }
  }
  for (const entry of entries) {
    if (entry.kind !== 'logs') continue;
    if (entry.nextBlock <= headNumber) {
      await fetchLogs(entry, entry.nextBlock, headNumber);
    }
  }
};

const installLogSubscription = async (
  owner: Subscriber,
  filter: unknown,
  transport: SubscriptionTransport,
) => {
  const query = parseLogQuery(filter);
  const source = (filter ?? {}) as { fromBlock?: unknown; toBlock?: unknown };
  const fast = bothQuantities(source.fromBlock, source.toBlock);
  if (fast) assertRange(fast.from, fast.to);

  const head = await rpc().getBlockNumber(owner.chainId);
  const from = await resolveBound(source.fromBlock, head, owner.chainId);
  const to = await resolveBound(source.toBlock, head, owner.chainId);
  const end = Math.min(to, head);
  if (source.fromBlock != null || source.toBlock != null) {
    assertRange(from, to);
  }
  const history =
    from <= end
      ? await rpc().getLogs(owner.chainId, {
          fromBlock: from,
          toBlock: end,
          address: query.address,
          topics: query.topics,
        })
      : [];
  const entry: SubscriptionRecord = {
    id: createId(),
    ...owner,
    kind: 'logs',
    transport,
    address: query.address,
    topics: query.topics,
    nextBlock: Math.max(from, end) + (from <= end ? 1 : 0),
    toBlock: source.toBlock == null ? undefined : to,
    afterBlock: head,
    buffer: [],
    retainedLogs: [],
  };
  if (from > end) entry.nextBlock = from;
  const wasEmpty = tabSubscriptions(owner.tabId).length === 0;
  subscriptions.set(entry.id, entry);
  if (wasEmpty) holdOrRelease(owner.tabId, true);
  history.sort(
    (left, right) => (logBlockNumber(left) ?? 0) - (logBlockNumber(right) ?? 0),
  );
  for (const log of history) rememberLog(entry, log);
  return entry.id;
};

const installHeadSubscription = async (
  owner: Subscriber,
  kind: 'newHeads' | 'blockFilter',
  transport: SubscriptionTransport,
) => {
  const head = await rpc().getBlockNumber(owner.chainId);
  const entry: SubscriptionRecord = {
    id: createId(),
    ...owner,
    kind,
    transport,
    nextBlock: head + 1,
    afterBlock: head,
    buffer: [],
    retainedLogs: [],
  };
  const wasEmpty = tabSubscriptions(owner.tabId).length === 0;
  subscriptions.set(entry.id, entry);
  if (wasEmpty) holdOrRelease(owner.tabId, true);
  return entry.id;
};

const subscribe = async (params: unknown[], owner: Subscriber) => {
  const type = params[0];
  if (type === 'newPendingTransactions' || type === 'syncing') {
    throw unsupportedMethod();
  }
  if (type === 'newHeads') {
    return installHeadSubscription(owner, 'newHeads', 'push');
  }
  if (type === 'logs') {
    return installLogSubscription(owner, params[1], 'push');
  }
  throw invalidParams('Unsupported subscription type');
};

const unsubscribe = (params: unknown[], owner: Subscriber) => {
  const entry = findOwned(params[0], owner, 'push');
  if (!entry) return false;
  removeEntry(entry);
  return true;
};

const newFilter = (params: unknown[], owner: Subscriber) =>
  installLogSubscription(owner, params[0], 'poll');

const newBlockFilter = (owner: Subscriber) =>
  installHeadSubscription(owner, 'blockFilter', 'poll');

const getFilterChanges = (params: unknown[], owner: Subscriber) => {
  const entry = findOwned(params[0], owner, 'poll');
  if (!entry) throw filterNotFound();
  const changes = entry.buffer;
  entry.buffer = [];
  return changes;
};

const getFilterLogs = (params: unknown[], owner: Subscriber) => {
  const entry = findOwned(params[0], owner, 'poll');
  if (!entry) throw filterNotFound();
  if (entry.kind !== 'logs') {
    throw invalidParams('Filter is not a log filter');
  }
  return entry.retainedLogs;
};

const uninstallFilter = (params: unknown[], owner: Subscriber) => {
  const entry = findOwned(params[0], owner, 'poll');
  if (!entry) return false;
  removeEntry(entry);
  return true;
};

const ownerFrom = (input: {
  tabId: number;
  frameId?: number;
  origin: string;
  chainId: string;
}): Subscriber => ({
  tabId: input.tabId,
  frameId: input.frameId ?? 0,
  origin: input.origin,
  chainId: input.chainId,
});

const handle = async (input: {
  method: EvmRequestMethod;
  params: unknown[];
  tabId: number;
  frameId?: number;
  origin: string;
  chainId: string;
}) => {
  if (!input.chainId) throw invalidParams('Missing chain id');
  const owner = ownerFrom(input);
  const params = Array.isArray(input.params) ? input.params : [];
  const run = async () => {
    switch (input.method) {
      case EvmRequestMethod.SUBSCRIBE:
        return subscribe(params, owner);
      case EvmRequestMethod.UNSUBSCRIBE:
        return unsubscribe(params, owner);
      case EvmRequestMethod.NEW_FILTER:
        return newFilter(params, owner);
      case EvmRequestMethod.NEW_BLOCK_FILTER:
        return newBlockFilter(owner);
      case EvmRequestMethod.NEW_PENDING_TRANSACTION_FILTER:
        throw unsupportedMethod();
      case EvmRequestMethod.GET_FILTER_CHANGES:
        return getFilterChanges(params, owner);
      case EvmRequestMethod.GET_FILTER_LOGS:
        return getFilterLogs(params, owner);
      case EvmRequestMethod.UNINSTALL_FILTER:
        return uninstallFilter(params, owner);
      default:
        throw invalidParams('Unsupported subscription method');
    }
  };
  const queuedBefore = pendingNotices.length;
  try {
    const result = await withLock(owner.chainId, run);
    await persist();
    ensureActivity();
    return result;
  } catch (error) {
    pendingNotices = pendingNotices.slice(0, queuedBefore);
    throw error;
  }
};

const poll = async () => {
  const chainIds = [
    ...new Set([...subscriptions.values()].map((entry) => entry.chainId)),
  ];
  for (const chainId of chainIds) {
    try {
      await withLock(chainId, () => syncChain(chainId));
    } catch (error) {
      Logger.warn(
        `EVM subscription poll failed for chain ${chainId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
  await persist();
  ensureActivity();
  await flushNotifications();
};

const dropWhere = async (predicate: (entry: SubscriptionRecord) => boolean) => {
  for (const entry of [...subscriptions.values()]) {
    if (predicate(entry)) removeEntry(entry);
  }
  await persist();
  ensureActivity();
  await flushNotifications();
};

const dropOrigin = (origin: string) =>
  dropWhere((entry) => entry.origin === origin);

const dropTab = (tabId: number) =>
  dropWhere((entry) => entry.tabId === tabId);

const disconnectPort = (tabId: number, port: chrome.runtime.Port) => {
  const ports = portsByTab.get(tabId);
  if (!ports) return;
  ports.delete(port);
  if (ports.size === 0) {
    portsByTab.delete(tabId);
    void dropTab(tabId);
  }
};

const bindChrome = () => {
  if (chromeBound) return;
  chromeBound = true;
  chrome.runtime?.onConnect?.addListener((port) => {
    if (port.name !== EVM_SUBSCRIPTION_PORT_NAME) return;
    const tabId = port.sender?.tab?.id;
    if (tabId == null) return;
    const ports = portsByTab.get(tabId) ?? new Set<chrome.runtime.Port>();
    ports.add(port);
    portsByTab.set(tabId, ports);
    port.onDisconnect.addListener(() => disconnectPort(tabId, port));
  });
  chrome.tabs?.onRemoved?.addListener((tabId) => {
    void dropTab(tabId);
  });
  chrome.alarms?.onAlarm?.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
      void poll().catch((error) => {
        Logger.warn(
          `EVM subscription alarm poll failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      });
    }
  });
};

const initialize = () => {
  timersEnabled = true;
  bindChrome();
  return restore()
    .then(() => {
      const tabIds = new Set(
        [...subscriptions.values()].map((entry) => entry.tabId),
      );
      for (const tabId of tabIds) holdOrRelease(tabId, true);
      ensureActivity();
      return flushNotifications();
    })
    .catch((error) => {
      Logger.warn(
        `Unable to restore EVM log subscriptions: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    });
};

const resetForTests = (deps?: {
  rpc?: SubscriptionRpc;
  session?: SessionArea;
}) => {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = undefined;
  timersEnabled = false;
  subscriptions.clear();
  cursors.clear();
  portsByTab.clear();
  chainLocks.clear();
  pendingNotices = [];
  rpcOverride = deps?.rpc;
  sessionOverride = deps?.session;
};

const takeNotifications = () => {
  const batch = pendingNotices;
  pendingNotices = [];
  return batch;
};

export const EvmSubscriptionModule = {
  initialize,
  handle,
  poll,
  dropOrigin,
  dropTab,
  flushNotifications,
  resetForTests,
  takeNotifications,
};
