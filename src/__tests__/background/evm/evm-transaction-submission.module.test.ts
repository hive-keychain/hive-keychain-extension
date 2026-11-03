import { EvmTransactionSubmissionModule as Submissions } from '@background/evm/evm-transaction-submission.module';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { ethers } from 'ethers';
import LocalStorageUtils from 'src/utils/localStorage.utils';

jest.mock('@popup/multichain/utils/chain.utils', () => ({
  ChainUtils: { getChain: jest.fn(async (chainId) => ({ chainId })) },
}));
jest.mock('@popup/evm/utils/ethers.utils', () => ({
  EthersUtils: { getProvider: jest.fn() },
}));
jest.mock('src/utils/localStorage.utils', () => ({
  __esModule: true,
  default: {
    getValueFromLocalStorage: jest.fn(),
    saveValueInLocalStorage: jest.fn(),
  },
}));
jest.mock('src/utils/logger.utils', () => ({
  __esModule: true,
  default: { warn: jest.fn() },
}));

const wallet = new ethers.Wallet('0x' + '01'.repeat(32));
const origin = 'https://example.com';
let records: any[];
let provider: {
  getTransactionCount: jest.Mock;
  getTransactionReceipt: jest.Mock;
  getTransaction: jest.Mock;
  broadcastTransaction: jest.Mock;
};
const sign = (nonce: number, value = 1) =>
  wallet.signTransaction({
    chainId: 1,
    nonce,
    to: wallet.address,
    value,
    gasLimit: 21000,
    gasPrice: 10,
    type: 0,
  });
const receipt = (hash: string, status: number, blockNumber = 1) => ({
  hash,
  status,
  blockHash: ethers.ZeroHash,
  blockNumber,
  gasUsed: BigInt(21000),
  logs: [],
});
const commitBatch = async (id = 'batch', count = 2) => {
  const reservation = await Submissions.reserve(
    wallet.address,
    '0x1',
    count,
    undefined,
    { id, origin },
  );
  const raw = await Promise.all(
    Array.from({ length: count }, (_, index) =>
      sign(reservation.nonce + index),
    ),
  );
  await Submissions.commit(reservation.token, raw);
  return {
    ...reservation,
    raw,
    hashes: raw.map(
      (transaction) => ethers.Transaction.from(transaction).hash!,
    ),
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  records = [];
  provider = {
    getTransactionCount: jest.fn().mockResolvedValue(0),
    getTransactionReceipt: jest.fn().mockResolvedValue(null),
    getTransaction: jest.fn().mockResolvedValue(null),
    broadcastTransaction: jest.fn().mockResolvedValue({}),
  };
  (EthersUtils.getProvider as jest.Mock).mockResolvedValue(provider);
  (LocalStorageUtils.getValueFromLocalStorage as jest.Mock).mockImplementation(
    async () => JSON.parse(JSON.stringify(records)),
  );
  (LocalStorageUtils.saveValueInLocalStorage as jest.Mock).mockImplementation(
    async (_key, value) => {
      records = JSON.parse(JSON.stringify(value));
    },
  );
});

it('coordinates consecutive nonces between batches and ordinary sends', async () => {
  const batch = await commitBatch();
  await expect(
    Submissions.reserve(wallet.address, '0x1', 1),
  ).rejects.toMatchObject({ code: -32002 });
  await Submissions.markBroadcast(batch.token);
  expect((await Submissions.reserve(wallet.address, '0x1', 1)).nonce).toBe(2);
  expect(provider.broadcastTransaction).not.toHaveBeenCalled();
});

it('serializes concurrent reservations for the same account', async () => {
  const results = await Promise.allSettled([
    Submissions.reserve(wallet.address, '0x1', 1),
    Submissions.reserve(wallet.address, '0x1', 1),
  ]);
  expect(results.map((result) => result.status)).toEqual([
    'fulfilled',
    'rejected',
  ]);
});

it('persists every signed call before broadcasting in request order without waiting for receipts', async () => {
  const batch = await commitBatch();
  expect(
    records[0].transactions.map((transaction: any) => transaction.raw),
  ).toEqual(batch.raw);
  await Submissions.reconcile();
  expect(provider.broadcastTransaction.mock.calls.map(([raw]) => raw)).toEqual(
    batch.raw,
  );
  expect(await Submissions.getStatus('batch', origin)).toMatchObject({
    status: 100,
    atomic: false,
    receipts: [],
  });
});

