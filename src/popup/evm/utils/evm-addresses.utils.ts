import {
  AutoCompleteCategory,
  AutoCompleteValue,
  AutoCompleteValues,
} from '@interfaces/autocomplete.interface';
import { FavoriteAddress } from '@interfaces/contacts.interface';
import {
  EvmAddressType,
  EvmWhitelistedAddresses,
} from '@popup/evm/interfaces/evm-addresses.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmAccountUtils } from '@popup/evm/utils/evm-account.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { ethers } from 'ethers';
import * as jdenticon from 'jdenticon';
import { ColorsUtils } from 'src/utils/colors.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { v4 } from 'uuid';

// const ENS_EXPIRATION_TIME = 60000;

export interface SavedEns {
  ens?: string;
  address: string;
  avatar?: string;
  expirationDate?: number;
}

export interface EvmAddressDetail {
  label?: string;
  fullAddress: string;
  formattedAddress: string;
  avatar?: string;
}

const getSavedEnsFromStorage = async (): Promise<SavedEns[]> => {
  let savedEnsList = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_ENS,
  );
  return savedEnsList
    ? savedEnsList.filter((ens: SavedEns) => ens.expirationDate! > Date.now())
    : [];
};

const getEnsDataFromAddress = async (address: string) => {
  let savedEnsList = await getSavedEnsFromStorage();
  let savedEns = savedEnsList.find((ens) => ens.address === address);
  return savedEns;
};

const getEnsDataFromEns = async (ensName: string) => {
  let savedEnsList = await getSavedEnsFromStorage();
  let savedEns = savedEnsList.find((ens) => ens.ens === ensName);
  return savedEns;
};

const addEnsToLocalStorage = async (newEns: SavedEns) => {
  const savedEns = await getSavedEnsFromStorage();
  savedEns.push({
    ...newEns,
    expirationDate: Date.now() + Number(process.env.EVM_DATA_EXPIRATION_TIME),
  });
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_ENS,
    savedEns,
  );
};

const getAddressDetails = async (
  address: string,
  chainId: string,
): Promise<EvmAddressDetail> => {
  const details: EvmAddressDetail = {
    fullAddress: '',
    formattedAddress: '',
  };

  let newEns: SavedEns = {
    address: '',
    expirationDate: Date.now() + Number(process.env.EVM_DATA_EXPIRATION_TIME),
  };
  const [savedEnsDataFromAddress, savedEnsDataFromEns] = await Promise.all([
    EvmAddressesUtils.getEnsDataFromAddress(address),
    EvmAddressesUtils.getEnsDataFromEns(address),
  ]);
  const isAddress = ethers.isAddress(address);
  let ensDetected = false;
  if (!savedEnsDataFromAddress && !savedEnsDataFromEns) {
    details.fullAddress = address;
    details.formattedAddress = EvmFormatUtils.formatAddress(
      details.fullAddress,
    );
    details.avatar = undefined;
    details.label = details.formattedAddress;
    if (isAddress === false) {
      newEns.ens = address;
      const ensData = await EvmRequestsUtils.getDataForEns(address);
      if (ensData) {
        ensDetected = true;
        newEns.avatar = ensData.avatar ?? undefined;
        newEns.address = ensData.address ?? '';
      }
    } else {
      newEns.address = address;
      const ensFound = await EvmRequestsUtils.getEnsForAddress(address);
      if (ensFound) {
        ensDetected = true;
        newEns.ens = ensFound;
        const resolveData = await EvmRequestsUtils.getDataForEns(ensFound);
        if (resolveData) {
          newEns.avatar = resolveData.avatar ?? undefined;
        }
      }
    }
    if (ensDetected) {
      details.avatar = newEns.avatar;
      details.label = newEns.ens;
      await addEnsToLocalStorage(newEns);
    }
  } else if (savedEnsDataFromAddress && savedEnsDataFromAddress.ens) {
    details.label = savedEnsDataFromAddress.ens;
    details.fullAddress = savedEnsDataFromAddress.address;
    details.formattedAddress = EvmFormatUtils.formatAddress(
      details.fullAddress,
    );
    details.avatar = savedEnsDataFromAddress.avatar;
  } else if (savedEnsDataFromEns && savedEnsDataFromEns.ens) {
    details.label = savedEnsDataFromEns.ens;
    details.fullAddress = savedEnsDataFromEns.address;
    details.formattedAddress = EvmFormatUtils.formatAddress(
      details.fullAddress,
    );
    details.avatar = savedEnsDataFromEns.avatar;
  } else {
    details.fullAddress = ensDetected ? newEns.address : address;
    details.formattedAddress = EvmFormatUtils.formatAddress(
      details.fullAddress,
    );
    details.avatar = ensDetected ? newEns.avatar : undefined;
    details.label = ensDetected ? newEns.ens : details.formattedAddress;
  }

  // get local label
  const localLabel = await EvmAddressesUtils.getAddressLabel(address, chainId);
  if (localLabel) {
    details.label = localLabel;
  }

  // check local accounts
  const localAccounts = await EvmWalletUtils.getAllLocalAccounts();
  const localAccount = localAccounts.find((account) => {
    return account.wallet.address.toLowerCase() === address.toLowerCase();
  });
  if (localAccount) {
    if (localAccount.nickname) {
      details.label = localAccount.nickname;
    } else {
      details.label = EvmAccountUtils.getAccountFullname(localAccount);
    }
  }

  return details;
};

