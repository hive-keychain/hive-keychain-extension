import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import {
  EvmEventName,
  EvmWalletDomainPermissions,
  EvmWalletPermissions,
} from '@interfaces/evm-provider.interface';
import { UserPendingTransactions } from '@popup/evm/interfaces/evm-tokens.interface';
import { UserCanceledTransactions } from '@popup/evm/interfaces/evm-transactions.interface';
import {
  EvmAccount,
  StoredEvmWalletAddress,
  StoredSeed,
  WalletWithBalance,
} from '@popup/evm/interfaces/wallet.interface';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import EncryptUtils from '@popup/hive/utils/encrypt.utils';
import MkUtils from '@popup/hive/utils/mk.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { EthersError, HDNodeWallet, ethers } from 'ethers';
import { sendEvmEvent } from 'src/content-scripts/hive/web-interface/response.logic';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const INITIAL_PATH = "44'/60'/0'/0";

const getWalletFromSeedPhrase = (seed: string) => {
  let wallet: HDNodeWallet | undefined, error;
  let errorParams: string[] = [];
  try {
    wallet = HDNodeWallet.fromPhrase(seed, undefined, INITIAL_PATH);
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
    const derivedWallet: HDNodeWallet = wallet.deriveChild(i);

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

const hideOrShowAddress = async (
  seedId: EvmAccount['seedId'],
  mk: string,
  addressId: number,
  hide: boolean,
) => {
  const savedSeeds = await getAccountsFromLocalStorage(mk);

  const seedIndex = savedSeeds.findIndex((seed) => seed.id === seedId);

  const savedSeed = savedSeeds[seedIndex];

  const addressIndex = savedSeed.accounts.findIndex(
    (account) => account.id === addressId,
  );

  savedSeed.accounts[addressIndex].hide = hide;

  encryptAccountsInLocalStorage(mk, savedSeeds);
};

const updateAddressName = async (
  seedId: EvmAccount['seedId'],
  addressId: number,
  newName: string,
  mk: string,
) => {
  const savedSeeds = await getAccountsFromLocalStorage(mk);

  const seedIndex = savedSeeds.findIndex((seed) => seed.id === seedId);

  const savedSeed = savedSeeds[seedIndex];

  const addressIndex = savedSeed.accounts.findIndex(
    (account) => account.id === addressId,
  );

  savedSeed.accounts[addressIndex].nickname = newName;

  encryptAccountsInLocalStorage(mk, savedSeeds);
};

const addAddressToSeed = async (
  seedId: EvmAccount['seedId'],
  mk: string,
  addressNickname: string,
) => {
  const savedSeeds = await getAccountsFromLocalStorage(mk);

  const seedIndex = savedSeeds.findIndex((account) => account.id === seedId);

  const wallet = HDNodeWallet.fromPhrase(
    savedSeeds[seedIndex].seed,
    undefined,
    INITIAL_PATH,
  );

  const savedSeed = savedSeeds[seedIndex];

  const newAccountIndex =
    savedSeed.accounts.map((e) => e.id).reduce((a, b) => Math.max(a, b), 0) + 1;

  const derivedWallet = wallet.deriveChild(newAccountIndex);

  savedSeeds[seedIndex].accounts.push({
    id: derivedWallet.index,
    path: derivedWallet.path,
    nickname: addressNickname,
  } as StoredEvmWalletAddress);
  encryptAccountsInLocalStorage(mk, savedSeeds);
  return savedSeeds;
};

const addSeedAndAccounts = async (
  wallet: HDNodeWallet,
  accounts: EvmAccount[],
  mk: string,
  nickname?: string,
) => {
  const previousAccounts = await getAccountsFromLocalStorage(mk);
  const id =
    previousAccounts.map((e) => e.id).reduce((a, b) => Math.max(a, b), 0) + 1;
  const newAccounts: StoredSeed = {
    seed: wallet.mnemonic!.phrase,
    nickname: nickname,
    id,
    accounts: accounts.map((derivedWallet) => ({
      id: derivedWallet.id,
      path: derivedWallet.path!,
    })),
  };
  const allAccounts = [...previousAccounts, newAccounts];
  encryptAccountsInLocalStorage(mk, allAccounts);
  return allAccounts;
};

const updateSeedNickname = async (
  seedId: number,
  newNickname: string,
  mk: string,
) => {
  const savedSeeds = await getAccountsFromLocalStorage(mk);

  const seedIndex = savedSeeds.findIndex((account) => account.id === seedId);

  savedSeeds[seedIndex].nickname = newNickname;

  encryptAccountsInLocalStorage(mk, savedSeeds);
  return savedSeeds;
};

const deleteSeed = async (
  seedId: number,
  accounts: EvmAccount[],
  mk: string,
) => {
  let savedSeeds = await getAccountsFromLocalStorage(mk);

  savedSeeds = savedSeeds.filter((seed) => seed.id !== seedId);

  const values = await LocalStorageUtils.getMultipleValueFromLocalStorage([
    LocalStorageKeyEnum.EVM_USER_PENDING_TRANSACTIONS,
    LocalStorageKeyEnum.EVM_USER_CANCELED_TRANSACTIONS,
    LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS,
  ]);

  let userPendingTransactions: UserPendingTransactions =
    values[LocalStorageKeyEnum.EVM_USER_PENDING_TRANSACTIONS];
  let canceledTransactions: UserCanceledTransactions =
    values[LocalStorageKeyEnum.EVM_USER_CANCELED_TRANSACTIONS];
  let walletPermissions: EvmWalletPermissions =
    values[LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS];

  for (const account of accounts.filter(
    (account) => account.seedId === seedId,
  )) {
    if (userPendingTransactions)
      delete userPendingTransactions[account.wallet.address];

    if (canceledTransactions)
      for (const chainId of Object.keys(canceledTransactions)) {
        delete canceledTransactions[chainId][account.wallet.address];
      }

    if (walletPermissions)
      for (const domain of Object.keys(walletPermissions)) {
        for (const key of Object.keys(walletPermissions[domain])) {
          walletPermissions[domain][key as EvmRequestPermission] =
            walletPermissions[domain][key as EvmRequestPermission]!.filter(
              (address) => address !== account.wallet.address,
            );
        }
      }
  }

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_USER_PENDING_TRANSACTIONS,
    userPendingTransactions,
  );
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_USER_CANCELED_TRANSACTIONS,
    canceledTransactions,
  );
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS,
    walletPermissions,
  );

  encryptAccountsInLocalStorage(mk, savedSeeds);
  return savedSeeds;
};

