import {
  PendingRequestChain,
  PendingRequestSource,
  isPendingRequestSourceMatch,
} from '@background/multichain/pending-request.interface';
import { getNextDialogRequestOrder } from '@background/multichain/dialog-coordinator';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { RequestPayloadUtils } from 'src/utils/request-payload.utils';

export const PENDING_REQUEST_LIMITS = {
  total: 20,
  perOrigin: 5,
  perOriginAndMethod: 3,
} as const;

export type PendingRequestAdmissionReason =
  | 'request_pending'
  | 'request_limit';

type PendingRequestCandidate = {
  chain: PendingRequestChain;
  requestId: number;
  method: string;
  source: PendingRequestSource;
  byteSize: number | null;
};

export type PendingRequestAdmissionResult =
  | { accepted: true; arrivalOrder: number }
  | { accepted: false; reason: PendingRequestAdmissionReason };

type StoredPendingRequest = PendingRequestCandidate;

let pendingRequestAdmissionQueue: Promise<void> = Promise.resolve();

const enqueueAdmission = <T>(admission: () => Promise<T>) => {
  const runAdmission = pendingRequestAdmissionQueue.then(
    admission,
    admission,
  );
  pendingRequestAdmissionQueue = runAdmission.then(
    () => undefined,
    () => undefined,
  );
  return runAdmission;
};

const getLegacyOrigin = (chain: PendingRequestChain, domain?: string) =>
  `legacy:${chain}:${domain ?? 'unknown'}`;

const getStoredPendingRequests = async (): Promise<StoredPendingRequest[]> => {
  const values = await LocalStorageUtils.getMultipleValueFromLocalStorage([
    LocalStorageKeyEnum.__REQUEST_HANDLER,
    LocalStorageKeyEnum.__EVM_REQUEST_HANDLER,
  ]);
  const hiveRequests = values?.[LocalStorageKeyEnum.__REQUEST_HANDLER]
    ?.requestsData ?? [];
  const evmRequests = values?.[LocalStorageKeyEnum.__EVM_REQUEST_HANDLER]
    ?.requestsData ?? [];

  return [
    ...hiveRequests.map((requestData: any) => ({
      chain: 'hive' as const,
      requestId: requestData.request_id,
      method: requestData.request?.type ?? 'unknown',
      source:
        requestData.source ??
        ({
          tab: requestData.tab ?? -1,
          frameId: 0,
          origin: getLegacyOrigin('hive', requestData.domain),
        } as PendingRequestSource),
      byteSize: null,
    })),
    ...evmRequests.map((requestData: any) => ({
      chain: 'evm' as const,
      requestId: requestData.request_id,
      method: requestData.request?.method ?? 'unknown',
      source:
        requestData.source ??
        ({
          tab: requestData.tab ?? -1,
          frameId: 0,
          origin:
            requestData.dappInfo?.origin ??
            getLegacyOrigin('evm', requestData.dappInfo?.domain),
        } as PendingRequestSource),
      byteSize: null,
    })),
  ];
};

const isDuplicate = (
  storedRequest: StoredPendingRequest,
  candidate: PendingRequestCandidate,
) =>
  storedRequest.chain === candidate.chain &&
  storedRequest.requestId === candidate.requestId &&
  isPendingRequestSourceMatch(storedRequest.source, candidate.source);

const hasReachedLimit = (
  requests: StoredPendingRequest[],
  candidate: PendingRequestCandidate,
) => {
  if (requests.length >= PENDING_REQUEST_LIMITS.total) return true;

  const requestsForOrigin = requests.filter(
    (request) => request.source.origin === candidate.source.origin,
  );
  if (requestsForOrigin.length >= PENDING_REQUEST_LIMITS.perOrigin) return true;

  return (
    requestsForOrigin.filter(
      (request) =>
        request.chain === candidate.chain &&
        request.method === candidate.method,
    ).length >= PENDING_REQUEST_LIMITS.perOriginAndMethod
  );
};

const admit = async (
  candidate: PendingRequestCandidate,
  persist: (arrivalOrder: number) => Promise<void>,
): Promise<PendingRequestAdmissionResult> =>
  enqueueAdmission(async () => {
    if (
      candidate.byteSize === null ||
      candidate.byteSize > RequestPayloadUtils.MAX_REQUEST_BYTES
    ) {
      return { accepted: false, reason: 'request_limit' };
    }

    const requests = await getStoredPendingRequests();
    if (requests.some((request) => isDuplicate(request, candidate))) {
      return { accepted: false, reason: 'request_pending' };
    }
    if (hasReachedLimit(requests, candidate)) {
      return { accepted: false, reason: 'request_limit' };
    }

    const arrivalOrder = await getNextDialogRequestOrder();
    await persist(arrivalOrder);
    return { accepted: true, arrivalOrder };
  });

export const PendingRequestAdmission = { admit };
