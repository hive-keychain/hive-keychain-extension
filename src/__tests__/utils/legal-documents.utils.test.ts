import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';

jest.mock('src/utils/localStorage.utils', () => ({
  __esModule: true,
  default: {
    getValueFromLocalStorage: jest.fn(),
    saveValueInLocalStorage: jest.fn(),
  },
}));

const TERMS_SHA = 'a'.repeat(40);
const PRIVACY_SHA = 'b'.repeat(40);
const FEES_SHA = 'c'.repeat(40);
const UPDATED_TERMS_SHA = 'd'.repeat(40);
const COMMIT_SHA = '1'.repeat(40);
const UPDATED_COMMIT_SHA = '2'.repeat(40);
const NOW = 1_700_000_000_000;
const DAY_MS = 24 * 60 * 60 * 1000;
const PAGES_URL =
  'https://api.github.com/repos/hive-keychain/keychain-landing/contents/src/pages?ref=main';
const COMMIT_URL =
  'https://api.github.com/repos/hive-keychain/keychain-landing/git/ref/heads/main';

const directoryListing = (
  termsSha: string = TERMS_SHA,
  extraEntries: unknown[] = [],
) => [
  { name: 'HomePage.tsx', sha: 'e'.repeat(40), type: 'file' },
  { name: 'TermsPage.tsx', sha: termsSha, type: 'file' },
  { name: 'PrivacyPage.tsx', sha: PRIVACY_SHA.toUpperCase(), type: 'file' },
  { name: 'FeesPage.tsx', sha: FEES_SHA, type: 'file' },
  { name: 'assets', sha: 'f'.repeat(40), type: 'dir' },
  ...extraEntries,
];

const fileHashes = {
  termsHash: TERMS_SHA,
  privacyHash: PRIVACY_SHA,
  feesHash: FEES_SHA,
};

const remoteCache = (
  overrides: Partial<{
    termsHash: string;
    privacyHash: string;
    feesHash: string;
    legalVersion: string;
    fetchedAt: number;
  }> = {},
) => ({
  ...fileHashes,
  legalVersion: COMMIT_SHA,
  fetchedAt: NOW,
  ...overrides,
});

const acceptanceStamp = (
  overrides: Partial<{
    termsHash: string;
    privacyHash: string;
    feesHash: string;
    acceptedAt: number;
    legalVersion: string;
  }> = {},
) => ({
  ...fileHashes,
  acceptedAt: NOW - 5_000,
  legalVersion: COMMIT_SHA,
  ...overrides,
});

const loadTestContext = async () => {
  const LegalDocumentsUtils = (await import('src/utils/legal-documents.utils'))
    .default;
  const LocalStorageUtils = (await import('src/utils/localStorage.utils'))
    .default;

  return {
    LegalDocumentsUtils,
    LocalStorageUtils: LocalStorageUtils as unknown as {
      getValueFromLocalStorage: jest.Mock;
      saveValueInLocalStorage: jest.Mock;
    },
  };
};

