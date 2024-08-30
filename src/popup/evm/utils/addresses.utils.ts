import { EvmAddressType } from '@popup/evm/interfaces/wallet.interface';
import EvmWalletUtils from '@popup/evm/utils/wallet.utils';
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
      ? EvmAddressType.WALLET
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

export const EvmAddressesUtils = {
  getAddressType,
  getIdenticonFromAddress,
};
