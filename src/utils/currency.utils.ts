export interface CurrencyLabels {
  hive: string;
  hbd: string;
  hp: string;
}

const getCurrencyLabels = (isTestnet: boolean): CurrencyLabels => {
  return {
    hive: isTestnet ? 'TEST' : 'HIVE',
    hbd: isTestnet ? 'HBT' : 'HDB',
    hp: isTestnet ? 'TP' : 'HP',
  };
};

const CurrencyUtils = {
  getCurrencyLabels,
};

export default CurrencyUtils;
