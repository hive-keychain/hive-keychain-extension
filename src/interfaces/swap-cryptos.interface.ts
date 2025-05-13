import { ExchangeOperationForm } from '@popup/hive/pages/app-container/home/buy-coins/swap-cryptos/swap-cryptos.component';
import { OptionItem } from 'src/common-ui/custom-select/custom-select.component';
import { SVGIcons } from 'src/common-ui/icons.enum';

export interface GenericObjectKeypair {
  [key: string]: any;
}
export interface SwapCryptosConfig {
  urls: {
    baseUrl: string;
    referalBaseUrl: string;
    fullLinkToExchange: string;
    routes: {
      allCurrencies: string;
      currencyPair: string;
      minMaxAccepted: string;
      estimation: string;
      exchange: string;
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

export interface SwapCryptosExchangeResult {
  id: string;
  type: string;
  timestamp: string;
  updated_at: string;
  currency_from: string;
  currency_to: string;
  amount_from: string;
  expected_amount: string;
  amount_to: string;
  address_from: string;
  address_to: string;
  extra_id_from: string;
  extra_id_to: string;
  tx_from: string;
  tx_to: string;
  status: string;
  refund_address: string;
  refund_extra_id: string;
  partner_fee: string;
  currencies: {
    [key: string]: any;
  };
  link: string;
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
  getNewExchange: (formData: ExchangeOperationForm) => Promise<any>;
}

export class SwapCryptosBaseProvider {
  urls: {
    baseUrl: string;
    referalBaseUrl: string;
    fullLinkToExchange: string;
    routes: {
      allCurrencies: string;
      currencyPair: string;
      minMaxAccepted: string;
      estimation: string;
      exchange: string;
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
