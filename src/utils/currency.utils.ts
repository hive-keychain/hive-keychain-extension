export interface CurrencyLabels {
  hive: string;
  hbd: string;
  hp: string;
  tests: string;
  tbd: string;
  tp: string;
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
    tests: 'TESTS',
    tbd: 'TBD',
    tp: 'TP',
  };
};

const getCurrencyLabel = (currency: string, isTestnet: boolean) => {
  const cur = currency.toLowerCase() as BaseCurrencies;
  return getCurrencyLabels(isTestnet)[cur];
};

const CurrencyUtils = {
  getCurrencyLabels,
  getCurrencyLabel,
};

export default CurrencyUtils;
