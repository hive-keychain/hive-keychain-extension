import {
  HiveAccountCreationStatus,
  PendingHiveAccountCreationRequest,
  SavePendingHiveAccountCreationRequest,
} from '@interfaces/hive-account-creation.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import { AsyncUtils } from 'src/utils/async.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

interface PendingHiveAccountCreationLookupOptions {
  maxAttempts?: number;
  retryDelayMs?: number;
}

const getStoragePayload = async (mk: string) => {
  const encryptedRequests = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.PENDING_HIVE_ACCOUNT_CREATIONS,
  );
  return await EncryptUtils.decryptToJson(encryptedRequests, mk);
};

const getPendingHiveAccountCreationRequests = async (
  mk: string,
): Promise<PendingHiveAccountCreationRequest[]> => {
  const payload = await getStoragePayload(mk);
  return Array.isArray(payload?.list) ? payload.list : [];
};

const findPendingHiveAccountCreationRequest = async (
  requestId: string,
  mk: string,
): Promise<PendingHiveAccountCreationRequest | undefined> => {
  const pendingRequests =
    await PendingHiveAccountCreationUtils.getPendingHiveAccountCreationRequests(
      mk,
    );
  return pendingRequests.find((request) => request.requestId === requestId);
};

const findPendingHiveAccountCreationRequestWithRetry = async (
  requestId: string,
  mk: string,
  options: PendingHiveAccountCreationLookupOptions = {},
): Promise<PendingHiveAccountCreationRequest | undefined> => {
  const maxAttempts = options.maxAttempts ?? 1;
  const retryDelayMs = options.retryDelayMs ?? 250;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const request = await findPendingHiveAccountCreationRequest(requestId, mk);
    if (request) {
      return request;
    }

    if (attempt < maxAttempts - 1) {
      await AsyncUtils.sleep(retryDelayMs);
    }
  }

  return undefined;
};

const persistPendingHiveAccountCreationRequests = async (
  requests: PendingHiveAccountCreationRequest[],
  mk: string,
) => {
  const encryptedRequests = await EncryptUtils.encryptJson(
    { list: requests },
    mk,
  );
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.PENDING_HIVE_ACCOUNT_CREATIONS,
    encryptedRequests,
  );
};

const sanitizePendingHiveAccountCreationRequest = (
  request: SavePendingHiveAccountCreationRequest,
  timestamp: string,
): PendingHiveAccountCreationRequest => ({
  requestId: request.requestId,
  username: request.username,
  encryptedAccount: request.encryptedAccount,
  paymentCurrency: request.paymentCurrency,
  paymentAddress: request.paymentAddress,
  memo: request.memo,
  amount: request.amount,
  paymentChainId: request.paymentChainId,
  paymentTokenAddress: request.paymentTokenAddress,
  paymentPriceUsd: request.paymentPriceUsd,
  payerEvmAddress: request.payerEvmAddress,
  paymentTokenSymbol: request.paymentTokenSymbol,
  paymentTokenName: request.paymentTokenName,
  paymentTokenDecimals: request.paymentTokenDecimals,
  paymentTokenLogo: request.paymentTokenLogo,
  paymentTxHash: request.paymentTxHash,
  expiresAt: request.expiresAt,
  status: request.status,
  createdAt: request.createdAt ?? timestamp,
  updatedAt: request.updatedAt ?? timestamp,
  lastCheckedAt: request.lastCheckedAt,
});

const savePendingHiveAccountCreationRequest = async (
  request: SavePendingHiveAccountCreationRequest,
  mk: string,
): Promise<PendingHiveAccountCreationRequest> => {
  const timestamp = new Date().toISOString();
  const pendingRequest = sanitizePendingHiveAccountCreationRequest(
    request,
    timestamp,
  );
  const requests = await getPendingHiveAccountCreationRequests(mk);
  const existingIndex = requests.findIndex(
    ({ requestId }) => requestId === pendingRequest.requestId,
  );

  if (existingIndex >= 0) {
    requests[existingIndex] = pendingRequest;
  } else {
    requests.push(pendingRequest);
  }

  await persistPendingHiveAccountCreationRequests(requests, mk);
  return pendingRequest;
};

const updatePendingHiveAccountCreationStatus = async (
  requestId: string,
  status: HiveAccountCreationStatus,
  mk: string,
  paymentTxHash?: string | null,
): Promise<PendingHiveAccountCreationRequest | undefined> => {
  const requests = await getPendingHiveAccountCreationRequests(mk);
  const requestIndex = requests.findIndex(
    (request) => request.requestId === requestId,
  );

  if (requestIndex === -1) {
    return undefined;
  }

  const timestamp = new Date().toISOString();
  const updatedRequest = {
    ...requests[requestIndex],
    status,
    paymentTxHash:
      paymentTxHash !== undefined
        ? paymentTxHash
        : requests[requestIndex].paymentTxHash,
    updatedAt: timestamp,
    lastCheckedAt: timestamp,
  };
  requests[requestIndex] = updatedRequest;
  await persistPendingHiveAccountCreationRequests(requests, mk);
  return updatedRequest;
};

const upsertPendingHiveAccountCreationPaymentStatus = async (
  request: PendingHiveAccountCreationRequest,
  status: HiveAccountCreationStatus,
  mk: string,
  paymentTxHash?: string | null,
): Promise<PendingHiveAccountCreationRequest> => {
  const updatedRequest = await updatePendingHiveAccountCreationStatus(
    request.requestId,
    status,
    mk,
    paymentTxHash,
  );
  if (updatedRequest) {
    return updatedRequest;
  }

  const timestamp = new Date().toISOString();
  return savePendingHiveAccountCreationRequest(
    {
      requestId: request.requestId,
      username: request.username,
      encryptedAccount: request.encryptedAccount,
      paymentCurrency: request.paymentCurrency,
      paymentAddress: request.paymentAddress,
      memo: request.memo,
      amount: request.amount,
      paymentChainId: request.paymentChainId,
      paymentTokenAddress: request.paymentTokenAddress,
      paymentPriceUsd: request.paymentPriceUsd,
      payerEvmAddress: request.payerEvmAddress,
      paymentTokenSymbol: request.paymentTokenSymbol,
      paymentTokenName: request.paymentTokenName,
      paymentTokenDecimals: request.paymentTokenDecimals,
      paymentTokenLogo: request.paymentTokenLogo,
      paymentTxHash: paymentTxHash ?? request.paymentTxHash,
      expiresAt: request.expiresAt,
      status,
      createdAt: request.createdAt,
      updatedAt: timestamp,
    },
    mk,
  );
};

const removePendingHiveAccountCreationRequest = async (
  requestId: string,
  mk: string,
): Promise<void> => {
  const requests = await getPendingHiveAccountCreationRequests(mk);
  await persistPendingHiveAccountCreationRequests(
    requests.filter((request) => request.requestId !== requestId),
    mk,
  );
};

export const PendingHiveAccountCreationUtils = {
  savePendingHiveAccountCreationRequest,
  getPendingHiveAccountCreationRequests,
  findPendingHiveAccountCreationRequest,
  findPendingHiveAccountCreationRequestWithRetry,
  updatePendingHiveAccountCreationStatus,
  upsertPendingHiveAccountCreationPaymentStatus,
  removePendingHiveAccountCreationRequest,
};