const encryptAccountsInLocalStorage = (
  mk: string,
  evmAccountObject: StoredSeed[],
) => {
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

  if (!wallets) return [];
  else {
    const decryptedAccounts = (EncryptUtils.decryptToJsonWithoutMD5Check(
      wallets,
      mk,
    ).list || []) as StoredSeed[];
    return decryptedAccounts;
  }
};

const rebuildAccountsFromLocalStorage = async (mk: string) => {
  const seeds = await getAccountsFromLocalStorage(mk);
  const test = seeds
    .map((seed) =>
      seed.accounts.map((acc) => {
        const account: EvmAccount = {
          ...acc,
          wallet: HDNodeWallet.fromPhrase(seed.seed, undefined, acc.path),
          seedId: seed.id,
          seedNickname: seed.nickname,
        };
        return account;
      }),
    )
    .flat();
  return test;
};

const rebuildAccount = (account: EvmAccount) => {
  return {
    ...account,
    wallet: HDNodeWallet.fromPhrase(
      account.wallet.mnemonic?.phrase!,
      undefined,
      account.path,
    ),
  };
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
  const permissions = await getWalletPermissionFull(domain);
  const connectedWallet = permissions[EvmRequestPermission.ETH_ACCOUNTS];
  if (permissions && connectedWallet) return connectedWallet;
  else return [];
};

const connectMultipleWallet = async (
  walletAddresses: string[],
  domain: string,
) => {
  for (const walletAddress of walletAddresses) {
    await connectWallet(walletAddress, domain, false);
  }
  const connectedWallets = await getConnectedWallets(domain);
  sendEvmEvent(EvmEventName.ACCOUNT_CHANGED, connectedWallets);
};

