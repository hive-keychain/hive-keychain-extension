import {
  EvmCallReceipt,
  EvmCallsStatus,
  EvmTransactionSubmission,
} from '@interfaces/evm-call-batch.interface';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmGasPriceErrorUtils } from '@popup/evm/utils/evm-gas-price-error.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { ethers, TransactionReceipt, TransactionResponse } from 'ethers';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { EvmCallBatchValidationUtils as Validation } from 'src/utils/evm/evm-call-batch-validation.utils';
import Logger from 'src/utils/logger.utils';

const LEASE_MS = 5 * 60 * 1000;
const RETENTION_MS = 24 * 60 * 60 * 1000;
const ALARM = 'evm-transaction-submissions';
let mutationQueue: Promise<unknown> = Promise.resolve();
let reconciliation: Promise<void> | undefined;
let trackBroadcast:
  | ((transaction: TransactionResponse, chainId: string) => Promise<void>)
  | undefined;

const withJournal = <T>(
  action: (records: EvmTransactionSubmission[]) => Promise<T>,
): Promise<T> => {
  const task = mutationQueue.then(async () => {
    const records: EvmTransactionSubmission[] =
      (await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.EVM_TRANSACTION_SUBMISSIONS,
      )) ?? [];
    return action(records);
  });
  mutationQueue = task.catch(() => undefined);
  return task;
};

const save = async (records: EvmTransactionSubmission[]) => {
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_TRANSACTION_SUBMISSIONS,
    records,
  );
};

const getProvider = async (chainId: string) => {
  const chain = await ChainUtils.getChain<EvmChain>(chainId);
  if (!chain) throw Validation.error(5710, 'Unsupported chain');
  return EthersUtils.getProvider(chain);
};

const isFinished = (record: EvmTransactionSubmission) =>
  record.transactions?.every(
    (transaction) => transaction.receipt || transaction.failed,
  ) === true;

const prune = (records: EvmTransactionSubmission[]) => {
  for (let index = records.length - 1; index >= 0; index--) {
    const record = records[index];
    if (
      (!record.transactions && record.expiresAt < Date.now()) ||
      (isFinished(record) && record.createdAt + RETENTION_MS < Date.now())
    ) {
      records.splice(index, 1);
    }
  }
};

const reserve = async (
  from: string,
  chainId: string,
  count: number,
  forcedNonce?: number,
  batch?: EvmTransactionSubmission['batch'],
): Promise<{ token: string; nonce: number }> =>
  withJournal(async (records) => {
    if (
      !ethers.isAddress(from) ||
      !Number.isInteger(count) ||
      count < 1 ||
      count > 10 ||
      (forcedNonce !== undefined &&
        (!Number.isSafeInteger(forcedNonce) || forcedNonce < 0))
    ) {
      throw Validation.error(-32602, 'Invalid nonce reservation');
    }
    chainId = ethers.toQuantity(BigInt(chainId));
    prune(records);
    if (records.length >= 1000)
      throw Validation.error(-32002, 'Transaction submission journal is full');
    if (
      batch &&
      records.some(
        (record) =>
          record.batch?.id === batch.id && record.batch.origin === batch.origin,
      )
    ) {
      throw Validation.error(5720, 'Duplicate batch identifier');
    }
    const related = records.filter(
      (record) =>
        record.from === from.toLowerCase() && record.chainId === chainId,
    );
    // An unsigned lease or an uncertain broadcast must be resolved before more transactions are signed.
    if (
      related.some(
        (record) =>
          !record.transactions ||
          record.transactions.some(
            (transaction) =>
              !transaction.broadcast &&
              !transaction.nonceConsumed &&
              !transaction.receipt &&
              !transaction.failed,
          ),
      )
    )
      throw Validation.error(
        -32002,
        'Another transaction is being submitted for this account',
      );
    const provider = await getProvider(chainId);
    let nonce = await provider.getTransactionCount(from, 'pending');
    for (const record of related) {
      record.transactions?.forEach((transaction, index) => {
        if (!transaction.failed)
          nonce = Math.max(nonce, record.nonce + index + 1);
      });
    }
    if (forcedNonce !== undefined) nonce = forcedNonce;
    if (!Number.isSafeInteger(nonce + count))
      throw Validation.error(-32602, 'Nonce exceeds supported range');
    const token = ethers.hexlify(ethers.randomBytes(32));
    records.push({
      token,
      from: from.toLowerCase(),
      chainId,
      nonce,
      count,
      createdAt: Date.now(),
      expiresAt: Date.now() + LEASE_MS,
      batch,
    });
    await save(records);
    await chrome.alarms.create(ALARM, { periodInMinutes: 1 });
    return { token, nonce };
  });

