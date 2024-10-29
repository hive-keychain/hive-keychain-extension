const GWEI = 1000000000;

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

export const EvmFormatUtils = {
  formatAddress,
  etherToGwei,
  GWEI,
};