const getAddressType = async (
  address: string,
  chain: EvmChain,
): Promise<EvmAddressType> => {
  let savedAddresses = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_SAVED_ADDRESSES,
  );

  if (!savedAddresses) savedAddresses = {};
  if (!savedAddresses[chain.chainId]) savedAddresses[chain.chainId] = {};
  if (!savedAddresses[chain.chainId][address]) {
    const isWalletAddress = await EvmWalletUtils.isWalletAddress(
      address,
      chain,
    );
    savedAddresses[chain.chainId][address] = isWalletAddress
      ? EvmAddressType.WALLET_ADDRESS
      : EvmAddressType.SMART_CONTRACT;
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.EVM_SAVED_ADDRESSES,
      savedAddresses,
    );
  }

  return savedAddresses[chain.chainId][address];
};

const getIdenticonFromAddress = (address: string) => {
  const svgString = jdenticon.toSvg(address, 32);
  const backgroundColor = ColorsUtils.getBackgroundColor(
    `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`,
  );
  return {
    svg: jdenticon.toSvg(address, 32, {
      backColor: backgroundColor,
      padding: 0.2,
    }),
    backgroundColor: backgroundColor,
  };
  // return generate(address, { generator: 'overlappingCircles' }).toDataUrl();
  // return generate(address, { generator: 'chevrons' }).toDataUrl();
  // return identicon(address, 90, 50);
};

const getAllWhitelistedAddresses = async (): Promise<string[]> => {
  let addresses: string[] = [];

  const whitelistedAddresses: EvmWhitelistedAddresses =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_WHITELISTED_ADDRESSES,
    );

  if (!whitelistedAddresses) return [];

  for (const allAddresses of Object.values(whitelistedAddresses)) {
    addresses = [
      ...addresses,
      ...allAddresses[EvmAddressType.WALLET_ADDRESS].map(
        (address: FavoriteAddress) => address.address.toLowerCase(),
      ),
    ];
  }

  return addresses;
};

const getWhitelistedAddresses = async (
  chainId: string,
): Promise<EvmWhitelistedAddresses> => {
  const whitelistedAddresses = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_WHITELISTED_ADDRESSES,
  );

  if (!whitelistedAddresses || !whitelistedAddresses[chainId]) {
    return {
      [EvmAddressType.SMART_CONTRACT]: [],
      [EvmAddressType.WALLET_ADDRESS]: [],
    };
  }

  return whitelistedAddresses[chainId];
};

const saveWhitelistedAddresses = async (
  chainId: string,
  whitelistedAddresses: EvmWhitelistedAddresses,
) => {
  let allChainWhitelistedAddresses =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_WHITELISTED_ADDRESSES,
    );
  if (!allChainWhitelistedAddresses) allChainWhitelistedAddresses = {};
  allChainWhitelistedAddresses[chainId] = whitelistedAddresses;
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_WHITELISTED_ADDRESSES,
    allChainWhitelistedAddresses,
  );
};

