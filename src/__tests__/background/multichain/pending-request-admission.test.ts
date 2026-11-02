import { PendingRequestAdmission } from '@background/multichain/pending-request-admission';
import { PendingRequestSource } from '@interfaces/pending-request.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';

let storage: Partial<Record<LocalStorageKeyEnum, any>>;

jest.mock('src/utils/localStorage.utils', () => ({
  __esModule: true,
  default: {
    getValueFromLocalStorage: jest.fn(async (key: LocalStorageKeyEnum) =>
      storage[key],
    ),
  },
}));

type Candidate = Parameters<typeof PendingRequestAdmission.admit>[0];

const getSource = (
  origin: string,
  frameId = 0,
  documentId = 'document-a',
): PendingRequestSource => ({
  tab: 1,
  frameId,
  documentId,
  origin,
});

const persistCandidate = (candidate: Candidate) => async (arrivalOrder: number) => {
  const storageKey =
    candidate.chain === 'hive'
      ? LocalStorageKeyEnum.__REQUEST_HANDLER
      : LocalStorageKeyEnum.__EVM_REQUEST_HANDLER;
  const current = storage[storageKey] ?? { requestsData: [] };
  const requestData =
    candidate.chain === 'hive'
      ? {
          tab: candidate.source.tab,
          request_id: candidate.requestId,
          request: { type: candidate.method },
          domain: new URL(candidate.source.origin).hostname,
          source: candidate.source,
          arrivalOrder,
        }
      : {
          tab: candidate.source.tab,
          request_id: candidate.requestId,
          request: { method: candidate.method },
          dappInfo: {
            origin: candidate.source.origin,
            requestSource: candidate.source,
          },
          arrivalOrder,
        };
  storage[storageKey] = {
    ...current,
    requestsData: [...current.requestsData, requestData],
  };
};

const admit = (candidate: Candidate) =>
  PendingRequestAdmission.admit(candidate, persistCandidate(candidate));

const getCandidate = (
  overrides: Partial<Candidate> = {},
): Candidate => ({
  chain: 'hive',
  requestId: 1,
  method: 'transfer',
  source: getSource('https://example.com'),
  byteSize: 100,
  ...overrides,
});

describe('PendingRequestAdmission', () => {
  beforeEach(() => {
    storage = {};
  });

  it('rejects an exact pending request but allows the same id in another document', async () => {
    const candidate = getCandidate();
    expect(await admit(candidate)).toEqual({ accepted: true, arrivalOrder: 1 });
    expect(await admit(candidate)).toEqual({
      accepted: false,
      reason: 'request_pending',
    });
    expect(
      await admit({
        ...candidate,
        source: getSource('https://example.com', 0, 'document-b'),
      }),
    ).toEqual({ accepted: true, arrivalOrder: 2 });
  });

  it('uses the persisted EVM request source for duplicate detection', async () => {
    const candidate = getCandidate({ chain: 'evm' });
    expect(await admit(candidate)).toEqual({ accepted: true, arrivalOrder: 1 });
    expect(
      await admit({
        ...candidate,
        source: getSource('https://example.com', 1, 'document-b'),
      }),
    ).toEqual({ accepted: true, arrivalOrder: 2 });
  });

  it('enforces the per-origin-and-method limit across concurrent admissions', async () => {
    for (let requestId = 1; requestId <= 5; requestId += 1) {
      await admit(getCandidate({ requestId }));
    }

    await expect(admit(getCandidate({ requestId: 6 }))).resolves.toEqual({
      accepted: false,
      reason: 'request_limit',
    });
  });

  it('enforces the per-origin limit across chains', async () => {
    for (let index = 0; index < 5; index += 1) {
      await admit(
        getCandidate({
          chain: index % 2 ? 'evm' : 'hive',
          requestId: index + 1,
          method: `method-${index}`,
        }),
      );
    }

    await expect(
      admit(getCandidate({ requestId: 6, method: 'another-method' })),
    ).resolves.toEqual({ accepted: false, reason: 'request_limit' });
  });

  it('serializes cross-chain admissions at the global limit', async () => {
    for (let index = 0; index < 19; index += 1) {
      await admit(
        getCandidate({
          requestId: index + 1,
          method: `method-${index}`,
          source: getSource(`https://origin-${index}.example`),
        }),
      );
    }

    const results = await Promise.all([
      admit(
        getCandidate({
          requestId: 20,
          source: getSource('https://last-hive.example'),
        }),
      ),
      admit(
        getCandidate({
          chain: 'evm',
          requestId: 21,
          source: getSource('https://last-evm.example'),
        }),
      ),
    ]);

    expect(results.filter((result) => result.accepted)).toHaveLength(1);
    expect(results).toContainEqual({
      accepted: false,
      reason: 'request_limit',
    });
  });

  it('does not swallow persistence failures', async () => {
    await expect(
      PendingRequestAdmission.admit(getCandidate(), async () => {
        throw new Error('QUOTA_BYTES exceeded');
      }),
    ).rejects.toThrow('QUOTA_BYTES exceeded');
    expect(storage).toEqual({});
  });
});
