export interface RampFiatCurrency {
  icon: string;
  name: string;
  symbol: string;
  logoSymbol?: string;
  paymentMethods: any[];
}

export enum RampType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum Ramps {
  TRANSAK = 'TRANSAK',
  RAMP = 'RAMP',
}

export interface RampEstimation {
  ramp: Ramps;
  type: RampType;
  network: string;
  crypto: string;
  fiat: string;
  amount: number;
  estimation: number;
  paymentMethod: string;
  quote?: string;
}

export type RampEstimationDisplay = RampEstimation & {
  link: string;
  logo: string;
  name: string;
};

export type RampConfig = {
  baseUrl: string;
  apiKey: string;
};

export interface BaseProviderInterface {
  baseUrl: string;
  apiKey: string;
  name: string;
  logo: string;
  fiatCurrencyOptions: RampFiatCurrency[];
  getFiatCurrencyOptions: () => Promise<RampFiatCurrency[]>;
  getEstimation: (
    rampType: RampType,
    amount: number,
    fiatCurrency: string,
    cryptoCurrency: string,
    network: string,
  ) => Promise<RampEstimation[]>;
  getLink: (estimation: RampEstimation, name: string) => string;
}
