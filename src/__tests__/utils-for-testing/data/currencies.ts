interface BittrexObj {
  Currency: string;
  CurrencyLong: string;
  MinConfirmation: number;
  TxFee: number;
  IsActive: boolean;
  IsRestricted: boolean;
  CoinType: string;
  BaseAddress: string;
  Notice: string;
}
const prices = {
  data: {
    bitcoin: { usd: 79999, usd_24h_change: -9.025 },
    hive: { usd: 0.638871, usd_24h_change: -13.1 },
    hive_dollar: { usd: 0.972868, usd_24h_change: -0.69 },
  },
};

const bittrex = [
  {
    Currency: 'BTC',
    CurrencyLong: 'Bitcoin',
    MinConfirmation: 2,
    TxFee: 0.0003,
    IsActive: true,
    IsRestricted: false,
    CoinType: 'BITCOIN',
    BaseAddress: '1N52wHoVR79PMDishab2XmRHsbekCdGquK',
    Notice: '',
  } as BittrexObj,
  {
    Currency: 'LTC',
    CurrencyLong: 'Litecoin',
    MinConfirmation: 6,
    TxFee: 0.01,
    IsActive: true,
    IsRestricted: false,
    CoinType: 'BITCOIN16',
    BaseAddress: 'LhyLNfBkoKshT7R8Pce6vkB9T2cP2o84hx',
    Notice: '',
  } as BittrexObj,
] as BittrexObj[];

export default { prices, bittrex };
