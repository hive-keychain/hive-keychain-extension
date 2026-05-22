import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { VerifyTransactionParams } from '@popup/evm/interfaces/evm-transactions.interface';
import {
  GoPlusAddressSecurityInfo,
  GoPlusApiResponse,
  GoPlusNftSecurityInfo,
  GoPlusPhishingSiteInfo,
  GoPlusRequestOptions,
  GoPlusRugPullDetectionInfo,
  GoPlusTokenSecurityInfo,
  GoPlusVerificationData,
} from '@popup/evm/interfaces/evm-verification.interface';
import { ethers } from 'ethers';
import Logger from 'src/utils/logger.utils';

const GOPLUS_API_BASE_URL = 'https://api.gopluslabs.io';

/** GoPlus API success code. */
export const GOPLUS_SUCCESS_CODE = 1;

/** Data is still syncing (NFT security, rug-pull detection). */
export const GOPLUS_DATA_PENDING_SYNC_CODE = 2;

const MALICIOUS_ADDRESS_FIELDS: (keyof GoPlusAddressSecurityInfo)[] = [
  'blacklist_doubt',
  'blackmail_activities',
  'cybercrime',
  'darkweb_transactions',
  'fake_kyc',
  'fake_token',
  'financial_crime',
  'gas_abuse',
  'honeypot_related_address',
  'malicious_mining_activities',
  'mixer',
  'money_laundering',
  'phishing_activities',
  'reinit',
  'sanctioned',
  'stealing_attack',
];

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

const get = async <T>(
  path: string,
  query?: Record<string, string | undefined>,
  options?: GoPlusRequestOptions,
): Promise<GoPlusApiResponse<T>> => {
  const response = await fetch(buildUrl(path, query), {
    method: 'GET',
    headers: { Accept: 'application/json' },
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

const isGoPlusTruthy = (value: unknown): boolean =>
  value === '1' || value === 1 || value === true;

const toGoPlusChainId = (chainId: string | undefined): string | null => {
  if (!chainId) {
    return null;
  }
  try {
    if (chainId.startsWith('0x') || chainId.startsWith('0X')) {
      return BigInt(chainId).toString();
    }
    return chainId;
  } catch {
    return null;
  }
};

const isGoPlusResponseSuccess = (
  response: GoPlusApiResponse<unknown> | undefined,
): boolean =>
  response?.code === GOPLUS_SUCCESS_CODE ||
  response?.code === GOPLUS_DATA_PENDING_SYNC_CODE;

const unwrapGoPlusResult = <T>(
  response: GoPlusApiResponse<T> | undefined,
): T | undefined => {
  if (!isGoPlusResponseSuccess(response)) {
    return undefined;
  }
  return response?.result;
};

const buildPhishingCheckUrl = (
  params: VerifyTransactionParams,
): string | null => {
  if (params.origin) {
    return params.origin;
  }
  if (params.domain) {
    const domain = params.domain.replace(/^https?:\/\//, '');
    return `https://${domain}`;
  }
  return null;
};

const isNftTokenType = (tokenType?: EVMSmartContractType): boolean =>
  tokenType === EVMSmartContractType.ERC721 ||
  tokenType === EVMSmartContractType.ERC721Enumerable ||
  tokenType === EVMSmartContractType.ERC1155;

const isAddressMalicious = (
  addressSecurity?: GoPlusAddressSecurityInfo,
): boolean => {
  if (!addressSecurity) {
    return false;
  }
  return MALICIOUS_ADDRESS_FIELDS.some((field) =>
    isGoPlusTruthy(addressSecurity[field]),
  );
};

const parseTaxPercent = (value: string | undefined): number => {
  if (!value) {
    return 0;
  }
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const isHighTax = (tax: string | undefined): boolean =>
  parseTaxPercent(tax) > 10;

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

const safeGoPlusCall = async <T>(
  fn: () => Promise<GoPlusApiResponse<T>>,
): Promise<T | undefined> => {
  try {
    const response = await fn();
    return unwrapGoPlusResult(response);
  } catch (err) {
    Logger.error('GoPlus API call failed', err);
    return undefined;
  }
};

const fetchGoPlusVerificationData = async (
  params: VerifyTransactionParams = {},
): Promise<GoPlusVerificationData> => {
  const goPlusChainId = toGoPlusChainId(params.chainId);
  if (!goPlusChainId) {
    return {};
  }

  const result: GoPlusVerificationData = {};
  let hadFailure = false;

  const phishingUrl = buildPhishingCheckUrl(params);
  const tasks: Promise<void>[] = [];

  if (phishingUrl) {
    tasks.push(
      safeGoPlusCall(() =>
        EvmVerificationUtils.getPhishingSite(phishingUrl),
      ).then((data) => {
        if (data) {
          result.phishingSite = data;
        } else {
          hadFailure = true;
        }
      }),
    );
  }

  const addressesToCheck = new Set<string>();
  if (params.to && ethers.isAddress(params.to)) {
    addressesToCheck.add(params.to.toLowerCase());
  }
  for (const recipient of params.recipients ?? []) {
    if (ethers.isAddress(recipient)) {
      addressesToCheck.add(recipient.toLowerCase());
    }
  }

  for (const address of addressesToCheck) {
    tasks.push(
      safeGoPlusCall(() =>
        EvmVerificationUtils.getAddressSecurity(address, goPlusChainId),
      ).then((data) => {
        if (data) {
          if (!result.addressSecurityByAddress) {
            result.addressSecurityByAddress = {};
          }
          result.addressSecurityByAddress[address] = data;
          if (!result.addressSecurity) {
            result.addressSecurity = data;
          }
        } else {
          hadFailure = true;
        }
      }),
    );
  }

  const goPlusContract = params.tokenContract ?? params.contract;
  if (goPlusContract && ethers.isAddress(goPlusContract)) {
    const contract = goPlusContract.toLowerCase();

    if (isNftTokenType(params.tokenType)) {
      tasks.push(
        safeGoPlusCall(() =>
          EvmVerificationUtils.getNftSecurity(
            goPlusChainId,
            contract,
            params.nftTokenId,
          ),
        ).then((data) => {
          if (data) {
            result.nftSecurity = data;
          } else {
            hadFailure = true;
          }
        }),
      );
    } else {
      tasks.push(
        safeGoPlusCall(() =>
          EvmVerificationUtils.getTokenSecurity(goPlusChainId, contract),
        ).then((data) => {
          if (data) {
            const tokenData =
              data[contract] ??
              data[goPlusContract.toLowerCase()] ??
              Object.values(data)[0];
            if (tokenData) {
              result.tokenSecurity = tokenData;
            }
          } else {
            hadFailure = true;
          }
        }),
      );
      tasks.push(
        safeGoPlusCall(() =>
          EvmVerificationUtils.getRugPullDetection(goPlusChainId, contract),
        ).then((data) => {
          if (data) {
            result.rugPull = data;
          } else {
            hadFailure = true;
          }
        }),
      );
    }
  }

  if (tasks.length === 0) {
    return {};
  }

  await Promise.all(tasks);

  if (hadFailure && Object.keys(result).length === 0) {
    return { unavailable: true };
  }

  return result;
};

export const EvmVerificationUtils = {
  GOPLUS_SUCCESS_CODE,
  GOPLUS_DATA_PENDING_SYNC_CODE,
  isGoPlusTruthy,
  toGoPlusChainId,
  isAddressMalicious,
  isHighTax,
  getTokenSecurity,
  getTokenSecurityRisk,
  getAddressSecurity,
  getNftSecurity,
  getPhishingSite,
  getRugPullDetection,
  fetchGoPlusVerificationData,
};
