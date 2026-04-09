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

const EVM_WALLET_AUTOCOMPLETE_CATEGORY = 'evm_wallets';
const LOCAL_ACCOUNTS_AUTOCOMPLETE_CATEGORY = 'local_accounts';

const getEnsExpirationDate = () =>
  Date.now() + Number(process.env.EVM_DATA_EXPIRATION_TIME);

const getSavedEnsMap = (savedEnsList: SavedEns[]) =>
  new Map(
    savedEnsList
      .filter((savedEns) => !!savedEns.address)
      .map((savedEns) => [savedEns.address.toLowerCase(), savedEns] as const),
  );

const upsertSavedEnsEntries = (
  savedEnsList: SavedEns[],
  newEntries: SavedEns[],
): SavedEns[] => {
  const nextSavedEnsList = [...savedEnsList];

  for (const newEntry of newEntries) {
    const normalizedAddress = newEntry.address.toLowerCase();
    const normalizedEns = newEntry.ens?.toLowerCase();
    const entryWithExpiration = {
      ...newEntry,
      expirationDate: getEnsExpirationDate(),
    };

    const existingIndex = nextSavedEnsList.findIndex((savedEns) => {
      const sameAddress =
        savedEns.address.toLowerCase() === normalizedAddress;
      const sameEns =
        !!normalizedEns && savedEns.ens?.toLowerCase() === normalizedEns;
      return sameAddress || sameEns;
    });

    if (existingIndex !== -1) {
      nextSavedEnsList[existingIndex] = entryWithExpiration;
    } else {
      nextSavedEnsList.push(entryWithExpiration);
    }
  }

  return nextSavedEnsList;
};

