import { SVGIcons } from 'src/common-ui/icons.enum';

export interface SwapCryptosConfig {
  baseUrl: string;
  apiKey: string;
  headerKey: string;
}

export interface SwapCryptosCurrencyInfo {
  symbol: string;
  iconUrl: string;
  name: string;
  network: string;
}

export enum SwapCryptos {
  STEALTHEX = 'STEALTHEX',
}

//TODO check what is needed & cleanup
export interface SwapCryptosEstimation {
  swapCrypto: SwapCryptos;
  // type: RampType;
  network: string;
  from: string;
  to: string;
  amount: number;
  estimation: number;
  quote?: string;
}

export type SwapCryptosEstimationDisplay = SwapCryptosEstimation & {
  link: string;
  logo: SVGIcons;
  name: string;
  // paymentMethod: { title: string; method: string; icon: SVGIcons };
};
