import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import {
  EvmWalletOriginPermissions,
  EvmWalletPermissions,
} from '@interfaces/evm-provider.interface';
import { EvmPendingTransaction } from '@popup/evm/interfaces/evm-tokens.interface';
import { UserCanceledTransactions } from '@popup/evm/interfaces/evm-transactions.interface';
import {
  EvmAccount,
  StoredEvmWalletAddress,
  StoredSeed,
  WalletWithBalance,
} from '@popup/evm/interfaces/wallet.interface';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import EncryptUtils from '@popup/hive/utils/encrypt.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import { EthersError, HDNodeWallet, ethers } from 'ethers';
import { getHostnameFromUrl } from 'src/utils/browser-origin.utils';
import { normalizeEvmAccounts } from 'src/utils/evm-provider-value.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import VaultUtils from 'src/utils/vault.utils';

const INITIAL_PATH = "44'/60'/0'/0";

const getEvmAccountOrderKey = (seedId: number, addressId: number) =>
  `${seedId}-${addressId}`;

const hasValidAccountOrders = (savedSeeds: StoredSeed[]) => {
  const orders = savedSeeds
    .map((seed) => seed.accounts.map((account) => account.order))
    .flat();

  return (
    orders.every(
      (order) => typeof order === 'number' && Number.isFinite(order),
    ) && new Set(orders).size === orders.length
  );
};

const normalizeSeedAccountOrders = (savedSeeds: StoredSeed[]) => {
  if (hasValidAccountOrders(savedSeeds)) {
    return savedSeeds;
  }

  let order = 0;
  return savedSeeds.map((seed) => ({
    ...seed,
    accounts: seed.accounts.map((account) => ({
      ...account,
      order: order++,
    })),
  }));
};

const getMaxAccountOrder = (savedSeeds: StoredSeed[]) => {
  return savedSeeds
    .map((seed) => seed.accounts.map((account) => account.order ?? -1))
    .flat()
    .reduce((max, current) => Math.max(max, current), -1);
};

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
  const provider = await EthersUtils.getProvider(chain);
  const wallets = [];
  let i = 0,
    consecutiveEmptyWallets = 0;
  while (1) {
    const derivedWallet: HDNodeWallet = wallet.deriveChild(i);

    const wei = await provider.getBalance(derivedWallet.address);
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
  const savedSeeds = normalizeSeedAccountOrders(
    await getAccountsFromLocalStorage(mk),
  );

  const seedIndex = savedSeeds.findIndex((seed) => seed.id === seedId);

  const savedSeed = savedSeeds[seedIndex];

  const addressIndex = savedSeed.accounts.findIndex(
    (account) => account.id === addressId,
  );

  savedSeed.accounts[addressIndex].hide = hide;

  await encryptAccountsInLocalStorage(mk, savedSeeds);
};

const updateAddressName = async (
  seedId: EvmAccount['seedId'],
  addressId: number,
  newName: string,
  mk: string,
) => {
  const savedSeeds = normalizeSeedAccountOrders(
    await getAccountsFromLocalStorage(mk),
  );

  const seedIndex = savedSeeds.findIndex((seed) => seed.id === seedId);

  const savedSeed = savedSeeds[seedIndex];

  const addressIndex = savedSeed.accounts.findIndex(
    (account) => account.id === addressId,
  );

  savedSeed.accounts[addressIndex].nickname = newName;

  await encryptAccountsInLocalStorage(mk, savedSeeds);
};

const addAddressToSeed = async (
  seedId: EvmAccount['seedId'],
  mk: string,
  addressNickname: string,
) => {
  const savedSeeds = normalizeSeedAccountOrders(
    await getAccountsFromLocalStorage(mk),
  );

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
    order: getMaxAccountOrder(savedSeeds) + 1,
    nickname: addressNickname,
  } as StoredEvmWalletAddress);
  await encryptAccountsInLocalStorage(mk, savedSeeds);
  return savedSeeds;
};

const addSeedAndAccounts = async (
  wallet: HDNodeWallet,
  accounts: EvmAccount[],
  mk: string,
  nickname?: string,
) => {
  const previousAccounts = normalizeSeedAccountOrders(
    await getAccountsFromLocalStorage(mk),
  );
  const id =
    previousAccounts.map((e) => e.id).reduce((a, b) => Math.max(a, b), 0) + 1;
  let nextOrder = getMaxAccountOrder(previousAccounts) + 1;
  const newAccounts: StoredSeed = {
    seed: wallet.mnemonic!.phrase,
    nickname: nickname,
    id,
    accounts: accounts.map((derivedWallet) => ({
      id: derivedWallet.id,
      path: derivedWallet.path!,
      order: nextOrder++,
      nickname: derivedWallet.nickname ?? '',
    })),
  };
  const allAccounts = [...previousAccounts, newAccounts];
  await encryptAccountsInLocalStorage(mk, allAccounts);
  return newAccounts.accounts;
};

