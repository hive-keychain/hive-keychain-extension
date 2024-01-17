export interface CurrencyLabels {
  hive: string;
  hbd: string;
  hp: string;
}

export enum BaseCurrencies {
  HIVE = 'hive',
  HBD = 'hbd',
}

const getCurrencyLabels = (isTestnet: boolean): CurrencyLabels => {
  return {
    hive: isTestnet ? 'TESTS' : 'HIVE',
    hbd: isTestnet ? 'TBD' : 'HBD',
    hp: isTestnet ? 'TP' : 'HP',
  };
};

const getCurrencyLabel = (currency: string, isTestnet: boolean) => {
  const cur = currency.toLowerCase() as BaseCurrencies;
  const label = getCurrencyLabels(isTestnet)[cur];
  return label ? label : cur.toUpperCase();
};

const CurrencyUtils = {
  getCurrencyLabels,
  getCurrencyLabel,
};

export default CurrencyUtils;
