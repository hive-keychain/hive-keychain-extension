import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import {
  EvmEventName,
  EvmWalletDomainPermissions,
  EvmWalletPermissions,
} from '@interfaces/evm-provider.interface';
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
import { sendEvmEvent } from 'src/content-scripts/hive/web-interface/response.logic';
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

const addSeedAndAccounts = async (
  wallet: HDNodeWallet,
  accounts: EvmAccount[],
  mk: string,
) => {
  const previousAccounts = await getAccountsFromLocalStorage(mk);
  const id =
    previousAccounts.map((e) => e.id).reduce((a, b) => Math.max(a, b), 0) + 1;
  const evmAccountObject: StoredEvmAccounts = {
    seed: wallet.mnemonic!.phrase,
    id,
    accounts: accounts.map((derivedWallet) => ({
      id: derivedWallet.id,
      path: derivedWallet.path!,
    })),
  };
  encryptAccountsInLocalStorage(mk, [...previousAccounts, evmAccountObject]);
};

const encryptAccountsInLocalStorage = (
  mk: string,
  evmAccountObject: StoredEvmAccounts[],
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
  else
    return (EncryptUtils.decryptToJsonWithoutMD5Check(wallets, mk).list ||
      []) as StoredEvmAccounts[];
};

const rebuildAccountsFromLocalStorage = async (mk: string) => {
  const seeds = await getAccountsFromLocalStorage(mk);
  return seeds
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
    console.log({ walletPermissions }, 'adding permission');
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

export const EvmWalletUtils = {
  getWalletFromSeedPhrase,
  deriveWallets,
  createWallet,
  saveAccounts: addSeedAndAccounts,
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
};
