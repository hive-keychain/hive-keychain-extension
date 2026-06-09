import { getHiveAccountCreationStatus } from '@api/hive-account-creation';
import {
  HiveAccountCreationStatus,
  PendingHiveAccountCreationRequest,
} from '@interfaces/hive-account-creation.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import { setAccounts } from 'src/popup/hive/actions/account.actions';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import { PendingHiveAccountCreationUtils } from 'src/utils/pending-hive-account-creation.utils';
import Logger from 'src/utils/logger.utils';

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
  dispatch: (action: ReturnType<typeof setAccounts>) => unknown,
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
  await AccountUtils.saveAccounts(updatedAccounts, mk);
  dispatch(setAccounts(updatedAccounts));
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

export const synchronizePendingHiveAccountCreation =
  (
    requestId: string,
  ): AppThunk<Promise<PaidAccountCreationSynchronizationResult>> =>
  async (dispatch, getState) => {
    if (synchronizingRequestIds.has(requestId)) {
      return { outcome: 'skipped' };
    }

    synchronizingRequestIds.add(requestId);
    try {
      const { mk } = getState();
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
        getState().hive.accounts as LocalAccount[],
        dispatch,
      );
    } finally {
      synchronizingRequestIds.delete(requestId);
    }
  };

export const synchronizePendingHiveAccountCreations =
  (): AppThunk<Promise<PaidAccountCreationSynchronizationResult[]>> =>
  async (dispatch, getState) => {
    let pendingRequests: PendingHiveAccountCreationRequest[];
    try {
      pendingRequests =
        await PendingHiveAccountCreationUtils.getPendingHiveAccountCreationRequests(
          getState().mk,
        );
    } catch (error) {
      Logger.error('Unable to load pending Hive account creations', error);
      return [];
    }
    const results: PaidAccountCreationSynchronizationResult[] = [];

    for (const request of pendingRequests) {
      try {
        results.push(
          await dispatch(synchronizePendingHiveAccountCreation(request.requestId)),
        );
      } catch (error) {
        Logger.error(
          `Unable to synchronize pending Hive account creation ${request.requestId}`,
          error,
        );
      }
    }

    return results;
  };

export const PaidAccountCreationActions = {
  isTerminalPaidAccountCreationFailure,
  synchronizePendingHiveAccountCreation,
  synchronizePendingHiveAccountCreations,
};