const updateSeedNickname = async (
  seedId: number,
  newNickname: string,
  mk: string,
) => {
  const savedSeeds = normalizeSeedAccountOrders(
    await getAccountsFromLocalStorage(mk),
  );

  const seedIndex = savedSeeds.findIndex((account) => account.id === seedId);

  savedSeeds[seedIndex].nickname = newNickname;

  await encryptAccountsInLocalStorage(mk, savedSeeds);
  return savedSeeds;
};

const deleteSeed = async (
  seedId: number,
  accounts: EvmAccount[],
  mk: string,
) => {
  let savedSeeds = normalizeSeedAccountOrders(
    await getAccountsFromLocalStorage(mk),
  );

  savedSeeds = savedSeeds.filter((seed) => seed.id !== seedId);

  const values = await LocalStorageUtils.getMultipleValueFromLocalStorage([
    LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS,
    LocalStorageKeyEnum.EVM_CANCELED_TRANSACTIONS,
    LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS,
  ]);

  const seedAccounts = accounts.filter((account) => account.seedId === seedId);
  let pendingTransactions: EvmPendingTransaction[] = Array.isArray(
    values[LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS],
  )
    ? values[LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS]
    : [];
  let canceledTransactions: UserCanceledTransactions =
    values[LocalStorageKeyEnum.EVM_CANCELED_TRANSACTIONS];
  let walletPermissions: EvmWalletPermissions =
    values[LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS];

  pendingTransactions = pendingTransactions.filter(
    (transaction) =>
      !seedAccounts.some(
        (account) =>
          account.wallet.address.toLowerCase() ===
          transaction.walletAddress.toLowerCase(),
      ),
  );

  for (const account of seedAccounts) {
    if (canceledTransactions)
      for (const chainId of Object.keys(canceledTransactions)) {
        delete canceledTransactions[chainId][account.wallet.address];
      }

    if (walletPermissions)
      for (const origin of Object.keys(walletPermissions)) {
        for (const key of Object.keys(walletPermissions[origin])) {
          walletPermissions[origin][key as EvmRequestPermission] =
            walletPermissions[origin][key as EvmRequestPermission]!.filter(
              (address) => address !== account.wallet.address.toLowerCase(),
            );
        }
      }
  }

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS,
    pendingTransactions,
  );
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_CANCELED_TRANSACTIONS,
    canceledTransactions,
  );
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS,
    walletPermissions,
  );

  await encryptAccountsInLocalStorage(mk, savedSeeds);
  return savedSeeds;
};

const encryptAccountsInLocalStorage = async (
  mk: string,
  evmAccountObject: StoredSeed[],
) => {
  const encryptedAccounts = await EncryptUtils.encryptJson(
    { list: evmAccountObject },
    mk,
  );

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_ACCOUNTS,
    encryptedAccounts,
  );
};

const getAccountsFromLocalStorage = async (mk: string) => {
  const wallets = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_ACCOUNTS,
  );

  if (!wallets || Object.keys(wallets).length === 0) return [];
  else {
    const decryptResult = await EncryptUtils.decryptToJsonWithLegacySupport(
      wallets,
      mk,
    );
    const decryptedAccounts = (decryptResult?.list ?? []) as StoredSeed[];
    return decryptedAccounts;
  }
};

const rebuildAccountsFromLocalStorage = async (mk: string) => {
  const seeds = normalizeSeedAccountOrders(
    await getAccountsFromLocalStorage(mk),
  );
  return seeds
    .map((seed) =>
      seed.accounts.map((account) => ({
        order: account.order ?? 0,
        account: {
          ...account,
          wallet: HDNodeWallet.fromPhrase(seed.seed, undefined, account.path),
          seedId: seed.id,
          seedNickname: seed.nickname,
        } as EvmAccount,
      })),
    )
    .flat()
    .sort((first, second) => first.order - second.order)
    .map(({ account }) => account);
};

