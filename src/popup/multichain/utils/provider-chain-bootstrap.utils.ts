import {
  BackgroundMessage,
  BaseBackgroundMessage,
} from '@background/multichain/background-message.interface';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
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

export { PROVIDER_CHAIN_BOOTSTRAP_TIMEOUT_MS };
