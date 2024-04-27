import { OptionItem } from 'src/common-ui/custom-select/custom-select.component';
import { SVGIcons } from 'src/common-ui/icons.enum';

export interface GenericObjectKeypair {
  [key: string]: string;
}
export interface SwapCryptosConfig {
  urls: {
    baseUrl: string;
    referalBaseUrl: string;
    routes: {
      allCurrencies: string;
      currencyPair: string;
      minMaxAccepted: string;
      estimation: string;
    };
  };
  apiKey: string;
  headerKey: string;
  refId: string;
  partnerFeeAmount?: number;
}

export interface SwapCryptosCurrencyInfo {
  symbol: string;
  iconUrl: string;
  name: string;
  network: string;
}

export enum SwapCryptos {
  STEALTHEX = 'STEALTHEX',
  SIMPLESWAP = 'SIMPLESWAP',
}

export interface SwapCryptosEstimation {
  swapCrypto: SwapCryptos;
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
};

export interface SwapCryptosBaseProviderInterface {
  apiKey: string;
  name: string;
  logo: SVGIcons;
  buildUrl: (route: string) => string;
  getPairedCurrencyOptionItemList: (symbol: string) => Promise<OptionItem[]>;
  getMinMaxAmountAccepted: (from: string, to: string) => Promise<any>;
  getExchangeEstimation: (
    amount: string,
    from: string,
    to: string,
  ) => Promise<SwapCryptosEstimationDisplay>;
}

export class SwapCryptosBaseProvider {
  urls: {
    baseUrl: string;
    referalBaseUrl: string;
    routes: {
      allCurrencies: string;
      currencyPair: string;
      minMaxAccepted: string;
      estimation: string;
    };
  };
  apiKey: string;
  headerKey: string;
  refId: string;
  partnerFeeAmount?: number;

  constructor(swapCryptosConfig: SwapCryptosConfig) {
    (this.urls = swapCryptosConfig.urls),
      (this.apiKey = swapCryptosConfig.apiKey);
    this.headerKey = swapCryptosConfig.headerKey;
    this.refId = swapCryptosConfig.refId;
    this.partnerFeeAmount = swapCryptosConfig.partnerFeeAmount;
  }
}
