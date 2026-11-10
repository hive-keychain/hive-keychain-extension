import { EvmSavedActiveAccount } from '@popup/evm/interfaces/active-account.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

type LegacyEvmSavedActiveAccounts = Record<string, string>;

const getVisibleAccountWallet = (
  address: string | undefined,
  localAccounts: EvmAccount[],
) => {
  if (address) {
    const localAccount = localAccounts.find(
      (localAccount) => localAccount.wallet.address === address,
    );
    if (localAccount && !localAccount.hide) {
      return localAccount.wallet;
    }
  }
  return localAccounts.filter((localAccount) => !localAccount.hide)[0].wallet;
};

const getLegacySavedAddress = (
  savedActiveAccount: LegacyEvmSavedActiveAccounts,
  localAccounts: EvmAccount[],
) => {
  return Object.values(savedActiveAccount).find((address) =>
    localAccounts.some(
      (localAccount) =>
        !localAccount.hide && localAccount.wallet.address === address,
    ),
  );
};

const getSavedActiveAccountWallet = async (localAccounts: EvmAccount[]) => {
  const savedActiveAccount:
    | EvmSavedActiveAccount
    | LegacyEvmSavedActiveAccounts =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_ACTIVE_ACCOUNT_WALLET,
    );

  if (
    savedActiveAccount &&
    typeof savedActiveAccount === 'object' &&
    !Array.isArray(savedActiveAccount)
  ) {
    return getVisibleAccountWallet(
      getLegacySavedAddress(savedActiveAccount, localAccounts),
      localAccounts,
    );
  }

  return getVisibleAccountWallet(
    typeof savedActiveAccount === 'string' ? savedActiveAccount : undefined,
    localAccounts,
  );
};

const saveActiveAccountWallet = async (address: string) => {
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_ACTIVE_ACCOUNT_WALLET,
    address,
  );
};

export const EvmActiveAccountUtils = {
  getSavedActiveAccountWallet,
  saveActiveAccountWallet,
};
