import {
  EvmEventName,
  RoutedEvmEvent,
} from '@interfaces/evm-provider.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { getOriginFromUrl } from 'src/utils/browser-origin.utils';
import { CommunicationUtils } from 'src/utils/communication.utils';
import {
  areEvmAccountsEqual,
  areEvmChainIdsEqual,
  normalizeEvmAccounts,
  normalizeEvmChainId,
} from 'src/utils/evm-provider-value.utils';

type OriginScopedRoutedEvmEvent = RoutedEvmEvent & {
  scope: { kind: 'origin'; origin: string };
};

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
