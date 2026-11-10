import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const LEGAL_PAGES_DIRECTORY_URL =
  'https://api.github.com/repos/hive-keychain/keychain-landing/contents/src/pages?ref=main';
const LEGAL_COMMIT_URL =
  'https://api.github.com/repos/hive-keychain/keychain-landing/git/ref/heads/main';

const LEGAL_DOCUMENT_HASH_TTL_MS = 24 * 60 * 60 * 1000;

const LEGAL_PAGE_FILES = {
  termsHash: 'TermsPage.tsx',
  privacyHash: 'PrivacyPage.tsx',
  feesHash: 'FeesPage.tsx',
} as const;

const SHA_PATTERN = /^[a-f0-9]{40}$/i;

const GITHUB_HEADERS = {
  Accept: 'application/vnd.github+json',
};

export interface LegalAcceptance {
  termsHash: string;
  privacyHash: string;
  feesHash: string;
  acceptedAt: number;
  /** Git commit SHA of keychain-landing main. */
  legalVersion: string;
}

interface LegalDocumentSnapshot {
  termsHash: string;
  privacyHash: string;
  feesHash: string;
  legalVersion: string;
}

interface LegalDocumentHashCache extends LegalDocumentSnapshot {
  fetchedAt: number;
}

let inFlightRemoteSnapshot: Promise<LegalDocumentSnapshot | null> | null = null;

const isSha = (value: unknown): value is string =>
  typeof value === 'string' && SHA_PATTERN.test(value);

const isSnapshot = (value: unknown): value is LegalDocumentSnapshot => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const snapshot = value as LegalDocumentSnapshot;
  return (
    isSha(snapshot.termsHash) &&
    isSha(snapshot.privacyHash) &&
    isSha(snapshot.feesHash) &&
    isSha(snapshot.legalVersion)
  );
};

const isLegalAcceptance = (value: unknown): value is LegalAcceptance => {
  if (!isSnapshot(value)) {
    return false;
  }
  const acceptance = value as LegalAcceptance;
  return (
    typeof acceptance.acceptedAt === 'number' &&
    Number.isFinite(acceptance.acceptedAt)
  );
};

const isHashCache = (value: unknown): value is LegalDocumentHashCache => {
  if (!isSnapshot(value)) {
    return false;
  }
  const cache = value as LegalDocumentHashCache;
  return typeof cache.fetchedAt === 'number' && Number.isFinite(cache.fetchedAt);
};

const documentHashesMatch = (
  accepted: LegalAcceptance,
  remote: LegalDocumentSnapshot,
): boolean =>
  accepted.termsHash.toLowerCase() === remote.termsHash.toLowerCase() &&
  accepted.privacyHash.toLowerCase() === remote.privacyHash.toLowerCase() &&
  accepted.feesHash.toLowerCase() === remote.feesHash.toLowerCase();

const parseDirectoryListing = (
  payload: unknown,
): Pick<LegalDocumentSnapshot, 'termsHash' | 'privacyHash' | 'feesHash'> | null => {
  if (!Array.isArray(payload)) {
    return null;
  }

  const shaByFileName = new Map<string, string>();
  for (const entry of payload) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }
    const record = entry as { name?: unknown; sha?: unknown; type?: unknown };
    if (
      record.type !== 'file' ||
      typeof record.name !== 'string' ||
      !isSha(record.sha)
    ) {
      continue;
    }
    shaByFileName.set(record.name, record.sha.toLowerCase());
  }

  const termsHash = shaByFileName.get(LEGAL_PAGE_FILES.termsHash);
  const privacyHash = shaByFileName.get(LEGAL_PAGE_FILES.privacyHash);
  const feesHash = shaByFileName.get(LEGAL_PAGE_FILES.feesHash);
  if (!termsHash || !privacyHash || !feesHash) {
    return null;
  }

  return { termsHash, privacyHash, feesHash };
};

