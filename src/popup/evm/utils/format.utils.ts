const GWEI = 1000000000;
const WEI = 1000000;

const formatAddress = (address: string) => {
  return (
    address.slice(0, 7) +
    '...' +
    address.slice(address.length - 5)
  ).toLowerCase();
};

const etherToGwei = (value: number | bigint) => {
  if (typeof value === 'bigint') value = Number(value);
  if (!value || value.toString() === '') return 0;
  return value / GWEI;
};

const addHexPrefix = (str: string) => {
  if (typeof str !== 'string' || str.match(/^-?0x/u)) {
    return str;
  }

  if (str.match(/^-?0X/u)) {
    return str.replace('0X', '0x');
  }

  if (str.startsWith('-')) {
    return str.replace('-', '-0x');
  }

  return `0x${str}`;
};

export const EvmFormatUtils = {
  addHexPrefix,
  formatAddress,
  etherToGwei,
  GWEI,
  WEI,
};
