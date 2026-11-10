import Decimal from 'decimal.js';

const GWEI = 1000000000;
const WEI = 1000000000000000000;

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

const etherToWei = (value: number | bigint) => {
  if (typeof value === 'bigint') value = Number(value);
  if (!value || value.toString() === '') return 0;
  return value / WEI;
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

const gweiToWei = (value: Decimal) => {
  return value.mul(new Decimal(1000000000));
};

const weiToGwei = (value: Decimal) => {
  return value.div(new Decimal(1000000000));
};

const formatTokenValue = (value: number, decimals: number) => {
  return new Decimal(value).mul(new Decimal(10).pow(new Decimal(decimals)));
};

const addCommas = (value: string) => {
  const [integerPart, decimalPart] = value.split('.');
  const sign = integerPart.startsWith('-') ? '-' : '';
  const unsignedInteger = sign ? integerPart.slice(1) : integerPart;
  const formattedInteger = unsignedInteger.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ',',
  );
  return `${sign}${formattedInteger}${decimalPart ? `.${decimalPart}` : ''}`;
};

const formatTokenBalance = (
  value: string | number | Decimal,
  decimals: number,
) => {
  const decimalValue = new Decimal(value || 0);
  const roundedValue = decimalValue.toDecimalPlaces(decimals);
  const formattedValue = addCommas(
    roundedValue.toFixed(decimals).replace(/\.0*$|(\.[0-9]*?)0*$/, '$1'),
  );

  return decimalValue.abs().gt(0) && roundedValue.isZero()
    ? '~0'
    : formattedValue;
};

const formatGweiFromWei = (value: string | number | bigint | Decimal) => {
  const valueInGwei = weiToGwei(new Decimal(value.toString()));
  return `${formatTokenBalance(valueInGwei, 9)} Gwei`;
};

const formatGweiFromEth = (value: string | number | Decimal) => {
  const valueInGwei = new Decimal(value.toString()).mul(GWEI);
  return `${formatTokenBalance(valueInGwei, 9)} Gwei`;
};

export const EvmFormatUtils = {
  addHexPrefix,
  formatAddress,
  etherToGwei,
  etherToWei,
  gweiToWei,
  weiToGwei,
  GWEI,
  WEI,
  formatTokenValue,
  formatTokenBalance,
  formatGweiFromWei,
  formatGweiFromEth,
};