const reorderAccounts = async (
  orderedVisibleAccounts: Pick<EvmAccount, 'id' | 'seedId'>[],
  mk: string,
) => {
  const savedSeeds = normalizeSeedAccountOrders(
    await getAccountsFromLocalStorage(mk),
  );
  const orderedVisibleKeys = orderedVisibleAccounts.map((account) =>
    getEvmAccountOrderKey(account.seedId, account.id),
  );
  const visibleKeys = new Set(orderedVisibleKeys);

  const flattenedAccounts = savedSeeds
    .map((seed) =>
      seed.accounts.map((account) => ({
        key: getEvmAccountOrderKey(seed.id, account.id),
        hidden: !!account.hide,
      })),
    )
    .flat();

  let visibleIndex = 0;
  const mergedOrder = flattenedAccounts.map(({ key, hidden }) => {
    if (hidden || !visibleKeys.has(key)) {
      return key;
    }

    const reorderedKey = orderedVisibleKeys[visibleIndex];
    visibleIndex += 1;
    return reorderedKey ?? key;
  });

  const accountOrderByKey = new Map(
    mergedOrder.map((key, index) => [key, index] as const),
  );

  const reorderedSeeds = savedSeeds.map((seed) => ({
    ...seed,
    accounts: seed.accounts.map((account) => ({
      ...account,
      order:
        accountOrderByKey.get(getEvmAccountOrderKey(seed.id, account.id)) ??
        account.order,
    })),
  }));

  await encryptAccountsInLocalStorage(mk, reorderedSeeds);
  return rebuildAccountsFromLocalStorage(mk);
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
    const provider = await EthersUtils.getProvider(chain);
    const code = await provider.getCode(address);
    if (code === '0x' || code.startsWith('0xef0100')) return true;
    else return false;
  } catch (error) {}
  // if it comes here, then it's not a contract.
  return true;
};

const getStoredWalletPermissions = async (): Promise<EvmWalletPermissions> => {
  return (
    (await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS,
    )) ?? {}
  );
};

const saveWalletPermissions = async (
  walletPermissions: EvmWalletPermissions,
) => {
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS,
    walletPermissions,
  );
};

const normalizeWalletPermissionEntry = (
  walletPermissions: EvmWalletOriginPermissions = {},
) => {
  const normalizedPermissions = {} as EvmWalletOriginPermissions;

  for (const [permissionKey, addresses] of Object.entries(walletPermissions)) {
    const normalizedAddresses = normalizeEvmAccounts(addresses);
    if (!normalizedAddresses.length) {
      continue;
    }

    normalizedPermissions[permissionKey as EvmRequestPermission] =
      normalizedAddresses;
  }

  return normalizedPermissions;
};

const areWalletPermissionEntriesEqual = (
  left: EvmWalletOriginPermissions = {},
  right: EvmWalletOriginPermissions = {},
) => {
  const permissions = new Set([
    ...Object.keys(left),
    ...Object.keys(right),
  ] as EvmRequestPermission[]);

  for (const permission of permissions) {
    const leftAddresses = left[permission] ?? [];
    const rightAddresses = right[permission] ?? [];

    if (leftAddresses.length !== rightAddresses.length) {
      return false;
    }

    if (
      leftAddresses.some((address, index) => rightAddresses[index] !== address)
    ) {
      return false;
    }
  }

  return true;
};

const getOriginPermissionEntry = (
  origin: string,
  walletPermissions: EvmWalletPermissions,
) => {
  const exactOriginPermissions = walletPermissions[origin];
  if (exactOriginPermissions) {
    const normalizedPermissions = normalizeWalletPermissionEntry(
      exactOriginPermissions,
    );
    walletPermissions[origin] = normalizedPermissions;
    return {
      permissions: normalizedPermissions,
      shouldSave: !areWalletPermissionEntriesEqual(
        exactOriginPermissions,
        normalizedPermissions,
      ),
    };
  }

  const legacyHostname = getHostnameFromUrl(origin);
  if (!legacyHostname || !walletPermissions[legacyHostname]) {
    return {
      permissions: {} as EvmWalletOriginPermissions,
      shouldSave: false,
    };
  }

  const normalizedPermissions = normalizeWalletPermissionEntry(
    walletPermissions[legacyHostname],
  );
  walletPermissions[legacyHostname] = normalizedPermissions;
  walletPermissions[origin] = normalizeWalletPermissionEntry(
    normalizedPermissions,
  );

  return { permissions: walletPermissions[origin], shouldSave: true };
};

const connectWallet = async (walletAddress: string, origin: string) => {
  return addWalletPermission(
    origin,
    EvmRequestPermission.ETH_ACCOUNTS,
    walletAddress,
  );
};

const disconnectWallet = async (walletAddress: string, origin: string) => {
  return removeWalletPermission(
    origin,
    EvmRequestPermission.ETH_ACCOUNTS,
    walletAddress,
  );
};

