import { EvmConnectedWallets } from '@interfaces/evm-provider.interface';
import {
  EvmAccount,
  StoredEvmAccounts,
  WalletWithBalance,
} from '@popup/evm/interfaces/wallet.interface';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import EncryptUtils from '@popup/hive/utils/encrypt.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { EthersError, HDNodeWallet, ethers } from 'ethers';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const getWalletFromSeedPhrase = (seed: string) => {
  let wallet: HDNodeWallet | undefined, error;
  let errorParams: string[] = [];
  try {
    wallet = HDNodeWallet.fromPhrase(seed, undefined, "44'/60'/0'/0");
  } catch (e) {
    const ethersError = e as EthersError;
    if (ethersError.shortMessage === 'invalid mnemonic length') {
      error = 'html_popup_evm_invalid_mnemonic_length';
    } else if (ethersError.shortMessage.startsWith('invalid mnemonic word')) {
      error = 'html_popup_evm_invalid_mnemonic_word';
      const wordIndex =
        parseInt(
          ethersError.shortMessage.replace(
            'invalid mnemonic word at index ',
            '',
          ),
        ) + 1;
      errorParams = [wordIndex + ''];
    } else if (ethersError.shortMessage === 'invalid mnemonic checksum') {
      error = 'html_popup_evm_invalid_mnemonic_checksum';
    }
  } finally {
    return { wallet, error, errorParams };
  }
};

const deriveWallets = async (
  wallet: HDNodeWallet,
  chain: EvmChain,
): Promise<WalletWithBalance[]> => {
  const wallets = [];
  let i = 0,
    consecutiveEmptyWallets = 0;
  while (1) {
    const derivedWallet = wallet.deriveChild(i);
    const wei = await EthersUtils.getProvider(chain).getBalance(
      derivedWallet.address,
    );
    const balance = Number(parseFloat(ethers.formatEther(wei)).toFixed(6));
    wallets.push({
      wallet: derivedWallet,
      balance,
      selected: true,
    });
    if (balance === 0) consecutiveEmptyWallets++;
    if (consecutiveEmptyWallets === 2) break;
    i++;
  }
  return wallets.map((e, i) => {
    const length = wallets.length;
    e.selected = i < length - 2 || i === 0;
    return e;
  });
};

const createWallet = () => {
  return ethers.Wallet.createRandom();
};

const saveAccounts = (
  wallet: HDNodeWallet,
  accounts: EvmAccount[],
  mk: string,
) => {
  const evmAccountObject: StoredEvmAccounts = {
    seed: wallet.mnemonic!.phrase,
    accounts: accounts.map((derivedWallet) => ({
      id: derivedWallet.id,
      path: derivedWallet.path!,
    })),
  };
  const encryptedAccounts = EncryptUtils.encryptJson(
    { list: evmAccountObject },
    mk,
  );

  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_ACCOUNTS,
    encryptedAccounts,
  );
};

const getAccountsFromLocalStorage = async (mk: string) => {
  const wallets = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_ACCOUNTS,
  );
  return EncryptUtils.decryptToJsonWithoutMD5Check(wallets, mk)
    .list as StoredEvmAccounts;
};

const rebuildAccountsFromLocalStorage = async (mk: string) => {
  const accounts = await getAccountsFromLocalStorage(mk);
  return accounts.accounts.map((e) => {
    const account: EvmAccount = {
      ...e,
      wallet: HDNodeWallet.fromPhrase(accounts.seed, undefined, e.path),
    };
    return account;
  });
};

const isWalletAddress = async (address: string, chain: EvmChain) => {
  try {
    const code = await EthersUtils.getProvider(chain).getCode(address);
    if (code !== '0x') return false;
  } catch (error) {}
  // if it comes here, then it's not a contract.
  return true;
};

const getConnectedWallets = async (domain: string): Promise<string[]> => {
  const allConnectedWallets: EvmConnectedWallets =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_CONNECTED_WALLETS,
    );
  return allConnectedWallets && allConnectedWallets[domain]
    ? allConnectedWallets[domain]
    : [];
};

const connectWallet = async (walletAddress: string, domain: string) => {
  let allConnectedWallets: EvmConnectedWallets =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_CONNECTED_WALLETS,
    );
  if (!allConnectedWallets) {
    allConnectedWallets = {};
  }
  if (!allConnectedWallets[domain]) {
    allConnectedWallets[domain] = [];
  }
  allConnectedWallets[domain].push(walletAddress);
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_CONNECTED_WALLETS,
    allConnectedWallets,
  );
};

const disconnectWallet = async (walletAddress: string, domain: string) => {
  let allConnectedWallets: EvmConnectedWallets =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_CONNECTED_WALLETS,
    );
  if (!allConnectedWallets) {
    allConnectedWallets = {};
  }
  if (!allConnectedWallets[domain]) {
    allConnectedWallets[domain] = [];
  }
  allConnectedWallets[domain] = allConnectedWallets[domain].filter(
    (e) => e !== walletAddress,
  );
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_CONNECTED_WALLETS,
    allConnectedWallets,
  );
};

const disconnectAllWallets = async (domain: string) => {
  let allConnectedWallets: EvmConnectedWallets =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_CONNECTED_WALLETS,
    );
  if (!allConnectedWallets) {
    allConnectedWallets = {};
  }
  allConnectedWallets[domain] = [];

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_CONNECTED_WALLETS,
    allConnectedWallets,
  );
};

const EvmWalletUtils = {
  getWalletFromSeedPhrase,
  deriveWallets,
  createWallet,
  saveAccounts,
  getAccountsFromLocalStorage,
  rebuildAccountsFromLocalStorage,
  isWalletAddress,
  getConnectedWallets,
  connectWallet,
  disconnectWallet,
  disconnectAllWallets,
};

export default EvmWalletUtils;
