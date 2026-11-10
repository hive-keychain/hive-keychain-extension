import {
  BackgroundMessage,
  BaseBackgroundMessage,
} from '@background/multichain/background-message.interface';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { getOriginFromUrl } from 'src/utils/browser-origin.utils';
import { CommunicationUtils } from 'src/utils/communication.utils';

const PROVIDER_CHAIN_BOOTSTRAP_TIMEOUT_MS = 1000;

const getProviderChainId = (value: unknown) => {
  if (typeof value === 'string') return value;
  if (
    value &&
    typeof value === 'object' &&
    'chainId' in value &&
    typeof value.chainId === 'string'
  ) {
    return value.chainId;
  }
  return null;
};

export interface ProviderChainBootstrapResult {
  resolvedChain: EvmChain | null;
  rawChainId: string | null;
}

export const getProviderChainBootstrapResult = async (
  timeoutMs = PROVIDER_CHAIN_BOOTSTRAP_TIMEOUT_MS,
): Promise<ProviderChainBootstrapResult> => {
  return new Promise((resolve) => {
    let settled = false;
    let timeoutId: number | undefined;

    const cleanup = () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };

    const settle = (result: ProviderChainBootstrapResult) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    const handleMessage = async (message: BackgroundMessage) => {
      if (message.command !== BackgroundCommand.SEND_BACK_CHAIN_FROM_PROVIDER) {
        return;
      }

      const chainId = getProviderChainId(
        (message as BaseBackgroundMessage).value,
      );
      if (!chainId) return;

      try {
        const chain = await ChainUtils.getChain<EvmChain>(chainId);
        settle({
          resolvedChain: chain ?? null,
          rawChainId: chainId,
        });
      } catch {
        settle({
          resolvedChain: null,
          rawChainId: chainId,
        });
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    timeoutId = window.setTimeout(
      () => settle({ resolvedChain: null, rawChainId: null }),
      timeoutMs,
    );

    CommunicationUtils.runtimeSendMessage(
      {
        command: BackgroundCommand.GET_CHAIN_FROM_PROVIDER,
      } as BackgroundMessage,
      () => settle({ resolvedChain: null, rawChainId: null }),
    );
  });
};

export const getProviderChainWithTimeout = async (
  timeoutMs = PROVIDER_CHAIN_BOOTSTRAP_TIMEOUT_MS,
): Promise<EvmChain | null> => {
  const result = await getProviderChainBootstrapResult(timeoutMs);
  return result.resolvedChain;
};

const EMPTY_PROVIDER_CHAIN_BOOTSTRAP_RESULT: ProviderChainBootstrapResult = {
  resolvedChain: null,
  rawChainId: null,
};

export interface ProviderBootstrapForPopupOptions {
  tabOrigin: string | null;
  hasConnectedEvmAccountsForOrigin: boolean;
}

export const shouldRunProviderBootstrapForPopup = ({
  tabOrigin,
  hasConnectedEvmAccountsForOrigin,
}: ProviderBootstrapForPopupOptions): boolean => {
  return !!tabOrigin && hasConnectedEvmAccountsForOrigin;
};

export const getProviderBootstrapForPopup = async (
  options: ProviderBootstrapForPopupOptions,
  timeoutMs = PROVIDER_CHAIN_BOOTSTRAP_TIMEOUT_MS,
): Promise<ProviderChainBootstrapResult> => {
  if (!shouldRunProviderBootstrapForPopup(options)) {
    return EMPTY_PROVIDER_CHAIN_BOOTSTRAP_RESULT;
  }

  return getProviderChainBootstrapResult(timeoutMs);
};

const getActiveTabProviderSyncTarget = async (): Promise<{
  origin: string;
  tabId: number;
} | null> => {
  return new Promise((resolve) => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const [activeTab] = tabs;
        const origin = getOriginFromUrl(activeTab?.url);

        if (!origin || activeTab?.id === undefined) {
          resolve(null);
          return;
        }

        resolve({
          origin,
          tabId: activeTab.id,
        });
      });
    } catch {
      resolve(null);
    }
  });
};

export const syncProviderChainForActiveTab = async (
  chain: EvmChain,
): Promise<void> => {
  const target = await getActiveTabProviderSyncTarget();
  if (!target) {
    return;
  }

  const connectedWallets = await EvmWalletUtils.getConnectedWallets(
    target.origin,
  );
  if (!connectedWallets.length) {
    return;
  }

  await CommunicationUtils.runtimeSendMessage({
    command: BackgroundCommand.SET_EVM_PROVIDER_CHAIN,
    value: {
      origin: target.origin,
      tabId: target.tabId,
      chainId: chain.chainId,
    },
  } as BackgroundMessage);
};

export { PROVIDER_CHAIN_BOOTSTRAP_TIMEOUT_MS };