describe('legal documents utils', () => {
  let storage: Map<string, unknown>;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
    storage = new Map();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const installStorage = (LocalStorageUtils: {
    getValueFromLocalStorage: jest.Mock;
    saveValueInLocalStorage: jest.Mock;
  }) => {
    LocalStorageUtils.getValueFromLocalStorage.mockImplementation(
      async (key: string) => storage.get(key),
    );
    LocalStorageUtils.saveValueInLocalStorage.mockImplementation(
      async (key: string, value: unknown) => {
        storage.set(key, value);
      },
    );
  };

  const mockLegalResponses = (
    pages: unknown,
    options?: { pagesOk?: boolean; commitOk?: boolean; commitSha?: string },
  ) => {
    const pagesOk = options?.pagesOk ?? true;
    const commitOk = options?.commitOk ?? true;
    const commitSha = options?.commitSha ?? COMMIT_SHA;
    global.fetch = jest.fn().mockImplementation(async (url: string) => {
      if (url === COMMIT_URL) {
        return {
          ok: commitOk,
          json: async () => ({ object: { sha: commitSha, type: 'commit' } }),
        };
      }
      return {
        ok: pagesOk,
        json: async () => pages,
      };
    });
  };

  it('maps the legal page blob SHAs and the main commit SHA', async () => {
    const { LegalDocumentsUtils, LocalStorageUtils } = await loadTestContext();
    installStorage(LocalStorageUtils);
    mockLegalResponses(directoryListing());

    await expect(
      LegalDocumentsUtils.needsLegalDocumentAcceptance(),
    ).resolves.toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(PAGES_URL, {
      method: 'GET',
      headers: { Accept: 'application/vnd.github+json' },
    });
    expect(global.fetch).toHaveBeenCalledWith(COMMIT_URL, {
      method: 'GET',
      headers: { Accept: 'application/vnd.github+json' },
    });
    expect(storage.get(LocalStorageKeyEnum.LEGAL_DOCUMENT_HASH_CACHE)).toEqual(
      remoteCache(),
    );
  });

  it('does not prompt when the accepted file hashes match', async () => {
    const { LegalDocumentsUtils, LocalStorageUtils } = await loadTestContext();
    installStorage(LocalStorageUtils);
    storage.set(
      LocalStorageKeyEnum.LEGAL_DOCUMENT_ACCEPTANCE,
      acceptanceStamp(),
    );
    mockLegalResponses(directoryListing(), { commitSha: UPDATED_COMMIT_SHA });

    await expect(
      LegalDocumentsUtils.needsLegalDocumentAcceptance(),
    ).resolves.toBe(false);
  });

  it('prompts when any accepted file hash differs', async () => {
    const { LegalDocumentsUtils, LocalStorageUtils } = await loadTestContext();
    installStorage(LocalStorageUtils);
    storage.set(
      LocalStorageKeyEnum.LEGAL_DOCUMENT_ACCEPTANCE,
      acceptanceStamp(),
    );
    mockLegalResponses(directoryListing(UPDATED_TERMS_SHA));

    await expect(
      LegalDocumentsUtils.needsLegalDocumentAcceptance(),
    ).resolves.toBe(true);
  });

  it('prompts when the stored acceptance is missing the commit stamp', async () => {
    const { LegalDocumentsUtils, LocalStorageUtils } = await loadTestContext();
    installStorage(LocalStorageUtils);
    storage.set(LocalStorageKeyEnum.LEGAL_DOCUMENT_ACCEPTANCE, fileHashes);
    mockLegalResponses(directoryListing());

    await expect(
      LegalDocumentsUtils.needsLegalDocumentAcceptance(),
    ).resolves.toBe(true);
  });

  it('does not prompt or replace the cache when a legal file is missing', async () => {
    const { LegalDocumentsUtils, LocalStorageUtils } = await loadTestContext();
    installStorage(LocalStorageUtils);
    const staleCache = remoteCache({
      termsHash: UPDATED_TERMS_SHA,
      fetchedAt: NOW - DAY_MS - 1,
    });
    storage.set(LocalStorageKeyEnum.LEGAL_DOCUMENT_HASH_CACHE, staleCache);
    storage.set(
      LocalStorageKeyEnum.LEGAL_DOCUMENT_ACCEPTANCE,
      acceptanceStamp(),
    );
    mockLegalResponses([
      { name: 'TermsPage.tsx', sha: TERMS_SHA, type: 'file' },
      { name: 'PrivacyPage.tsx', sha: PRIVACY_SHA, type: 'file' },
    ]);

    await expect(
      LegalDocumentsUtils.needsLegalDocumentAcceptance(),
    ).resolves.toBe(false);
    expect(storage.get(LocalStorageKeyEnum.LEGAL_DOCUMENT_HASH_CACHE)).toEqual(
      staleCache,
    );
  });

  it('does not prompt when the commit SHA cannot be read', async () => {
    const { LegalDocumentsUtils, LocalStorageUtils } = await loadTestContext();
    installStorage(LocalStorageUtils);
    mockLegalResponses(directoryListing(), { commitOk: false });

    await expect(
      LegalDocumentsUtils.needsLegalDocumentAcceptance(),
    ).resolves.toBe(false);
    expect(LocalStorageUtils.saveValueInLocalStorage).not.toHaveBeenCalled();
  });

  it('does not prompt when the directory request fails', async () => {
    const { LegalDocumentsUtils, LocalStorageUtils } = await loadTestContext();
    installStorage(LocalStorageUtils);
    mockLegalResponses({ message: 'unavailable' }, { pagesOk: false });

    await expect(
      LegalDocumentsUtils.needsLegalDocumentAcceptance(),
    ).resolves.toBe(false);
    expect(LocalStorageUtils.saveValueInLocalStorage).not.toHaveBeenCalled();
  });

  it('does not prompt when refresh throws and keeps the previous cache', async () => {
    const { LegalDocumentsUtils, LocalStorageUtils } = await loadTestContext();
    installStorage(LocalStorageUtils);
    const staleCache = remoteCache({
      termsHash: UPDATED_TERMS_SHA,
      fetchedAt: NOW - DAY_MS - 1,
    });
    storage.set(LocalStorageKeyEnum.LEGAL_DOCUMENT_HASH_CACHE, staleCache);
    storage.set(
      LocalStorageKeyEnum.LEGAL_DOCUMENT_ACCEPTANCE,
      acceptanceStamp(),
    );
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    await expect(
      LegalDocumentsUtils.needsLegalDocumentAcceptance(),
    ).resolves.toBe(false);
    expect(storage.get(LocalStorageKeyEnum.LEGAL_DOCUMENT_HASH_CACHE)).toEqual(
      staleCache,
    );
  });

  it('uses a fresh cache without calling GitHub', async () => {
    const { LegalDocumentsUtils, LocalStorageUtils } = await loadTestContext();
    installStorage(LocalStorageUtils);
    storage.set(
      LocalStorageKeyEnum.LEGAL_DOCUMENT_HASH_CACHE,
      remoteCache({ fetchedAt: NOW - 60_000 }),
    );
    global.fetch = jest.fn();

    await expect(
      LegalDocumentsUtils.needsLegalDocumentAcceptance(),
    ).resolves.toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('refreshes a cache older than 24 hours', async () => {
    const { LegalDocumentsUtils, LocalStorageUtils } = await loadTestContext();
    installStorage(LocalStorageUtils);
    storage.set(
      LocalStorageKeyEnum.LEGAL_DOCUMENT_HASH_CACHE,
      remoteCache({ fetchedAt: NOW - DAY_MS - 1 }),
    );
    storage.set(
      LocalStorageKeyEnum.LEGAL_DOCUMENT_ACCEPTANCE,
      acceptanceStamp(),
    );
    mockLegalResponses(directoryListing(UPDATED_TERMS_SHA), {
      commitSha: UPDATED_COMMIT_SHA,
    });

    await expect(
      LegalDocumentsUtils.needsLegalDocumentAcceptance(),
    ).resolves.toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(storage.get(LocalStorageKeyEnum.LEGAL_DOCUMENT_HASH_CACHE)).toEqual(
      remoteCache({
        termsHash: UPDATED_TERMS_SHA,
        legalVersion: UPDATED_COMMIT_SHA,
      }),
    );
  });

  it('shares one refresh between concurrent callers', async () => {
    const { LegalDocumentsUtils, LocalStorageUtils } = await loadTestContext();
    installStorage(LocalStorageUtils);
    let resolvePages: (value: unknown) => void = () => undefined;
    let resolveCommit: (value: unknown) => void = () => undefined;
    let markFetchStarted: () => void = () => undefined;
    let startedFetches = 0;
    const fetchesStarted = new Promise<void>((resolve) => {
      markFetchStarted = () => {
        startedFetches += 1;
        if (startedFetches === 2) {
          resolve();
        }
      };
    });
    global.fetch = jest.fn().mockImplementation(
      (url: string) =>
        new Promise((resolve) => {
          markFetchStarted();
          if (url === COMMIT_URL) {
            resolveCommit = resolve;
            return;
          }
          resolvePages = resolve;
        }),
    );

    const first = LegalDocumentsUtils.needsLegalDocumentAcceptance();
    const second = LegalDocumentsUtils.acceptLegalDocumentHashes();
    await fetchesStarted;
    resolvePages({
      ok: true,
      json: async () => directoryListing(),
    });
    resolveCommit({
      ok: true,
      json: async () => ({ object: { sha: COMMIT_SHA, type: 'commit' } }),
    });

    await expect(first).resolves.toBe(true);
    await second;
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(storage.get(LocalStorageKeyEnum.LEGAL_DOCUMENT_ACCEPTANCE)).toEqual(
      acceptanceStamp({ acceptedAt: NOW }),
    );
  });

  it('stores the acceptance stamp when the remote documents are known', async () => {
    const { LegalDocumentsUtils, LocalStorageUtils } = await loadTestContext();
    installStorage(LocalStorageUtils);
    storage.set(LocalStorageKeyEnum.LEGAL_DOCUMENT_HASH_CACHE, remoteCache());
    global.fetch = jest.fn();

    await LegalDocumentsUtils.acceptLegalDocumentHashes();

    expect(global.fetch).not.toHaveBeenCalled();
    expect(storage.get(LocalStorageKeyEnum.LEGAL_DOCUMENT_ACCEPTANCE)).toEqual(
      acceptanceStamp({ acceptedAt: NOW }),
    );
  });

  it('does not store acceptance when the remote documents are unknown', async () => {
    const { LegalDocumentsUtils, LocalStorageUtils } = await loadTestContext();
    installStorage(LocalStorageUtils);
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    await LegalDocumentsUtils.acceptLegalDocumentHashes();

    expect(storage.has(LocalStorageKeyEnum.LEGAL_DOCUMENT_ACCEPTANCE)).toBe(
      false,
    );
  });
});