const getIdenticonDataUri = (address: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    getIdenticonFromAddress(address).svg,
  )}`;

const getAutocompleteImage = (address: string, savedEns?: SavedEns) =>
  savedEns?.avatar ?? getIdenticonDataUri(address);

const getAutocompleteLabel = (address: string, label?: string, ens?: string) =>
  label?.length && label.length > 0
    ? label
    : ens?.length
      ? ens
      : EvmFormatUtils.formatAddress(address);

const getAutocompleteSubLabel = (
  address: string,
  label?: string,
  ens?: string,
) => {
  if ((label?.length && label.length > 0) || ens?.length) {
    return EvmFormatUtils.formatAddress(address);
  }

  return '';
};

const buildWalletAutocompleteValue = (
  wallet: FavoriteAddress,
  savedEns?: SavedEns,
): AutoCompleteValue => ({
  value: wallet.address,
  label: getAutocompleteLabel(wallet.address, wallet.label, savedEns?.ens),
  subLabel: getAutocompleteSubLabel(wallet.address, wallet.label, savedEns?.ens),
  img: getAutocompleteImage(wallet.address, savedEns),
});

const buildLocalAccountAutocompleteValue = (
  localAccount: EvmAccount,
  savedEns?: SavedEns,
): AutoCompleteValue => ({
  value: localAccount.wallet.address,
  label: EvmAccountUtils.getAccountFullname(localAccount),
  subLabel: EvmFormatUtils.formatAddress(localAccount.wallet.address),
  img: getAutocompleteImage(localAccount.wallet.address, savedEns),
});

const mergeEnsIntoAutocompleteItem = (
  autocompleteItem: AutoCompleteValue,
  savedEns: SavedEns,
): AutoCompleteValue => {
  const formattedAddress = EvmFormatUtils.formatAddress(autocompleteItem.value);
  const shouldUpdateLabel =
    !autocompleteItem.subLabel || autocompleteItem.label === formattedAddress;

  return {
    ...autocompleteItem,
    label:
      shouldUpdateLabel && savedEns.ens
        ? savedEns.ens
        : autocompleteItem.label,
    subLabel:
      shouldUpdateLabel && savedEns.ens
        ? formattedAddress
        : autocompleteItem.subLabel,
    img: savedEns.avatar ?? autocompleteItem.img,
  };
};

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
  const nextSavedEns = upsertSavedEnsEntries(savedEns, [newEns]);
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_ENS,
    nextSavedEns,
  );
};

const getAddressDetails = async (
  address: string,
  chainId: string,
  fullName: boolean = true,
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
      details.label = fullName
        ? EvmAccountUtils.getAccountFullname(localAccount)
        : EvmAccountUtils.getAccountName(localAccount);
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
  const [wallets, savedEnsList] = await Promise.all([
    getWalletAddresses(chain.chainId),
    getSavedEnsFromStorage(),
  ]);
  const savedEnsMap = getSavedEnsMap(savedEnsList);

  const localAddresses = localAccounts.map((localAccount) =>
    localAccount.wallet.address.toLowerCase(),
  );

  const autocomplete = {
    categories: [],
  } as AutoCompleteValues;

  const walletCategory: AutoCompleteCategory = {
    title: EVM_WALLET_AUTOCOMPLETE_CATEGORY,
    translateTitle: true,
    values: [],
  };
  const localAccountCategory: AutoCompleteCategory = {
    title: LOCAL_ACCOUNTS_AUTOCOMPLETE_CATEGORY,
    translateTitle: true,
    values: [],
  };

  const filteredWallets = wallets.filter(
    (w) => !localAddresses.includes(w.address.toLowerCase()),
  );
  const filteredLocalAccounts = localAccounts.filter(
    (la) => walletAddress.toLowerCase() !== la.wallet.address.toLowerCase(),
  );

  walletCategory.values = filteredWallets.map((wallet) =>
    buildWalletAutocompleteValue(
      wallet,
      savedEnsMap.get(wallet.address.toLowerCase()),
    ),
  );

  localAccountCategory.values = filteredLocalAccounts.map((localAccount) =>
    buildLocalAccountAutocompleteValue(
      localAccount,
      savedEnsMap.get(localAccount.wallet.address.toLowerCase()),
    ),
  );

  autocomplete.categories.push(walletCategory);
  autocomplete.categories.push(localAccountCategory);
  return autocomplete;
};

const enrichWhiteListAutocomplete = async (
  autocomplete: AutoCompleteValues,
): Promise<AutoCompleteValues> => {
  const savedEnsList = await getSavedEnsFromStorage();
  const savedEnsMap = getSavedEnsMap(savedEnsList);
  const walletCategory = autocomplete.categories.find(
    (category) => category.title === EVM_WALLET_AUTOCOMPLETE_CATEGORY,
  );

  if (!walletCategory || walletCategory.values.length === 0) {
    return autocomplete;
  }

  const uncachedWalletAddresses = walletCategory.values
    .map((value) => value.value)
    .filter(
      (value, index, list) =>
        ethers.isAddress(value) &&
        !savedEnsMap.has(value.toLowerCase()) &&
        list.indexOf(value) === index,
    );

  if (uncachedWalletAddresses.length === 0) {
    return autocomplete;
  }

  const newEnsEntries = (
    await Promise.all(
      uncachedWalletAddresses.map(async (address) => {
        try {
          const ens = await EvmRequestsUtils.getEnsForAddress(address);
          if (!ens) return null;

          const ensData = await EvmRequestsUtils.getDataForEns(ens);
          return {
            address,
            ens,
            avatar: ensData?.avatar ?? undefined,
          } as SavedEns;
        } catch (err) {
          return null;
        }
      }),
    )
  ).filter((value): value is SavedEns => !!value);

  if (newEnsEntries.length === 0) {
    return autocomplete;
  }

  const nextSavedEnsList = upsertSavedEnsEntries(savedEnsList, newEnsEntries);
  const nextSavedEnsMap = getSavedEnsMap(nextSavedEnsList);

  try {
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.EVM_ENS,
      nextSavedEnsList,
    );
  } catch (err) {}

  return {
    categories: autocomplete.categories.map((category) => {
      if (category.title !== EVM_WALLET_AUTOCOMPLETE_CATEGORY) {
        return category;
      }

      return {
        ...category,
        values: category.values.map((value) => {
          const savedEns = nextSavedEnsMap.get(value.value.toLowerCase());
          return savedEns ? mergeEnsIntoAutocompleteItem(value, savedEns) : value;
        }),
      };
    }),
  };
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
  enrichWhiteListAutocomplete,
  getWhitelistedAddresses,
  saveWhitelistedAddresses,
  updateAddress,
  deleteAddress,
};
