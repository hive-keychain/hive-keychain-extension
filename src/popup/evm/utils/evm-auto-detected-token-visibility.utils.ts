import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

interface EvmHiddenAutoDetectedTokens {
  [chainId: string]: string[];
}

const normalizeChainId = (chainId: string | number) => String(chainId);

const normalizeTokenAddress = (address: string) => address.trim().toLowerCase();

const getStoredHiddenTokens = async (): Promise<EvmHiddenAutoDetectedTokens> => {
  const hiddenTokens = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_HIDDEN_AUTO_DETECTED_TOKENS,
  );

  if (!hiddenTokens || typeof hiddenTokens !== 'object') {
    return {};
  }

  return hiddenTokens as EvmHiddenAutoDetectedTokens;
};

const getHiddenAutoDetectedTokenAddresses = async (
  chainId: string | number,
): Promise<string[]> => {
  const hiddenTokens = await getStoredHiddenTokens();
  return Array.from(
    new Set(
      (hiddenTokens[normalizeChainId(chainId)] ?? [])
        .map(normalizeTokenAddress)
        .filter(Boolean),
    ),
  );
};

const hideAutoDetectedToken = async (
  chainId: string | number,
  tokenAddress: string,
) => {
  const normalizedAddress = normalizeTokenAddress(tokenAddress);
  if (!normalizedAddress) {
    return;
  }

  const normalizedChainId = normalizeChainId(chainId);
  const hiddenTokens = await getStoredHiddenTokens();
  const currentHiddenTokens = hiddenTokens[normalizedChainId] ?? [];
  hiddenTokens[normalizedChainId] = Array.from(
    new Set([...currentHiddenTokens.map(normalizeTokenAddress), normalizedAddress]),
  );

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_HIDDEN_AUTO_DETECTED_TOKENS,
    hiddenTokens,
  );
};

const restoreAutoDetectedToken = async (
  chainId: string | number,
  tokenAddress: string,
) => {
  const normalizedAddress = normalizeTokenAddress(tokenAddress);
  if (!normalizedAddress) {
    return;
  }

  const normalizedChainId = normalizeChainId(chainId);
  const hiddenTokens = await getStoredHiddenTokens();
  const nextHiddenTokens = (hiddenTokens[normalizedChainId] ?? [])
    .map(normalizeTokenAddress)
    .filter((address) => address !== normalizedAddress);

  if (nextHiddenTokens.length > 0) {
    hiddenTokens[normalizedChainId] = Array.from(new Set(nextHiddenTokens));
  } else {
    delete hiddenTokens[normalizedChainId];
  }

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_HIDDEN_AUTO_DETECTED_TOKENS,
    hiddenTokens,
  );
};

export const EvmAutoDetectedTokenVisibilityUtils = {
  getHiddenAutoDetectedTokenAddresses,
  hideAutoDetectedToken,
  restoreAutoDetectedToken,
};
