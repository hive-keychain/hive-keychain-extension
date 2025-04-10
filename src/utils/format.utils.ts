import type { DynamicGlobalProperties } from '@hiveio/dhive';
import { CurrencyPrices } from '@interfaces/bittrex.interface';
import { GlobalProperties } from '@interfaces/global-properties.interface';
import { Asset } from 'hive-keychain-commons';
import moment from 'moment';

const withCommas = (nb: string, decimals = 3, removeTrailingZeros = false) => {
  const currency = nb.split(' ')[1];

  const value = parseFloat(nb).toFixed(decimals);
  var parts = value.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  let finalNumber = parts.join('.');

  if (removeTrailingZeros) {
    finalNumber = finalNumber.replace(
      /^([\d,]+)$|^([\d,]+)\.0*$|^([\d,]+\.[0-9]*?)0*$/,
      '$1$2$3',
    );
  }

  if (currency) {
    finalNumber = finalNumber + ' ' + currency;
  }

  return finalNumber;
};

const toHP = (vests: string, props?: DynamicGlobalProperties) =>
  props
    ? (parseFloat(vests) * parseFloat(props.total_vesting_fund_hive + '')) /
      parseFloat(props.total_vesting_shares + '')
    : 0;

const toFormattedHP = (vests: number, props?: DynamicGlobalProperties) => {
  return `${toHP(vests.toString(), props).toFixed(3)} HP`;
};

const fromHP = (hp: string, props: DynamicGlobalProperties) =>
  (parseFloat(hp) / parseFloat(props.total_vesting_fund_hive + '')) *
  parseFloat(props.total_vesting_shares + '');

const formatCurrencyValue = (
  value: string | Asset | number,
  digits = 3,
  removeTrailingZeros = false,
) => {
  if (value === undefined || value === null) {
    return '...';
  }
  return withCommas(
    value.toString().replace('HBD', '').replace('HIVE', '').trim(),
    digits,
    removeTrailingZeros,
  );
};

const nFormatter = (num: number, digits: number) => {
  var si = [
    {
      value: 1,
      symbol: '',
    },
    {
      value: 1e3,
      symbol: 'k',
    },
    {
      value: 1e6,
      symbol: 'M',
    },
    {
      value: 1e9,
      symbol: 'G',
    },
    {
      value: 1e12,
      symbol: 'T',
    },
    {
      value: 1e15,
      symbol: 'P',
    },
    {
      value: 1e18,
      symbol: 'E',
    },
  ];
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol;
};

const hasMoreThanXDecimal = (number: number, decimal: number) => {
  const splitedNumber = number.toString().split('.');
  return splitedNumber.length > 1 ? splitedNumber[1].length > decimal : false;
};

const toNumber = (value: string | Asset) => {
  return parseFloat(value.toString().split(' ')[0].trim());
};

const getSymbol = (nai: string) => {
  if (nai === '@@000000013') return 'HBD';
  if (nai === '@@000000021') return 'HIVE';
  if (nai === '@@000000037') return 'HP';
};

const fromNaiAndSymbol = (obj: any) => {
  return `${(obj.amount / 1000).toFixed(obj.precision)} ${FormatUtils.getSymbol(
    obj.nai,
  )}`;
};

const getAmountFromNai = (obj: any) => {
  const res = fromNaiAndSymbol(obj);
  return Asset.fromString(res).amount;
};

const removeHtmlTags = (str: string) => {
  return str.replace(/<(?:.|\n)*?>/gm, '');
};

const getValFromString = (string: string): number => {
  return parseFloat(string.split(' ')[0]);
};

const trimUselessZero = (number: number, precision: number) => {
  const numberWithPrecision = number.toFixed(precision);
  const n = parseFloat(numberWithPrecision).toString();
  if (n.split('.').length > 0 && n.split('.')[1]?.length > 3)
    return FormatUtils.withCommas(n);
  else return FormatUtils.withCommas(parseFloat(n).toFixed(3));
};

const getUSDFromVests = (
  vestAmount: Number,
  globalProperties: GlobalProperties,
  currencyPrices: CurrencyPrices,
) => {
  return (
    FormatUtils.toHP(vestAmount.toString(), globalProperties.globals!) *
    currencyPrices.hive.usd!
  ).toFixed(2);
};

const getOrdinalLabelTranslation = (active_rank: string) => {
  const result = parseFloat(active_rank) % 10;
  switch (result) {
    case 1:
      return 'html_popup_witness_ranking_ordinal_st_label';
    case 2:
      return 'html_popup_witness_ranking_ordinal_nd_label';
    case 3:
      return 'html_popup_witness_ranking_ordinal_rd_label';
    default:
      return 'html_popup_witness_ranking_ordinal_th_label';
  }
};

const dateToFormattedString = (date: Date) => {
  return moment(date).format('MM/DD/YY');
};

const shortenString = (string: string, length: number = 3) => {
  //TODO : remove during merge EVM (duplicate)
  return string.length > length * 2
    ? `${string.substring(length, 0)}...${string?.toString().slice(-length)}`
    : string;
};

const FormatUtils = {
  withCommas,
  toHP,
  toFormattedHP,
  fromHP,
  formatCurrencyValue,
  nFormatter,
  hasMoreThanXDecimal,
  toNumber,
  getSymbol,
  getAmountFromNai,
  fromNaiAndSymbol,
  removeHtmlTags,
  getValFromString,
  trimUselessZero,
  getUSDFromVests,
  getOrdinalLabelTranslation,
  dateToFormattedString,
  shortenString,
};

export default FormatUtils;
