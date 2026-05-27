import LedgerEthApp from '@ledgerhq/hw-app-eth';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import {
  EvmAccountSource,
  EvmLedgerDerivationMode,
  EvmLedgerWallet,
  EvmWallet,
  StoredEvmLedgerAccount,
} from '@popup/evm/interfaces/wallet.interface';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ethers } from 'ethers';
import { KeychainError } from 'src/keychain-error';

const DEFAULT_EMPTY_ACCOUNT_LIMIT = 2;

let evmLedger: LedgerEthApp;

interface EvmLedgerDerivationConfig {
  labelKey: string;
  buildPath: (accountIndex: number) => string;
  matchPath: (path: string) => RegExpMatchArray | null;
}

interface EvmLedgerPathMetadata {
  path: string;
  derivationMode?: EvmLedgerDerivationMode;
}

interface EvmLedgerDiscoveryOptions {
  derivationMode?: EvmLedgerDerivationMode;
  startIndex?: number;
  emptyAccountLimit?: number;
}

export type EvmLedgerWalletWithBalance = {
  wallet: EvmLedgerWallet;
  balance: number;
  selected: boolean;
};

const LEDGER_DERIVATION_CONFIGS: Record<
  EvmLedgerDerivationMode,
  EvmLedgerDerivationConfig
