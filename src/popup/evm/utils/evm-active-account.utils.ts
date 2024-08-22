import { EvmSavedActiveAccounts } from '@popup/evm/interfaces/active-account.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const getSavedActiveAccountWallet = async (
  chain: EvmChain | string,
  localAccounts: EvmAccount[],
) => {
  const chainId = typeof chain === 'string' ? chain : chain.chainId;
  const savedActiveAccount: EvmSavedActiveAccounts =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_ACTIVE_ACCOUNT_WALLET,
    );

  if (savedActiveAccount && savedActiveAccount[chainId]) {
    const localAccount = localAccounts.find(
      (localAccount) =>
        localAccount.wallet.address === savedActiveAccount[chainId],
    );
    return localAccount ? localAccount.wallet : localAccounts[0].wallet;
  } else {
    return localAccounts[0].wallet;
  }
};

const saveActiveAccountWallet = async (chain: EvmChain, address: string) => {
  let savedActiveAccounts: EvmSavedActiveAccounts =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_ACTIVE_ACCOUNT_WALLET,
    );

  if (!savedActiveAccounts) {
    savedActiveAccounts = {};
  }
  savedActiveAccounts[chain.chainId] = address;
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_ACTIVE_ACCOUNT_WALLET,
    savedActiveAccounts,
  );
};

export const EvmActiveAccountUtils = {
  getSavedActiveAccountWallet,
  saveActiveAccountWallet,
};
