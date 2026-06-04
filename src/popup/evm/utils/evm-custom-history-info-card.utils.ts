import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

type HiddenByChainId = Record<string, boolean>;

const isHiddenForChain = async (
  chainId: string,
): Promise<boolean> => {
  const map = (await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_CUSTOM_HISTORY_INFO_CARD_HIDDEN,
  )) as HiddenByChainId | undefined;
  return map?.[chainId] === true;
};

const setHiddenForChain = async (
  chainId: string,
): Promise<void> => {
  const map =
    ((await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_CUSTOM_HISTORY_INFO_CARD_HIDDEN,
    )) as HiddenByChainId | undefined) ?? {};
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_CUSTOM_HISTORY_INFO_CARD_HIDDEN,
    { ...map, [chainId]: true },
  );
};

export const EvmCustomHistoryInfoCardUtils = {
  isHiddenForChain,
  setHiddenForChain,
};
