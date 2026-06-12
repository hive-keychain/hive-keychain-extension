import { getHiveAccountCreationStatus } from '@api/hive-account-creation';
import {
  HiveAccountCreationStatus,
  PendingHiveAccountCreationRequest,
} from '@interfaces/hive-account-creation.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import { PendingHiveAccountCreationUtils } from 'src/utils/pending-hive-account-creation.utils';

export type PaidAccountCreationSynchronizationOutcome =
  | 'updated'
  | 'imported'
  | 'already_imported'
  | 'not_found'
  | 'skipped';

export interface PaidAccountCreationSynchronizationResult {
  outcome: PaidAccountCreationSynchronizationOutcome;
  request?: PendingHiveAccountCreationRequest;
  account?: LocalAccount;
}

const terminalFailureStatuses: HiveAccountCreationStatus[] = [
  'expired',
  'underpaid',
  'paid_after_expiry',
  'username_unavailable',
  'account_creation_failed',
  'cancelled',
];
const synchronizingRequestIds = new Set<string>();

const isTerminalPaidAccountCreationFailure = (
  status: HiveAccountCreationStatus,
) => terminalFailureStatuses.includes(status);

const isPendingHiveAccountCreationAwaitingSync = (
  status: HiveAccountCreationStatus,
) => !isTerminalPaidAccountCreationFailure(status);

const hasPendingHiveAccountCreationsAwaitingSync = (
  pendingRequests: PendingHiveAccountCreationRequest[],
) =>
  pendingRequests.some((request) =>
    isPendingHiveAccountCreationAwaitingSync(request.status),
  );

const isValidKeyPair = (
  privateKey: unknown,
  publicKey: unknown,
): privateKey is string =>
  typeof privateKey === 'string' &&
  typeof publicKey === 'string' &&
  KeysUtils.getPublicKeyFromPrivateKeyString(privateKey) === publicKey;

const getValidatedPendingAccount = async (
  request: PendingHiveAccountCreationRequest,
  mk: string,
): Promise<LocalAccount> => {
  const payload = await EncryptUtils.decryptToJson(request.encryptedAccount, mk);
  const account = Array.isArray(payload?.list) ? payload.list[0] : undefined;

  if (
    !account ||
    account.name !== request.username ||
    !account.keys ||
    !isValidKeyPair(account.keys.active, account.keys.activePubkey) ||
    !isValidKeyPair(account.keys.posting, account.keys.postingPubkey) ||
    !isValidKeyPair(account.keys.memo, account.keys.memoPubkey)
  ) {
    throw new Error('Invalid pending Hive account data.');
  }

  return account as LocalAccount;
};

const importCompletedPendingAccount = async (
  request: PendingHiveAccountCreationRequest,
  mk: string,
  accounts: LocalAccount[],
  persistAccounts: (updatedAccounts: LocalAccount[]) => Promise<void>,
): Promise<PaidAccountCreationSynchronizationResult> => {
  const existingAccount = accounts.find(
    (account) => account.name === request.username,
  );
  if (existingAccount) {
    await PendingHiveAccountCreationUtils.removePendingHiveAccountCreationRequest(
      request.requestId,
      mk,
    );
    return {
      outcome: 'already_imported',
      request,
      account: existingAccount,
    };
  }

  const pendingAccount = await getValidatedPendingAccount(request, mk);
  const updatedAccounts = [...accounts, pendingAccount];
  await persistAccounts(updatedAccounts);
  await PendingHiveAccountCreationUtils.removePendingHiveAccountCreationRequest(
    request.requestId,
    mk,
  );

  return {
    outcome: 'imported',
    request,
    account: pendingAccount,
  };
};

const synchronizePendingHiveAccountCreationRequest = async (
  requestId: string,
  mk: string,
  accounts: LocalAccount[],
  persistAccounts: (updatedAccounts: LocalAccount[]) => Promise<void>,
): Promise<PaidAccountCreationSynchronizationResult> => {
  if (synchronizingRequestIds.has(requestId)) {
    return { outcome: 'skipped' };
  }

  synchronizingRequestIds.add(requestId);
  try {
    const pendingRequests =
      await PendingHiveAccountCreationUtils.getPendingHiveAccountCreationRequests(
        mk,
      );
    const pendingRequest = pendingRequests.find(
      (request) => request.requestId === requestId,
    );
    if (!pendingRequest) {
      return { outcome: 'not_found' };
    }

    const statusResponse = await getHiveAccountCreationStatus(requestId);
    const updatedRequest =
      await PendingHiveAccountCreationUtils.updatePendingHiveAccountCreationStatus(
        requestId,
        statusResponse.status,
        mk,
        statusResponse.payment?.txId ?? statusResponse.txId,
      );
    const synchronizedRequest = updatedRequest ?? {
      ...pendingRequest,
      status: statusResponse.status,
    };

    if (synchronizedRequest.status !== 'account_created') {
      return {
        outcome: 'updated',
        request: synchronizedRequest,
      };
    }

    return await importCompletedPendingAccount(
      synchronizedRequest,
      mk,
      accounts,
      persistAccounts,
    );
  } finally {
    synchronizingRequestIds.delete(requestId);
  }
};

const synchronizePendingHiveAccountCreationRequests = async (
  mk: string,
  getAccounts: () => LocalAccount[],
  persistAccounts: (updatedAccounts: LocalAccount[]) => Promise<void>,
  onRequestError?: (requestId: string, error: unknown) => void,
): Promise<PaidAccountCreationSynchronizationResult[]> => {
  let pendingRequests: PendingHiveAccountCreationRequest[];
  try {
    pendingRequests =
      await PendingHiveAccountCreationUtils.getPendingHiveAccountCreationRequests(
        mk,
      );
  } catch {
    return [];
  }

  const results: PaidAccountCreationSynchronizationResult[] = [];
  for (const request of pendingRequests) {
    try {
      results.push(
        await synchronizePendingHiveAccountCreationRequest(
          request.requestId,
          mk,
          getAccounts(),
          persistAccounts,
        ),
      );
    } catch (error) {
      onRequestError?.(request.requestId, error);
    }
  }

  return results;
};

export const PaidAccountCreationSyncUtils = {
  isTerminalPaidAccountCreationFailure,
  isPendingHiveAccountCreationAwaitingSync,
  hasPendingHiveAccountCreationsAwaitingSync,
  synchronizePendingHiveAccountCreationRequest,
  synchronizePendingHiveAccountCreationRequests,
};