const connectWallet = async (
  walletAddress: string,
  domain: string,
  sendEvent = true,
) => {
  await addWalletPermission(
    domain,
    EvmRequestPermission.ETH_ACCOUNTS,
    walletAddress,
  );

  if (sendEvent)
    sendEvmEvent(
      EvmEventName.ACCOUNT_CHANGED,
      await getConnectedWallets(domain),
    );
};

const disconnectWallet = async (walletAddress: string, domain: string) => {
  await removeWalletPermission(
    domain,
    EvmRequestPermission.ETH_ACCOUNTS,
    walletAddress,
  );
  sendEvmEvent(EvmEventName.ACCOUNT_CHANGED, await getConnectedWallets(domain));
};

const disconnectAllWallets = async (domain: string) => {
  await removeWalletPermission(domain, EvmRequestPermission.ETH_ACCOUNTS);
  sendEvmEvent(EvmEventName.ACCOUNT_CHANGED, await getConnectedWallets(domain));
};

const getWalletPermissionFull = async (domain: string) => {
  let walletPermissions: EvmWalletPermissions =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS,
    );
  if (!walletPermissions || !walletPermissions[domain]) return {};

  return walletPermissions[domain];
};

const getWalletPermission = async (domain: string) => {
  let walletPermissions: EvmWalletPermissions =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS,
    );
  if (!walletPermissions || !walletPermissions[domain]) return [];

  return Object.keys(walletPermissions[domain]);
};

const hasPermission = async (
  domain: string,
  permission: EvmRequestPermission,
) => {
  const walletPermissions = await getWalletPermission(domain);

  return !!walletPermissions.includes(permission);
};

const addWalletPermission = async (
  domain: string,
  permission: EvmRequestPermission,
  address?: string,
) => {
  let walletPermissions: EvmWalletPermissions =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS,
    );
  if (!walletPermissions) walletPermissions = {} as EvmWalletPermissions;
  if (!walletPermissions[domain])
    walletPermissions[domain] = {} as EvmWalletDomainPermissions;
  if (!walletPermissions[domain][permission])
    walletPermissions[domain][permission] = [];

  if (address && !walletPermissions[domain][permission]!.includes(address)) {
    walletPermissions[domain][permission]!.push(address);
    sendEvmEvent(
      EvmEventName.ACCOUNT_CHANGED,
      walletPermissions[domain][permission],
    );
  }

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS,
    walletPermissions,
  );
};

const removeWalletPermission = async (
  domain: string,
  permission: EvmRequestPermission,
  address?: string,
) => {
  let walletPermissions: EvmWalletPermissions =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS,
    );
  if (
    !!walletPermissions &&
    !!walletPermissions[domain] &&
    !!walletPermissions[domain][permission]
  ) {
    if (address) {
      const oldPermissions = walletPermissions[domain][permission];

      const newPermission = oldPermissions!.filter((add) => add !== address);

      walletPermissions[domain][permission] = newPermission;
    } else {
      delete walletPermissions[domain][permission];
    }

    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS,
      walletPermissions,
    );
  }
};

const revokeAllPermissions = async (domain: string) => {
  let walletPermissions: EvmWalletPermissions =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS,
    );

  if (walletPermissions && walletPermissions[domain]) {
    delete walletPermissions[domain];
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS,
      walletPermissions,
    );
    sendEvmEvent(EvmEventName.ACCOUNT_CHANGED, []);
  }
};

const getAllLocalAddresses = async () => {
  const accounts = await rebuildAccountsFromLocalStorage(
    await MkUtils.getMkFromLocalStorage(),
  );
  return accounts.map((account) => account.wallet.address.toLowerCase());
};

export const EvmWalletUtils = {
  getWalletFromSeedPhrase,
  deriveWallets,
  createWallet,
  addSeedAndAccounts,
  getAccountsFromLocalStorage,
  rebuildAccountsFromLocalStorage,
  isWalletAddress,
  getConnectedWallets,
  connectWallet,
  connectMultipleWallet,
  disconnectWallet,
  disconnectAllWallets,
  hasPermission,
  addWalletPermission,
  removeWalletPermission,
  revokeAllPermissions,
  getWalletPermission,
  getWalletPermissionFull,
  rebuildAccount,
  getAllLocalAddresses,
  addAddressToSeed,
  deleteSeed,
  hideOrShowAddress,
  updateSeedNickname,
  updateAddressName,
};