const markBroadcast = async (token: string): Promise<void> =>
  withJournal(async (records) => {
    const record = records.find((entry) => entry.token === token);
    if (record?.transactions) {
      record.transactions.forEach((transaction) => {
        transaction.broadcast = true;
      });
      await save(records);
    }
  });

const release = async (token: string): Promise<void> =>
  withJournal(async (records) => {
    const index = records.findIndex(
      (record) => record.token === token && !record.transactions,
    );
    if (index >= 0) {
      records.splice(index, 1);
      await save(records);
    }
  });

const commit = async (
  token: string,
  rawTransactions: string[],
): Promise<void> =>
  withJournal(async (records) => {
    const record = records.find((entry) => entry.token === token);
    if (
      !record ||
      record.transactions ||
      record.expiresAt < Date.now() ||
      rawTransactions.length !== record.count
    ) {
      throw Validation.error(
        -32002,
        'Expired or already committed transaction reservation',
      );
    }
    const transactions = rawTransactions.map((raw, index) => {
      const transaction = ethers.Transaction.from(raw);
      if (
        !transaction.isSigned() ||
        transaction.from?.toLowerCase() !== record.from ||
        transaction.chainId !== BigInt(record.chainId) ||
        transaction.nonce !== record.nonce + index
      ) {
        throw Validation.error(
          -32602,
          'Signed transaction does not match its reservation',
        );
      }
      return { hash: transaction.hash!, raw, broadcast: false };
    });
    record.transactions = transactions;
    await save(records);
  });

const toReceipt = (receipt: TransactionReceipt): EvmCallReceipt => ({
  logs: receipt.logs.map(({ address, data, topics }) => ({
    address,
    data,
    topics: [...topics],
  })),
  status: ethers.toQuantity(receipt.status ?? 0),
  blockHash: receipt.blockHash,
  blockNumber: ethers.toQuantity(receipt.blockNumber),
  gasUsed: ethers.toQuantity(receipt.gasUsed),
  transactionHash: receipt.hash,
});

const hasSameCall = (original: string, replacement: string): boolean => {
  const first = ethers.Transaction.from(original);
  const second = ethers.Transaction.from(replacement);
  return (
    first.to === second.to &&
    first.value === second.value &&
    first.data === second.data
  );
};

