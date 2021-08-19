export interface Btc {
  Bid?: number;
  Daily?: string;
  PrevDay?: number;
}

export interface Currency extends Btc {
  DailyUsd?: string;
  Usd?: string;
}

export interface Bittrex {
  btc: Btc;
  hive: Currency;
  hbd: Currency;
}