const setWalletPermissionAddresses = async (
  origin: string,
  permission: EvmRequestPermission,
  addresses: string[],
) => {
  const walletPermissions = await getStoredWalletPermissions();
  const { permissions: originPermissions } = getOriginPermissionEntry(
    origin,
    walletPermissions,
  );
  const normalizedAddresses = normalizeEvmAccounts(addresses);

  if (normalizedAddresses.length) {
    originPermissions[permission] = normalizedAddresses;
  } else {
    delete originPermissions[permission];
  }

  walletPermissions[origin] = originPermissions;
  await saveWalletPermissions(walletPermissions);

  return originPermissions[permission] ?? [];
};

const setConnectedWallets = async (
  origin: string,
  walletAddresses: string[],
) => {
  return setWalletPermissionAddresses(
    origin,
    EvmRequestPermission.ETH_ACCOUNTS,
    walletAddresses,
  );
};

const getConnectedWallets = async (origin: string): Promise<string[]> => {
  const permissions = await getWalletPermissionFull(origin);
  return (
    permissions[EvmRequestPermission.ETH_ACCOUNTS]?.map((address) =>
      address.toLowerCase(),
    ) ?? []
  );
};

const connectMultipleWallet = async (
  walletAddresses: string[],
  origin: string,
) => {
  const connectedWallets = await getConnectedWallets(origin);
  return setConnectedWallets(origin, [...connectedWallets, ...walletAddresses]);
};

const disconnectAllWallets = async (origin: string) => {
  return setConnectedWallets(origin, []);
};

const getWalletPermissionFull = async (origin: string) => {
  const walletPermissions = await getStoredWalletPermissions();
  const { permissions, shouldSave } = getOriginPermissionEntry(
    origin,
    walletPermissions,
  );

  if (shouldSave) {
    await saveWalletPermissions(walletPermissions);
  }

  return permissions;
};

const getWalletPermission = async (origin: string) => {
  return Object.keys(await getWalletPermissionFull(origin));
};

const hasPermission = async (
  origin: string,
  permission: EvmRequestPermission,
) => {
  const walletPermissions = await getWalletPermission(origin);

  return walletPermissions.includes(permission);
};

const addWalletPermission = async (
  origin: string,
  permission: EvmRequestPermission,
  address?: string,
) => {
  const walletPermissions = await getStoredWalletPermissions();
  const { permissions: originPermissions, shouldSave } =
    getOriginPermissionEntry(origin, walletPermissions);
  const currentAddresses = originPermissions[permission] ?? [];
  const normalizedAddress = normalizeEvmAccounts(address ? [address] : [])[0];
  const nextAddresses = normalizedAddress
    ? [...currentAddresses, normalizedAddress]
    : currentAddresses;

  originPermissions[permission] = normalizeEvmAccounts(nextAddresses);
  walletPermissions[origin] = originPermissions;

  if (shouldSave || normalizedAddress !== undefined) {
    await saveWalletPermissions(walletPermissions);
  }

  return originPermissions[permission] ?? [];
};

const removeWalletPermission = async (
  origin: string,
  permission: EvmRequestPermission,
  address?: string,
) => {
  const walletPermissions = await getStoredWalletPermissions();
  const { permissions: originPermissions, shouldSave } =
    getOriginPermissionEntry(origin, walletPermissions);
  const currentAddresses = originPermissions[permission] ?? [];
  const normalizedAddress = normalizeEvmAccounts(address ? [address] : [])[0];

  if (normalizedAddress) {
    originPermissions[permission] = currentAddresses.filter(
      (savedAddress) => savedAddress !== normalizedAddress,
    );
  } else {
    delete originPermissions[permission];
  }

  if (!originPermissions[permission]?.length) {
    delete originPermissions[permission];
  }

  walletPermissions[origin] = originPermissions;
  if (
    shouldSave ||
    normalizedAddress !== undefined ||
    currentAddresses.length
  ) {
    await saveWalletPermissions(walletPermissions);
  }

  return originPermissions[permission] ?? [];
};

const revokeAllPermissions = async (origin: string) => {
  const walletPermissions = await getStoredWalletPermissions();
  getOriginPermissionEntry(origin, walletPermissions);
  walletPermissions[origin] = {} as EvmWalletOriginPermissions;

  await saveWalletPermissions(walletPermissions);
};

const getAllLocalAddresses = async () => {
  const accounts = await rebuildAccountsFromLocalStorage(
    await VaultUtils.getValueFromVault(VaultKey.__MK),
  );
  return accounts.map((account) => account.wallet.address.toLowerCase());
};
const getAllLocalAccounts = async () => {
  const accounts = await rebuildAccountsFromLocalStorage(
    await VaultUtils.getValueFromVault(VaultKey.__MK),
  );
  return accounts;
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
  setConnectedWallets,
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
  reorderAccounts,
  updateSeedNickname,
  updateAddressName,
  getAllLocalAccounts,
};