const reconcileJournal = async (): Promise<void> =>
  withJournal(async (records) => {
    prune(records);
    for (const record of records) {
      if (!record.transactions || isFinished(record)) continue;
      try {
        const provider = await getProvider(record.chainId);
        for (let index = 0; index < record.transactions.length; index++) {
          const transaction = record.transactions[index];
          if (transaction.receipt || transaction.failed) continue;
          const receipt = await provider.getTransactionReceipt(
            transaction.hash,
          );
          if (receipt) {
            if (!transaction.broadcast) {
              const included = await provider.getTransaction(transaction.hash);
              if (included) await trackBroadcast?.(included, record.chainId);
            }
            transaction.receipt = toReceipt(receipt);
            transaction.broadcast = true;
            // Retain the signed call until all replacement checks below have completed.
            await save(records);
            continue;
          }
          const latestNonce = await provider.getTransactionCount(
            record.from,
            'latest',
          );
          if (latestNonce > record.nonce + index) {
            transaction.nonceConsumed = true;
            let replacementReceipt: TransactionReceipt | null = null;
            for (const candidate of records) {
              if (
                candidate.from !== record.from ||
                candidate.chainId !== record.chainId
              )
                continue;
              const replacement =
                candidate.transactions?.[
                  record.nonce + index - candidate.nonce
                ];
              if (
                !replacement ||
                replacement.hash === transaction.hash ||
                !replacement.raw ||
                !transaction.raw
              )
                continue;
              const candidateReceipt = await provider.getTransactionReceipt(
                replacement.hash,
              );
              if (candidateReceipt) {
                if (hasSameCall(transaction.raw, replacement.raw))
                  replacementReceipt = candidateReceipt;
                else transaction.failed = true;
                break;
              }
            }
            if (replacementReceipt)
              transaction.receipt = toReceipt(replacementReceipt);
            // A consumed nonce alone does not prove failure: the RPC may be lagging on receipts.
            // Keep an unknown external replacement pending until its outcome can be established.
            await save(records);
            continue;
          }
          const pending = await provider.getTransaction(transaction.hash);
          if (pending) {
            if (!transaction.broadcast)
              await trackBroadcast?.(pending, record.chainId);
            transaction.broadcast = true;
            await save(records);
            continue;
          }
          // A committed replacement owns this nonce. Never race it by rebroadcasting the old transaction.
          const replacement = records.some(
            (candidate) =>
              candidate !== record &&
              records.indexOf(candidate) > records.indexOf(record) &&
              candidate.from === record.from &&
              candidate.chainId === record.chainId &&
              candidate.transactions?.[
                record.nonce + index - candidate.nonce
              ] &&
              !candidate.transactions[record.nonce + index - candidate.nonce]
                .failed,
          );
          if (replacement) continue;
          if (!transaction.raw) continue;
          try {
            const response = await provider.broadcastTransaction(
              transaction.raw,
            );
            await trackBroadcast?.(response, record.chainId);
            transaction.broadcast = true;
            await save(records);
          } catch (error) {
            const code = (error as { code?: string }).code;
            if (
              [
                'INSUFFICIENT_FUNDS',
                'INVALID_ARGUMENT',
                'CALL_EXCEPTION',
                'REPLACEMENT_UNDERPRICED',
              ].includes(code ?? '') ||
              EvmGasPriceErrorUtils.isInsufficientGasPriceError(error)
            ) {
              // A definite pre-broadcast failure stops the unsubmitted suffix. Submitted calls remain tracked.
              for (const remaining of record.transactions.slice(index)) {
                if (!remaining.broadcast) remaining.failed = true;
              }
              await save(records);
            }
            // Timeouts, nonce errors and 'already known' are ambiguous; reconcile the same hashes next time.
            break;
          }
        }
      } catch {
        Logger.warn(
          'Unable to reconcile EVM transaction submission; retrying on next wake',
        );
      }
    }
    await save(records);
    if (!records.some((record) => !isFinished(record)))
      await chrome.alarms.clear(ALARM);
  });

const reconcile = (): Promise<void> => {
  if (!reconciliation) {
    reconciliation = reconcileJournal().finally(() => {
      reconciliation = undefined;
    });
  }
  return reconciliation;
};

const getBatch = async (
  id: string,
  origin: string,
): Promise<EvmTransactionSubmission> => {
  // Read the last persisted snapshot without waiting behind RPC recovery work.
  const records: EvmTransactionSubmission[] =
    (await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_TRANSACTION_SUBMISSIONS,
    )) ?? [];
  const record = records.find(
    (entry) =>
      entry.batch?.id === id &&
      entry.batch.origin === origin &&
      entry.transactions,
  );
  if (!record) throw Validation.error(5730, 'Unknown batch identifier');
  return record;
};

const getStatus = async (
  id: string,
  origin: string,
): Promise<EvmCallsStatus> => {
  const record = await getBatch(id, origin);
  const transactions = record.transactions!;
  const receipts = transactions
    .flatMap((transaction) =>
      transaction.receipt ? [transaction.receipt] : [],
    )
    .sort((first, second) =>
      Number(BigInt(first.blockNumber) - BigInt(second.blockNumber)),
    );
  const successCount = transactions.filter(
    (transaction) => transaction.receipt?.status === '0x1',
  ).length;
  const status = !isFinished(record)
    ? 100
    : successCount === record.count
    ? 200
    : successCount > 0
    ? 600
    : receipts.length
    ? 500
    : 400;
  return {
    version: '2.0.0',
    id,
    chainId: record.chainId,
    atomic: false,
    status,
    receipts,
  };
};

const initialize = (onBroadcast?: typeof trackBroadcast) => {
  trackBroadcast = onBroadcast;
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM)
      void reconcile().catch(() =>
        Logger.warn('EVM submission recovery failed'),
      );
  });
  void chrome.alarms.create(ALARM, { periodInMinutes: 1 });
  void reconcile().catch(() => Logger.warn('EVM submission recovery failed'));
};

export const EvmTransactionSubmissionModule = {
  reserve,
  release,
  commit,
  markBroadcast,
  reconcile,
  getBatch,
  getStatus,
  initialize,
};