const saveContractAddress = async (
  contractAddress: string,
  chainId: string,
  label?: string,
  id?: string,
) => {
  const whitelistedAddresses = await getWhitelistedAddresses(chainId);
  whitelistedAddresses[EvmAddressType.SMART_CONTRACT].push({
    id: id ?? v4(),
    address: contractAddress,
    label: label,
  });

  await saveWhitelistedAddresses(chainId, whitelistedAddresses);
};

const getContractAddresses = async (chainId: string) => {
  let whitelistedAddresses = await getWhitelistedAddresses(chainId);
  return whitelistedAddresses[EvmAddressType.SMART_CONTRACT];
};

const updateAddress = async (
  chainId: string,
  updatedFavorite: FavoriteAddress,
  addressType: EvmAddressType,
) => {
  const whitelistedAddresses = await getWhitelistedAddresses(chainId);
  const addressItemIndex = whitelistedAddresses[addressType].findIndex(
    (item) => item.id === updatedFavorite.id,
  );
  if (addressItemIndex !== -1) {
    whitelistedAddresses[addressType][addressItemIndex] = updatedFavorite;
  }
  await saveWhitelistedAddresses(chainId, whitelistedAddresses);
};

const deleteAddress = async (
  chainId: string,
  id: string,
  addressType: EvmAddressType,
) => {
  const whitelistedAddresses = await getWhitelistedAddresses(chainId);
  whitelistedAddresses[addressType] = whitelistedAddresses[addressType].filter(
    (item) => item.id !== id,
  );
  await saveWhitelistedAddresses(chainId, whitelistedAddresses);
};

const saveWalletAddress = async (
  chainId: string,
  walletAddress: string,
  label?: string,
  id?: string,
) => {
  const whitelistedAddresses = await getWhitelistedAddresses(chainId);
  whitelistedAddresses[EvmAddressType.WALLET_ADDRESS].push({
    id: id ?? v4(),
    address: walletAddress,
    label: label,
  });

  await saveWhitelistedAddresses(chainId, whitelistedAddresses);
};

const getWalletAddresses = async (chainId: string) => {
  let whitelistedAddresses = await getWhitelistedAddresses(chainId);
  return whitelistedAddresses[EvmAddressType.WALLET_ADDRESS];
};

const saveDomainAddress = async (domainAddress: string) => {
  let domains = await getDomainAddresses();
  domains.push(domainAddress);
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_KNOWN_DOMAINS,
    domains,
  );
};

const getDomainAddresses = async () => {
  const domains = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_KNOWN_DOMAINS,
  );
  return domains ?? [];
};

const isWhitelisted = async (
  address: string,
  chainId: string,
  localAccounts: EvmAccount[],
) => {
  const whitelisted = await getWhitelistedAddresses(chainId);

  return (
    localAccounts
      .map((localAccount) => localAccount.wallet.address.toLowerCase())
      .includes(address.toLowerCase()) ||
    whitelisted[EvmAddressType.SMART_CONTRACT]
      .map((item) => item.address.toLowerCase())
      .includes(address.toLowerCase()) ||
    whitelisted[EvmAddressType.WALLET_ADDRESS]
      .map((item) => item.address.toLowerCase())
      .includes(address.toLowerCase())
  );
};

const getAddressLabel = async (address: string, chainId: string) => {
  const whitelistedAddresses = await getWhitelistedAddresses(chainId);
  let whitelistedItem = whitelistedAddresses[
    EvmAddressType.SMART_CONTRACT
  ].find((whitelistedAddress) => whitelistedAddress.address === address);
  if (whitelistedItem) return whitelistedItem.label;
  else
    whitelistedItem = whitelistedAddresses[EvmAddressType.WALLET_ADDRESS].find(
      (whitelistedAddress) => whitelistedAddress.address === address,
    );
  return whitelistedItem?.label;
};

