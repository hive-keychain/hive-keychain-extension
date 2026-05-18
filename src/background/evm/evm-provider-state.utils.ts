import {
  EvmDappInfo,
  EvmEventName,
  RoutedEvmEvent,
} from '@interfaces/evm-provider.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { getOriginFromUrl } from 'src/utils/browser-origin.utils';
import { CommunicationUtils } from 'src/utils/communication.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import {
  areEvmAccountsEqual,
  areEvmChainIdsEqual,
  normalizeEvmAccounts,
  normalizeEvmChainId,
} from 'src/utils/evm-provider-value.utils';

type OriginScopedRoutedEvmEvent = RoutedEvmEvent & {
  scope: { kind: 'origin'; origin: string };
};

type OriginChainWhitelist = Record<string, string[]>;

export const getAccountsForOrigin = async (origin: string): Promise<string[]> => {
  return EvmWalletUtils.getConnectedWallets(origin);
};

const routeOriginScopedEvent = async (
  event: OriginScopedRoutedEvmEvent,
): Promise<void> => {
  await new Promise<void>((resolve) => {
    chrome.tabs.query({}, async (tabs) => {
      const matchingTabs = tabs.filter((tab) => {
        return tab.id && getOriginFromUrl(tab.url) === event.scope.origin;
      });

      await Promise.all(
        matchingTabs.map((tab) =>
          CommunicationUtils.tabsSendMessage(tab.id!, {
            command: BackgroundCommand.SEND_EVM_EVENT_TO_CONTENT_SCRIPT,
            value: event,
          }),
        ),
      );

      resolve();
    });
  });
};

export const emitAccountsChangedIfNeeded = async (
  origin: string,
  prev: string[],
  next: string[],
): Promise<string[]> => {
  const normalizedPrev = normalizeEvmAccounts(prev);
  const normalizedNext = normalizeEvmAccounts(next);

  if (areEvmAccountsEqual(normalizedPrev, normalizedNext)) {
    return normalizedNext;
  }

  await routeOriginScopedEvent({
    eventType: EvmEventName.ACCOUNT_CHANGED,
    args: normalizedNext,
    scope: { kind: 'origin', origin },
  });
  return normalizedNext;
};

export const setAccountsForOrigin = async (
  origin: string,
  accounts: string[],
): Promise<string[]> => {
  const prevAccounts = await getAccountsForOrigin(origin);
  const nextAccounts = normalizeEvmAccounts(accounts);

  await EvmWalletUtils.setConnectedWallets(origin, nextAccounts);
  return emitAccountsChangedIfNeeded(origin, prevAccounts, nextAccounts);
};

/** Merges `{ [domain]: logoUrl }` when at least one account is connected. */
export const persistEvmDappLogoForDomain = async (
  dappInfo: Pick<EvmDappInfo, 'domain' | 'logo'>,
  connectedAccountCount: number,
): Promise<void> => {
  const domain = dappInfo.domain?.trim();
  const logo = dappInfo.logo?.trim();
  if (!domain || !logo || connectedAccountCount < 1) {
    return;
  }

  const stored = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_DAPPS_LOGO,
  );
  const base =
    typeof stored === 'object' &&
    stored !== null &&
    !Array.isArray(stored)
      ? (stored as Record<string, string>)
      : {};
  const next: Record<string, string> = { ...base, [domain]: logo };
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_DAPPS_LOGO,
    next,
  );
};

export const getChainIdForOrigin = async (
  origin: string,
): Promise<string> => {
  const chainId = await EvmChainUtils.getLastEvmChainIdForOrigin(origin);
  return normalizeEvmChainId(chainId) ?? (await EvmChainUtils.getEthChainId())!;
};

export const emitChainChangedIfNeeded = async (
  origin: string,
  prev: string | null,
  next: string,
): Promise<string> => {
  const normalizedPrev = normalizeEvmChainId(prev);
  const normalizedNext = normalizeEvmChainId(next);

  if (!normalizedNext) {
    throw new Error('Invalid chainId provided for origin-scoped provider state');
  }

  if (areEvmChainIdsEqual(normalizedPrev, normalizedNext)) {
    return normalizedNext;
  }

  await routeOriginScopedEvent({
    eventType: EvmEventName.CHAIN_CHANGED,
    args: normalizedNext,
    scope: { kind: 'origin', origin },
  });
  return normalizedNext;
};

export const setChainIdForOrigin = async (
  origin: string,
  chainId: string,
): Promise<string> => {
  const prevChainId = await getChainIdForOrigin(origin);
  const normalizedChainId = normalizeEvmChainId(chainId);

  if (!normalizedChainId) {
    throw new Error('Invalid chainId provided for origin-scoped provider state');
  }

  await EvmChainUtils.setChainIdForOrigin(origin, normalizedChainId);
  return emitChainChangedIfNeeded(origin, prevChainId, normalizedChainId);
};

const getOriginChainWhitelist = async (): Promise<OriginChainWhitelist> => {
  const stored = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_ORIGIN_CHAIN_WHITELIST,
  );

  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
    return {};
  }

  const normalizedWhitelist: OriginChainWhitelist = {};
  for (const [origin, chainIds] of Object.entries(
    stored as Record<string, unknown>,
  )) {
    if (!Array.isArray(chainIds)) continue;

    const normalizedChainIds = chainIds
      .map((chainId) => normalizeEvmChainId(chainId))
      .filter((chainId): chainId is string => !!chainId);

    if (normalizedChainIds.length) {
      normalizedWhitelist[origin] = [...new Set(normalizedChainIds)];
    }
  }

  return normalizedWhitelist;
};

const saveOriginChainWhitelist = async (
  whitelist: OriginChainWhitelist,
): Promise<void> => {
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_ORIGIN_CHAIN_WHITELIST,
    whitelist,
  );
};

export const isChainWhitelistedForOrigin = async (
  origin: string,
  chainId: string,
): Promise<boolean> => {
  const normalizedChainId = normalizeEvmChainId(chainId);
  if (!origin || !normalizedChainId) return false;

  const whitelist = await getOriginChainWhitelist();
  return whitelist[origin]?.includes(normalizedChainId) ?? false;
};

export const addWhitelistedChainForOrigin = async (
  origin: string,
  chainId: string,
): Promise<string[]> => {
  const normalizedChainId = normalizeEvmChainId(chainId);
  if (!origin || !normalizedChainId) {
    throw new Error('Invalid chain whitelist entry');
  }

  const whitelist = await getOriginChainWhitelist();
  const originChainIds = whitelist[origin] ?? [];
  whitelist[origin] = [...new Set([...originChainIds, normalizedChainId])];
  await saveOriginChainWhitelist(whitelist);
  return whitelist[origin];
};

export const removeWhitelistedChainsForOrigin = async (
  origin: string,
): Promise<void> => {
  if (!origin) return;

  const whitelist = await getOriginChainWhitelist();
  delete whitelist[origin];
  await saveOriginChainWhitelist(whitelist);
};