it('recovers an interrupted broadcast using the same signed bytes and nonce', async () => {
  const batch = await commitBatch();
  provider.broadcastTransaction.mockRejectedValueOnce(new Error('timeout'));
  await Submissions.reconcile();
  expect(provider.broadcastTransaction).toHaveBeenCalledTimes(1);
  await Submissions.reconcile();
  expect(provider.broadcastTransaction.mock.calls.map(([raw]) => raw)).toEqual([
    batch.raw[0],
    batch.raw[0],
    batch.raw[1],
  ]);
});

it('rehydrates committed transactions in a fresh background module', async () => {
  const batch = await commitBatch('restart', 1);
  let restarted!: typeof Submissions;
  jest.isolateModules(() => {
    const storage = require('src/utils/localStorage.utils').default;
    storage.getValueFromLocalStorage.mockImplementation(async () => JSON.parse(JSON.stringify(records)));
    storage.saveValueInLocalStorage.mockImplementation(async (_key: string, value: unknown) => { records = JSON.parse(JSON.stringify(value)); });
    require('@popup/evm/utils/ethers.utils').EthersUtils.getProvider.mockResolvedValue(provider);
    restarted = require('@background/evm/evm-transaction-submission.module').EvmTransactionSubmissionModule;
  });
  await restarted.reconcile();
  expect(provider.broadcastTransaction).toHaveBeenCalledWith(batch.raw[0]);
  expect(await restarted.getStatus('restart', origin)).toMatchObject({ status: 100 });
});

it('retains completed status for 24 hours while preserving older pending batches', async () => {
  const batch = await commitBatch('retention', 1);
  provider.getTransactionReceipt.mockResolvedValue(receipt(batch.hashes[0], 1));
  await Submissions.reconcile();
  const createdAt = records[0].createdAt;
  const now = jest.spyOn(Date, 'now').mockReturnValue(createdAt + 23 * 60 * 60 * 1000);
  try {
    await Submissions.reconcile();
    expect(await Submissions.getStatus('retention', origin)).toMatchObject({ status: 200 });
    now.mockReturnValue(createdAt + 25 * 60 * 60 * 1000);
    await Submissions.reconcile();
    await expect(Submissions.getStatus('retention', origin)).rejects.toMatchObject({ code: 5730 });
    provider.getTransactionReceipt.mockResolvedValue(null);
    await commitBatch('pending', 1);
    now.mockReturnValue(createdAt + 72 * 60 * 60 * 1000);
    await Submissions.reconcile();
    expect(await Submissions.getStatus('pending', origin)).toMatchObject({ status: 100 });
  } finally { now.mockRestore(); }
});

it('recognizes an already accepted transaction before resuming its suffix', async () => {
  const batch = await commitBatch();
  provider.getTransaction.mockImplementation(async (hash) =>
    hash === batch.hashes[0] ? { hash } : null,
  );
  await Submissions.reconcile();
  expect(provider.broadcastTransaction).toHaveBeenCalledTimes(1);
  expect(provider.broadcastTransaction).toHaveBeenCalledWith(batch.raw[1]);
});

it.each([
  [1, 1, 200],
  [0, 0, 500],
  [1, 0, 600],
])(
  'aggregates receipts %s/%s as status %s, including reverts',
  async (first, second, status) => {
    const batch = await commitBatch();
    provider.getTransactionReceipt.mockImplementation(async (hash) =>
      receipt(hash, hash === batch.hashes[0] ? first : second),
    );
    await Submissions.reconcile();
    expect(await Submissions.getStatus('batch', origin)).toMatchObject({
      status,
      receipts: [
        { transactionHash: batch.hashes[0], status: ethers.toQuantity(first) },
        { transactionHash: batch.hashes[1], status: ethers.toQuantity(second) },
      ],
    });
  },
);

it('stops the unbroadcast suffix on definitive failure and reports offchain failure', async () => {
  await commitBatch();
  provider.broadcastTransaction.mockRejectedValue({
    code: 'INSUFFICIENT_FUNDS',
  });
  await Submissions.reconcile();
  await Submissions.reconcile();
  expect(provider.broadcastTransaction).toHaveBeenCalledTimes(1);
  expect(await Submissions.getStatus('batch', origin)).toMatchObject({
    status: 400,
    receipts: [],
  });
});

