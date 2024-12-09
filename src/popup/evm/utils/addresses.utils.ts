import {
  EvmAddressType,
  EvmFavoriteAddress,
  EvmWhitelistedAddresses,
} from '@popup/evm/interfaces/evm-addresses.interface';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { identicon } from 'minidenticons';
import LocalStorageUtils from 'src/utils/localStorage.utils';

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
  const myAddressStart = address.substring(0, 4).toLowerCase();
  const myAddressEnd = address.substring(4).toLowerCase();

  for (const whitelistedAddress of whitelistedAddresses) {
    const addressStart = whitelistedAddress.substring(0, 4).toLowerCase();
    const addressEnd = whitelistedAddress.substring(4).toLowerCase();

    if (
      whitelistedAddress !== address &&
      (myAddressStart === addressStart || myAddressEnd === addressEnd)
    )
      return {
        errorMessage: 'evm_transaction_receiver_potential_spoofing_whitelisted',
        address: whitelistedAddress,
      };
  }

  const localAddresses = await EvmWalletUtils.getAllLocalAddresses();

  for (const localAddress of localAddresses) {
    const addressStart = localAddress.substring(0, 4);
    const addressEnd = localAddress.substring(4);
    if (
      localAddress !== address &&
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
};
