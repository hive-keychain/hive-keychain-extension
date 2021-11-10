import { Asset, DynamicGlobalProperties } from '@hiveio/dhive';

const withCommas = (nb: string, decimals = 3) => {
  const value = parseFloat(nb).toFixed(decimals);
  var parts = value.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

const toHP = (vests: string, props?: DynamicGlobalProperties) =>
  props
    ? (parseFloat(vests) * parseFloat(props.total_vesting_fund_hive + '')) /
      parseFloat(props.total_vesting_shares + '')
    : 0;

const fromHP = (hp: string, props: DynamicGlobalProperties) =>
  (parseFloat(hp) / parseFloat(props.total_vesting_fund_hive + '')) *
  parseFloat(props.total_vesting_shares + '');

const formatCurrencyValue = (value: string | Asset) => {
  if (!value) {
    return '...';
  }
  return withCommas(
    value.toString().replace('HBD', '').replace('HIVE', '').trim(),
  );
};

const FormatUtils = {
  withCommas,
  toHP,
  fromHP,
  formatCurrencyValue,
};

export default FormatUtils;