const parseCommitSha = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const sha = (payload as { object?: { sha?: unknown } }).object?.sha;
  return isSha(sha) ? sha.toLowerCase() : null;
};

const readHashCache = async (): Promise<LegalDocumentHashCache | null> => {
  const raw = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.LEGAL_DOCUMENT_HASH_CACHE,
  );
  return isHashCache(raw) ? raw : null;
};

const readLegalAcceptance = async (): Promise<LegalAcceptance | null> => {
  const raw = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.LEGAL_DOCUMENT_ACCEPTANCE,
  );
  return isLegalAcceptance(raw) ? raw : null;
};

const isFreshCache = (cache: LegalDocumentHashCache): boolean =>
  Date.now() - cache.fetchedAt < LEGAL_DOCUMENT_HASH_TTL_MS;

const fetchRemoteSnapshot = async (): Promise<LegalDocumentSnapshot | null> => {
  const [pagesResponse, commitResponse] = await Promise.all([
    fetch(LEGAL_PAGES_DIRECTORY_URL, {
      method: 'GET',
      headers: GITHUB_HEADERS,
    }),
    fetch(LEGAL_COMMIT_URL, {
      method: 'GET',
      headers: GITHUB_HEADERS,
    }),
  ]);
  if (!pagesResponse.ok || !commitResponse.ok) {
    return null;
  }

  const fileHashes = parseDirectoryListing(await pagesResponse.json());
  const legalVersion = parseCommitSha(await commitResponse.json());
  if (!fileHashes || !legalVersion) {
    return null;
  }

  return { ...fileHashes, legalVersion };
};

const loadRemoteSnapshot = async (): Promise<LegalDocumentSnapshot | null> => {
  const cached = await readHashCache();
  if (cached && isFreshCache(cached)) {
    return {
      termsHash: cached.termsHash,
      privacyHash: cached.privacyHash,
      feesHash: cached.feesHash,
      legalVersion: cached.legalVersion,
    };
  }

  try {
    const snapshot = await fetchRemoteSnapshot();
    if (!snapshot) {
      Logger.error('Legal document hashes could not be refreshed');
      return null;
    }

    const nextCache: LegalDocumentHashCache = {
      ...snapshot,
      fetchedAt: Date.now(),
    };
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.LEGAL_DOCUMENT_HASH_CACHE,
      nextCache,
    );
    return snapshot;
  } catch (error) {
    Logger.error('Legal document hashes could not be refreshed', error);
    return null;
  }
};

const getRemoteLegalDocumentSnapshot = (): Promise<LegalDocumentSnapshot | null> => {
  if (!inFlightRemoteSnapshot) {
    inFlightRemoteSnapshot = loadRemoteSnapshot().finally(() => {
      inFlightRemoteSnapshot = null;
    });
  }
  return inFlightRemoteSnapshot;
};

const needsLegalDocumentAcceptance = async (): Promise<boolean> => {
  const remoteSnapshot = await getRemoteLegalDocumentSnapshot();
  if (!remoteSnapshot) {
    return false;
  }

  const acceptance = await readLegalAcceptance();
  if (!acceptance) {
    return true;
  }

  return !documentHashesMatch(acceptance, remoteSnapshot);
};

const acceptLegalDocumentHashes = async (): Promise<void> => {
  const remoteSnapshot = await getRemoteLegalDocumentSnapshot();
  if (!remoteSnapshot) {
    return;
  }

  const acceptance: LegalAcceptance = {
    termsHash: remoteSnapshot.termsHash,
    privacyHash: remoteSnapshot.privacyHash,
    feesHash: remoteSnapshot.feesHash,
    acceptedAt: Date.now(),
    legalVersion: remoteSnapshot.legalVersion,
  };
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.LEGAL_DOCUMENT_ACCEPTANCE,
    acceptance,
  );
};

const LegalDocumentsUtils = {
  needsLegalDocumentAcceptance,
  acceptLegalDocumentHashes,
};

export default LegalDocumentsUtils;