it('keeps successful receipts when a later submission fails', async () => {
  const batch = await commitBatch();
  provider.getTransactionReceipt.mockImplementation(async (hash) =>
    hash === batch.hashes[0] ? receipt(hash, 1) : null,
  );
  provider.broadcastTransaction.mockRejectedValue({
    code: 'INSUFFICIENT_FUNDS',
  });
  await Submissions.reconcile();
  expect(await Submissions.getStatus('batch', origin)).toMatchObject({
    status: 600,
    receipts: [{ transactionHash: batch.hashes[0] }],
  });
});

it('isolates IDs by origin and rejects duplicate submissions', async () => {
  const batch = await commitBatch();
  await expect(
    Submissions.getStatus('batch', 'https://evil.example'),
  ).rejects.toMatchObject({ code: 5730 });
  await expect(
    Submissions.reserve(wallet.address, '0x1', 2, undefined, {
      id: 'batch',
      origin,
    }),
  ).rejects.toMatchObject({ code: 5720 });
  await Submissions.markBroadcast(batch.token);
  await expect(
    Submissions.reserve(wallet.address, '0x1', 1, undefined, {
      id: 'batch',
      origin: 'https://other.example',
    }),
  ).resolves.toMatchObject({ nonce: 2 });
});

it('rejects signed calls that do not match the reserved nonce', async () => {
  const reservation = await Submissions.reserve(wallet.address, '0x1', 1);
  await expect(
    Submissions.commit(reservation.token, [await sign(1)]),
  ).rejects.toMatchObject({ code: -32602 });
  expect(provider.broadcastTransaction).not.toHaveBeenCalled();
});

it('releases unsigned reservations without ever broadcasting', async () => {
  const reservation = await Submissions.reserve(wallet.address, '0x1', 1);
  await Submissions.release(reservation.token);
  await Submissions.reconcile();
  expect(provider.broadcastTransaction).not.toHaveBeenCalled();
  expect(records).toEqual([]);
});

it('does not declare failure merely because receipt indexing lags behind the account nonce', async () => {
  const batch = await commitBatch('batch', 1);
  provider.getTransactionCount.mockResolvedValue(1);
  await Submissions.reconcile();
  expect(await Submissions.getStatus('batch', origin)).toMatchObject({ status: 100, receipts: [] });
  expect(provider.broadcastTransaction).not.toHaveBeenCalled();
  provider.getTransactionReceipt.mockResolvedValue(receipt(batch.hashes[0], 1));
  await Submissions.reconcile();
  expect(await Submissions.getStatus('batch', origin)).toMatchObject({ status: 200 });
});

it('keeps status queries responsive while an RPC broadcast is stalled', async () => {
  await commitBatch('batch', 1);
  let finishBroadcast!: () => void;
  let started!: () => void;
  const broadcasting = new Promise<void>((resolve) => { started = resolve; });
  provider.broadcastTransaction.mockImplementation(() => {
    started();
    return new Promise((resolve) => { finishBroadcast = () => resolve({}); });
  });
  const recovery = Submissions.reconcile();
  await broadcasting;
  expect(await Submissions.getStatus('batch', origin)).toMatchObject({ status: 100 });
  finishBroadcast();
  await recovery;
});

it('tracks a speed-up receipt under the original batch ID', async () => {
  const batch = await commitBatch('batch', 1);
  await Submissions.markBroadcast(batch.token);
  const replacement = await Submissions.reserve(wallet.address, '0x1', 1, 0);
  const raw = await wallet.signTransaction({
    chainId: 1,
    nonce: 0,
    to: wallet.address,
    value: 1,
    gasLimit: 21000,
    gasPrice: 20,
    type: 0,
  });
  const hash = ethers.Transaction.from(raw).hash!;
  await Submissions.commit(replacement.token, [raw]);
  provider.getTransactionCount.mockResolvedValue(1);
  provider.getTransactionReceipt.mockImplementation(async (transactionHash) =>
    transactionHash === hash ? receipt(hash, 1) : null,
  );
  await Submissions.reconcile();
  expect(await Submissions.getStatus('batch', origin)).toMatchObject({
    status: 200,
    receipts: [{ transactionHash: hash }],
  });
});
