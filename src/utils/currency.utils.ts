export interface CurrencyLabels {
  hive: string;
  hbd: string;
  hp: string;
}

const getCurrencyLabels = (isTestnet: boolean): CurrencyLabels => {
  return {
    hive: isTestnet ? 'TESTS' : 'HIVE',
    hbd: isTestnet ? 'TBD' : 'HBD',
    hp: isTestnet ? 'TP' : 'HP',
  };
};

const CurrencyUtils = {
  getCurrencyLabels,
};

export default CurrencyUtils;