const isPotentialSpoofing = async (address: string) => {
  const whitelistedAddresses = await getAllWhitelistedAddresses();
  const myAddressStart = address.substring(0, 6).toLowerCase();
  const myAddressEnd = address.substring(address.length - 4).toLowerCase();

  for (const whitelistedAddress of whitelistedAddresses) {
    const addressStart = whitelistedAddress.substring(0, 6).toLowerCase();
    const addressEnd = whitelistedAddress
      .substring(whitelistedAddress.length - 4)
      .toLowerCase();

    if (
      whitelistedAddress.toLowerCase() !== address.toLowerCase() &&
      (myAddressStart === addressStart || myAddressEnd === addressEnd)
    )
      return {
        errorMessage: 'evm_transaction_receiver_potential_spoofing_whitelisted',
        address: whitelistedAddress,
      };
  }

  const localAddresses = await EvmWalletUtils.getAllLocalAddresses();

  for (const localAddress of localAddresses) {
    const addressStart = localAddress.substring(0, 4).toLowerCase();
    const addressEnd = localAddress
      .substring(localAddress.length - 4)
      .toLowerCase();
    if (
      localAddress.toLowerCase() !== address.toLowerCase() &&
      (myAddressStart === addressStart || myAddressEnd === addressEnd)
    )
      return {
        errorMessage:
          'evm_transaction_receiver_potential_spoofing_local_accounts',
        address: localAddress,
      };
  }
};

const getWhiteListAutocomplete = async (
  chain: EvmChain,
  localAccounts: EvmAccount[],
  walletAddress: string,
) => {
  const wallets = await getWalletAddresses(chain.chainId);

  const localAddresses = localAccounts.map((localAccount) =>
    localAccount.wallet.address.toLowerCase(),
  );

  const autocomplete = {
    categories: [],
  } as AutoCompleteValues;

  const walletCategory: AutoCompleteCategory = {
    title: 'evm_wallets',
    translateTitle: true,
    values: [],
  };
  const localAccountCategory: AutoCompleteCategory = {
    title: 'local_accounts',
    translateTitle: true,
    values: [],
  };

  const filteredWallets = wallets.filter(
    (w) => !localAddresses.includes(w.address.toLowerCase()),
  );
  const filteredLocalAccounts = localAccounts.filter(
    (la) => walletAddress.toLowerCase() !== la.wallet.address.toLowerCase(),
  );

  // Fetch address details in parallel instead of sequentially
  const [walletDetails, localAccountDetails] = await Promise.all([
    Promise.all(
      filteredWallets.map((w) => getAddressDetails(w.address, chain.chainId)),
    ),
    Promise.all(
      filteredLocalAccounts.map((la) =>
        getAddressDetails(la.wallet.address, chain.chainId),
      ),
    ),
  ]);

  for (let i = 0; i < filteredWallets.length; i++) {
    const wallet = filteredWallets[i];
    const details = walletDetails[i];
    walletCategory.values.push({
      value: wallet.address,
      label:
        wallet.label?.length && wallet.label.length > 0
          ? wallet.label
          : EvmFormatUtils.formatAddress(wallet.address),
      subLabel:
        wallet.label?.length && wallet.label.length > 0
          ? EvmFormatUtils.formatAddress(wallet.address)
          : '',
      img:
        details.avatar ??
        `data:image/svg+xml;utf8,${encodeURIComponent(
          getIdenticonFromAddress(wallet.address).svg,
        )}`,
    } as AutoCompleteValue);
  }

  for (let i = 0; i < filteredLocalAccounts.length; i++) {
    const localAccount = filteredLocalAccounts[i];
    const details = localAccountDetails[i];
    localAccountCategory.values.push({
      value: localAccount.wallet.address,
      label: EvmAccountUtils.getAccountFullname(localAccount),
      subLabel: EvmFormatUtils.formatAddress(localAccount.wallet.address),
      img:
        details.avatar ??
        `data:image/svg+xml;utf8,${encodeURIComponent(
          getIdenticonFromAddress(localAccount.wallet.address).svg,
        )}`,
    } as AutoCompleteValue);
  }

  autocomplete.categories.push(walletCategory);
  autocomplete.categories.push(localAccountCategory);
  return autocomplete;
};

export const EvmAddressesUtils = {
  getAddressType,
  getIdenticonFromAddress,
  getWalletAddresses,
  getContractAddresses,
  getDomainAddresses,
  saveWalletAddress,
  saveContractAddress,
  saveDomainAddress,
  isWhitelisted,
  getAddressLabel,
  isPotentialSpoofing,
  getAddressDetails,
  addEnsToLocalStorage,
  getEnsDataFromAddress,
  getEnsDataFromEns,
  getWhiteListAutocomplete,
  getWhitelistedAddresses,
  saveWhitelistedAddresses,
  updateAddress,
  deleteAddress,
};
