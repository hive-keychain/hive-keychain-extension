import {
  GoPlusAccessTokenResult,
  GoPlusAddressSecurityInfo,
  GoPlusApiResponse,
  GoPlusNftSecurityInfo,
  GoPlusPhishingSiteInfo,
  GoPlusRequestOptions,
  GoPlusRugPullDetectionInfo,
  GoPlusTokenSecurityInfo,
} from '@popup/evm/interfaces/evm-verification.interface';
import CryptoJS from 'crypto-js';

const GOPLUS_API_BASE_URL = 'https://api.gopluslabs.io';

/** GoPlus API success code. */
export const GOPLUS_SUCCESS_CODE = 1;

/** Data is still syncing (NFT security, rug-pull detection). */
export const GOPLUS_DATA_PENDING_SYNC_CODE = 2;

const buildUrl = (
  path: string,
  query?: Record<string, string | undefined>,
): string => {
  const url = new URL(`${GOPLUS_API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, value);
      }
    }
  }
  return url.toString();
};

const buildHeaders = (accessToken?: string): HeadersInit => {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
};

const get = async <T>(
  path: string,
  query?: Record<string, string | undefined>,
  options?: GoPlusRequestOptions,
): Promise<GoPlusApiResponse<T>> => {
  const response = await fetch(buildUrl(path, query), {
    method: 'GET',
    headers: buildHeaders(options?.accessToken),
    signal: options?.signal,
  });
  if (!response.ok) {
    throw new Error(`GoPlus API request failed with status ${response.status}`);
  }
  return (await response.json()) as GoPlusApiResponse<T>;
};

const post = async <T>(
  path: string,
  body: unknown,
  options?: GoPlusRequestOptions,
): Promise<GoPlusApiResponse<T>> => {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: {
      ...buildHeaders(options?.accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: options?.signal,
  });
  if (!response.ok) {
    throw new Error(`GoPlus API request failed with status ${response.status}`);
  }
  return (await response.json()) as GoPlusApiResponse<T>;
};

const normalizeContractAddresses = (
  contractAddresses: string | string[],
): string =>
  (Array.isArray(contractAddresses)
    ? contractAddresses
    : [contractAddresses]
  ).join(',');

/**
 * Obtain a GoPlus access token.
 * @see https://docs.gopluslabs.io/reference/getaccesstokenusingpost
 */
const fetchGoPlusAccessToken = async (
  appKey: string,
  appSecret: string,
  options?: GoPlusRequestOptions,
): Promise<GoPlusApiResponse<GoPlusAccessTokenResult>> => {
  const time = Math.floor(Date.now() / 1000);
  const sign = CryptoJS.SHA1(`${appKey}${time}${appSecret}`).toString();
  return post<GoPlusAccessTokenResult>(
    '/api/v1/token',
    { app_key: appKey, sign, time },
    options,
  );
};

/**
 * Token Security API — get token security and risk data (15 CU/token).
 * @see https://docs.gopluslabs.io/reference/tokensecurityusingget_1
 */
const getTokenSecurity = async (
  chainId: string,
  contractAddresses: string | string[],
  options?: GoPlusRequestOptions,
): Promise<GoPlusApiResponse<Record<string, GoPlusTokenSecurityInfo>>> =>
  get(
    `/api/v1/token_security/${chainId}`,
    {
      contract_addresses: normalizeContractAddresses(contractAddresses),
    },
    options,
  );

/**
 * Token Security Risk API — same endpoint as {@link getTokenSecurity}.
 * @see https://docs.gopluslabs.io/reference/tokensecurityusingget_1
 */
const getTokenSecurityRisk = getTokenSecurity;

/**
 * Malicious Address API — check if an address is malicious (5 CU/address).
 * @see https://docs.gopluslabs.io/reference/addresscontractusingget_1
 */
const getAddressSecurity = async (
  address: string,
  chainId?: string,
  options?: GoPlusRequestOptions,
): Promise<GoPlusApiResponse<GoPlusAddressSecurityInfo>> =>
  get(
    `/api/v1/address_security/${address}`,
    chainId ? { chain_id: chainId } : undefined,
    options,
  );

/**
 * NFT Security API — get NFT security and risk data (12 CU/NFT).
 * @see https://docs.gopluslabs.io/reference/getnftinfousingget_1
 */
const getNftSecurity = async (
  chainId: string,
  contractAddress: string,
  tokenId?: string,
  options?: GoPlusRequestOptions,
): Promise<GoPlusApiResponse<GoPlusNftSecurityInfo>> =>
  get(
    `/api/v1/nft_security/${chainId}`,
    {
      contract_addresses: contractAddress,
      token_id: tokenId,
    },
    options,
  );

/**
 * Phishing Site Detection API (5 CU/request).
 * @see https://docs.gopluslabs.io/reference/phishingsiteusingget
 */
const getPhishingSite = async (
  url: string,
  options?: GoPlusRequestOptions,
): Promise<GoPlusApiResponse<GoPlusPhishingSiteInfo>> =>
  get('/api/v1/phishing_site', { url }, options);

/**
 * Rug-pull Detection API (15 CU/request).
 * @see https://docs.gopluslabs.io/reference/getdefiinfousingget
 */
const getRugPullDetection = async (
  chainId: string,
  contractAddress: string,
  options?: GoPlusRequestOptions,
): Promise<GoPlusApiResponse<GoPlusRugPullDetectionInfo>> =>
  get(
    `/api/v1/rugpull_detecting/${chainId}`,
    { contract_addresses: contractAddress },
    options,
  );

export const EvmVerificationUtils = {
  GOPLUS_SUCCESS_CODE,
  GOPLUS_DATA_PENDING_SYNC_CODE,
  fetchGoPlusAccessToken,
  getTokenSecurity,
  getTokenSecurityRisk,
  getAddressSecurity,
  getNftSecurity,
  getPhishingSite,
  getRugPullDetection,
};