> = {
  [EvmLedgerDerivationMode.BIP44]: {
    labelKey: 'evm_ledger_derivation_path_bip44',
    buildPath: (accountIndex: number) => `m/44'/60'/0'/0/${accountIndex}`,
    matchPath: (path: string) => path.match(/^m\/44'\/60'\/0'\/0\/(\d+)$/),
  },
  [EvmLedgerDerivationMode.LEDGER_LIVE]: {
    labelKey: 'evm_ledger_derivation_path_ledger_live',
    buildPath: (accountIndex: number) => `m/44'/60'/${accountIndex}'/0/0`,
    matchPath: (path: string) => path.match(/^m\/44'\/60'\/(\d+)'\/0\/0$/),
  },
  [EvmLedgerDerivationMode.LEGACY]: {
    labelKey: 'evm_ledger_derivation_path_legacy',
    buildPath: (accountIndex: number) => `m/44'/60'/0'/${accountIndex}`,
    matchPath: (path: string) => path.match(/^m\/44'\/60'\/0'\/(\d+)$/),
  },
};

const LEDGER_DERIVATION_MODES = [
  EvmLedgerDerivationMode.BIP44,
  EvmLedgerDerivationMode.LEDGER_LIVE,
  EvmLedgerDerivationMode.LEGACY,
];

const getLedgerPath = (path: string) => path.replace(/^m\//, '');

const buildDerivationPath = (
  accountIndex: number,
  derivationMode = EvmLedgerDerivationMode.BIP44,
) => LEDGER_DERIVATION_CONFIGS[derivationMode].buildPath(accountIndex);

const getDerivationModeFromPath = (path: string) => {
  return LEDGER_DERIVATION_MODES.find(
    (derivationMode) =>
      LEDGER_DERIVATION_CONFIGS[derivationMode].matchPath(path) !== null,
  );
};

const getDerivationIndexFromPath = (path: string) => {
  for (const derivationMode of LEDGER_DERIVATION_MODES) {
    const match = LEDGER_DERIVATION_CONFIGS[derivationMode].matchPath(path);
    if (!match) continue;

    return Number(match[1]);
  }
};

const getDerivationModeLabelKey = (derivationMode: EvmLedgerDerivationMode) =>
  LEDGER_DERIVATION_CONFIGS[derivationMode].labelKey;

const getNextDerivationIndex = (
  accounts: EvmLedgerPathMetadata[],
  derivationMode: EvmLedgerDerivationMode,
) => {
  const indexes = accounts
    .filter(
      (account) =>
        (account.derivationMode ??
          EvmLedgerUtils.getDerivationModeFromPath(account.path)) ===
        derivationMode,
    )
    .map((account) => EvmLedgerUtils.getDerivationIndexFromPath(account.path))
    .filter(
      (index): index is number =>
        typeof index === 'number' && Number.isFinite(index),
    );

  return indexes.length === 0 ? 0 : Math.max(...indexes) + 1;
};

const getLedgerStatusCode = (error: any) => {
  const statusCode = Number(error?.statusCode);

  if (!Number.isFinite(statusCode)) {
    return undefined;
  }

  return `0x${statusCode.toString(16).toLowerCase()}`;
};

const getLedgerErrorMessage = (error: any) => {
  if (typeof error?.message === 'string') {
    return error.message;
  }

  if (typeof error?.toString === 'function') {
    return error.toString();
  }

  return '';
};

const isLedgerConnectionError = (error: any, message: string) => {
  const normalizedMessage = message.toLowerCase();

  return (
    error?.name === 'DisconnectedDeviceDuringOperation' ||
    error?.name === 'TransportOpenUserCancelled' ||
    error?.name === 'TransportInterfaceNotAvailable' ||
    error?.id === 'NoDeviceSelected' ||
    normalizedMessage.includes('no device selected') ||
    normalizedMessage.includes('device disconnected')
  );
};

const parseLedgerError = (error: any) => {
  if (error instanceof KeychainError) {
    return error;
  }

  const message = getLedgerErrorMessage(error);
  switch (getLedgerStatusCode(error)) {
    case '0x530c':
    case '0x5515':
    case '0x6982':
      return new KeychainError('evm_ledger_unlock_device');
    case '0x6d00':
    case '0x6e00':
      return new KeychainError('evm_ledger_open_ethereum_app');
    case '0x5501':
    case '0x6985':
      return new KeychainError('error_ledger_denied_by_user', [], error);
  }

  if (error?.name === 'LockedDeviceError') {
    return new KeychainError('evm_ledger_unlock_device');
  }

  if (error?.name === 'EthAppPleaseEnableContractData') {
    return new KeychainError('evm_ledger_enable_blind_signing');
  }

  if (isLedgerConnectionError(error, message)) {
    return new KeychainError('evm_ledger_connect_device');
  }
  console.log('error', error);
  return new KeychainError('evm_ledger_unknown_error', [], error);
};

const init = async (fromTab: boolean): Promise<boolean> => {
  if (!(await EvmLedgerUtils.isLedgerSupported())) {
    throw new KeychainError('html_ledger_not_supported');
  }

  const connectedDevices = await TransportWebUSB.list();
  let transport;
  if (connectedDevices.length === 0) {
    if (fromTab) {
      transport = await TransportWebUSB.request();
    } else {
      throw new KeychainError('evm_ledger_connect_device');
    }
  }

  transport = transport ?? (await TransportWebUSB.create());
  evmLedger = new LedgerEthApp(transport);
  return true;
};

const isLedgerSupported = async () => {
  return await TransportWebUSB.isSupported();
};

const getLedgerInstance = async (): Promise<LedgerEthApp> => {
  if (!evmLedger) {
    await EvmLedgerUtils.init(false);
  } else {
    try {
      await evmLedger.getAppConfiguration();
    } catch (error) {
      await EvmLedgerUtils.init(false);
    }
  }

  return evmLedger;
};

const getAddressFromDerivationPath = async (path: string) => {
  try {
    const ledger = await EvmLedgerUtils.getLedgerInstance();
    const address = await ledger.getAddress(getLedgerPath(path));
    return address.address;
  } catch (error) {
    throw EvmLedgerUtils.parseLedgerError(error);
  }
};

const discoverAccounts = async (
  chain: EvmChain,
  options: EvmLedgerDiscoveryOptions = {},
): Promise<EvmLedgerWalletWithBalance[]> => {
  const provider = await EthersUtils.getProvider(chain);
  const wallets: EvmLedgerWalletWithBalance[] = [];
  const derivationMode =
    options.derivationMode ?? EvmLedgerDerivationMode.BIP44;
  const emptyAccountLimit =
    options.emptyAccountLimit ?? DEFAULT_EMPTY_ACCOUNT_LIMIT;
  let accountIndex = options.startIndex ?? 0;
  let consecutiveEmptyWallets = 0;

  while (consecutiveEmptyWallets < emptyAccountLimit) {
    const path = EvmLedgerUtils.buildDerivationPath(
      accountIndex,
      derivationMode,
    );
    const address = await EvmLedgerUtils.getAddressFromDerivationPath(path);
    const wei = await provider.getBalance(address);
    const balance = Number(parseFloat(ethers.formatEther(wei)).toFixed(6));

    wallets.push({
      wallet: {
        address,
        path,
        index: accountIndex,
        derivationMode,
        source: EvmAccountSource.LEDGER,
      },
      balance,
      selected: true,
    });

    if (balance === 0) {
      consecutiveEmptyWallets++;
    } else {
      consecutiveEmptyWallets = 0;
    }
    accountIndex++;
  }

  return wallets.map((wallet, index) => {
    const shouldSelect = wallet.balance > 0 || index === 0;
    return { ...wallet, selected: shouldSelect };
  });
};

const toStoredLedgerAccount = (
  wallet: EvmWallet,
  nickname = '',
): StoredEvmLedgerAccount => {
  if (!('source' in wallet) || wallet.source !== EvmAccountSource.LEDGER) {
    throw new Error('Cannot store a software wallet as a Ledger account');
  }

  return {
    id: wallet.index,
    address: wallet.address,
    path: wallet.path,
    derivationMode:
      wallet.derivationMode ??
      EvmLedgerUtils.getDerivationModeFromPath(wallet.path),
    ledgerIndex: wallet.index,
    nickname,
  };
};

const signTransaction = async (
  path: string,
  unsignedTransactionHex: string,
) => {
  try {
    const ledger = await EvmLedgerUtils.getLedgerInstance();
    return await ledger.signTransaction(
      getLedgerPath(path),
      unsignedTransactionHex.replace(/^0x/, ''),
      null,
    );
  } catch (error) {
    throw EvmLedgerUtils.parseLedgerError(error);
  }
};

const signPersonalMessage = async (path: string, messageHex: string) => {
  try {
    const ledger = await EvmLedgerUtils.getLedgerInstance();
    return await ledger.signPersonalMessage(
      getLedgerPath(path),
      messageHex.replace(/^0x/, ''),
    );
  } catch (error) {
    throw EvmLedgerUtils.parseLedgerError(error);
  }
};

const signEIP712HashedMessage = async (
  path: string,
  domainSeparatorHex: string,
  hashStructMessageHex: string,
) => {
  try {
    const ledger = await EvmLedgerUtils.getLedgerInstance();
    return await ledger.signEIP712HashedMessage(
      getLedgerPath(path),
      domainSeparatorHex.replace(/^0x/, ''),
      hashStructMessageHex.replace(/^0x/, ''),
    );
  } catch (error) {
    throw EvmLedgerUtils.parseLedgerError(error);
  }
};

export const EvmLedgerUtils = {
  init,
  isLedgerSupported,
  getLedgerInstance,
  getDerivationModeLabelKey,
  getDerivationModeFromPath,
  getDerivationIndexFromPath,
  getNextDerivationIndex,
  buildDerivationPath,
  getAddressFromDerivationPath,
  discoverAccounts,
  toStoredLedgerAccount,
  parseLedgerError,
  signTransaction,
  signPersonalMessage,
  signEIP712HashedMessage,
};
