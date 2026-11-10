import { ethers } from 'ethers';

const isValidEvmAddress = (address: unknown): address is string => {
  return typeof address === 'string' && ethers.isAddress(address.toLowerCase());
};

export const EvmAddressUtils = {
  isValidEvmAddress,
};
