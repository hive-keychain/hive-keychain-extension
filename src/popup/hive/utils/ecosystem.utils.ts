import { DApp, DAppCategory } from 'src/interfaces/ecosystem-dapps.interface';
import {
  Chain,
  ChainType,
} from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { KeychainApi } from 'src/api/keychain';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const getDefaultChains = async (): Promise<Chain[]> => {
  const chains = (await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.DEFAULT_CHAINS,
  )) as Chain[] | undefined;

  if (!Array.isArray(chains)) return [];
  return chains;
};

const getChainLogoMap = (chains: Chain[]): Record<string, string> => {
  if (!Array.isArray(chains)) return {};

  return chains.reduce((acc: Record<string, string>, chain) => {
    if (
      typeof chain?.chainId === 'string' &&
      chain.chainId.length &&
      typeof chain.logo === 'string' &&
      chain.logo.length
    ) {
      acc[chain.chainId.toLowerCase()] = chain.logo;
    }
    return acc;
  }, {});
};

const getHiveChainId = (chains: Chain[]): string | undefined => {
  return chains.find((chain) => chain.type === ChainType.HIVE)?.chainId;
};

const getSortPriority = (
  dapp: DApp,
  currentChainId?: string,
  hiveChainId?: string,
) => {
  const normalizedDappChainId = dapp.chainId?.toLowerCase();
  const normalizedCurrentChainId = currentChainId?.toLowerCase();
  const normalizedHiveChainId = hiveChainId?.toLowerCase();

  if (
    normalizedDappChainId &&
    normalizedCurrentChainId &&
    normalizedDappChainId === normalizedCurrentChainId
  ) {
    return 0;
  }

  if (
    normalizedDappChainId &&
    normalizedHiveChainId &&
    normalizedDappChainId === normalizedHiveChainId
  ) {
    return 1;
  }

  return 2;
};

const sortDapps = (
  dapps: DApp[],
  currentChainId?: string,
  hiveChainId?: string,
) => {
  return [...(dapps ?? [])]
    .map((dapp, index) => ({ dapp, index }))
    .sort((left, right) => {
      const priorityDiff =
        getSortPriority(left.dapp, currentChainId, hiveChainId) -
        getSortPriority(right.dapp, currentChainId, hiveChainId);

      if (priorityDiff !== 0) return priorityDiff;

      const leftOrder =
        typeof left.dapp.order === 'number'
          ? left.dapp.order
          : Number.MAX_SAFE_INTEGER;
      const rightOrder =
        typeof right.dapp.order === 'number'
          ? right.dapp.order
          : Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) return leftOrder - rightOrder;

      return left.index - right.index;
    })
    .map(({ dapp }) => dapp);
};

const withChainLogos = async (
  categories: DAppCategory[],
  currentChainId?: string,
): Promise<DAppCategory[]> => {
  const chains = await getDefaultChains();
  const chainLogoMap = getChainLogoMap(chains);
  const hiveChainId = getHiveChainId(chains);

  return categories.map((category) => ({
    ...category,
    dapps: sortDapps(
      (category.dapps ?? []).map((dapp: DApp) => ({
        ...dapp,
        chainLogo:
          typeof dapp.chainId === 'string'
            ? chainLogoMap[dapp.chainId.toLowerCase()]
            : undefined,
      })),
      currentChainId,
      hiveChainId,
    ),
  }));
};

const getDappList = async (
  currentChainId?: string,
): Promise<DAppCategory[] | null> => {
  try {
    const response = (await KeychainApi.get(`ecosystem/dapps`)) as DAppCategory[];
    return await withChainLogos(response ?? [], currentChainId);
  } catch (err) {
    Logger.error('Error while fetching dapp list', err);
    return null;
  }
};

export const EcosystemUtils = { getDappList };
