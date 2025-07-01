import {
  EvmAddressType,
  EvmFavoriteAddress,
  EvmWhitelistedAddresses,
} from '@popup/evm/interfaces/evm-addresses.interface';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { ethers } from 'ethers';
import { identicon } from 'minidenticons';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export interface EvmAddressDetail {
  label?: string;
  fullAddress: string;
  formattedAddress: string;
  avatar?: string | null;
}

const getAddressDetails = async (
  address: string,
  chainId: string,
): Promise<EvmAddressDetail> => {
  const details: EvmAddressDetail = {
    fullAddress: '',
    formattedAddress: '',
  };

  const isAddress = ethers.isAddress(address);
  if (isAddress === false) {
    const resolveData = await EvmRequestsUtils.getResolveData(address);

    const foundAddress = resolveData?.address;
    details.avatar = resolveData?.avatar;
    details.label = address;
    if (foundAddress) {
      details.fullAddress = foundAddress;
    }
  } else {
    const ensFound = await EvmRequestsUtils.lookupEns(address);
    if (ensFound) {
      const resolveData = await EvmRequestsUtils.getResolveData(ensFound);
      const foundAddress = resolveData?.address;
      details.avatar = resolveData?.avatar;
      details.label = ensFound;
      if (foundAddress) {
        details.fullAddress = foundAddress;
      }
    } else {
      let label = await EvmAddressesUtils.getAddressLabel(address, chainId);
      if (!label || label.length === 0)
        label = EvmFormatUtils.formatAddress(address);

      details.label = label;
      details.formattedAddress = label;
    }
  }

  return details;
};

const getAddressType = async (address: string, chain: EvmChain) => {
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
  return identicon(address, 90, 50);
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
        (address: EvmFavoriteAddress) => address.address.toLowerCase(),
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
) => {
  const whitelistedAddresses = await getWhitelistedAddresses(chainId);
  whitelistedAddresses[EvmAddressType.SMART_CONTRACT].push({
    address: contractAddress,
    label: label,
  });

  await saveWhitelistedAddresses(chainId, whitelistedAddresses);
};

const getContractAddresses = async (chainId: string) => {
  let whitelistedAddresses = await getWhitelistedAddresses(chainId);
  return whitelistedAddresses[EvmAddressType.SMART_CONTRACT];
};

const saveWalletAddress = async (
  walletAddress: string,
  chainId: string,
  label?: string,
) => {
  const whitelistedAddresses = await getWhitelistedAddresses(chainId);
  whitelistedAddresses[EvmAddressType.WALLET_ADDRESS].push({
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

const isWhitelisted = async (address: string, chainId: string) => {
  const whitelisted = await getWhitelistedAddresses(chainId);

  return (
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
};
