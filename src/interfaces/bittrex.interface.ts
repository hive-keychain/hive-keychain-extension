export interface Currency {
  usd_24h_change?: number;
  usd?: number;
}

export interface CurrencyPrices {
  bitcoin: Currency;
  hive: Currency;
  hive_dollar: Currency;
}
