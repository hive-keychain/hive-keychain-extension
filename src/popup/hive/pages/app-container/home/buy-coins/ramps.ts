import { BaseApi } from '@api/base';
import { RampConfig } from '@interfaces/ramps.interface';
import Config from 'src/config';

interface Ramp {
  name: string;
  logo: string;
  provider: BaseProvider;
}

export const getRampsConfig = (): Ramp[] => {
  return [
    { name: 'Transak', logo: '', provider: new TransakProvider() },
    { name: 'Ramp', logo: '', provider: new RampProvider() },
  ];
};

export interface RampFiatCurrency {
  icon: string;
  name: string;
  symbol: string;
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
  quote: string;
}

interface BaseProviderInterface {
  baseUrl: string;
  apiKey: string;
  fiatCurrencyOptions: RampFiatCurrency[];
  getFiatCurrencyOptions: () => Promise<RampFiatCurrency[]>;
  getEstimation: (
    rampType: RampType,
    amount: number,
    fiatCurrency: RampFiatCurrency,
  ) => Promise<RampEstimation[]>;
}

class BaseProvider {
  baseUrl: string;
  apiKey: string;
  fiatCurrencyOptions: RampFiatCurrency[] = [];
  constructor(rampConfig: RampConfig) {
    this.baseUrl = rampConfig.baseUrl;
    this.apiKey = rampConfig.apiKey;
  }
}

export class TransakProvider
  extends BaseProvider
  implements BaseProviderInterface
{
  constructor() {
    super(Config.ramps.transak);
  }
  getEstimation = async (
    rampType: RampType,
    amount: number,
    fiatCurrency: RampFiatCurrency,
  ) => {
    if (rampType === RampType.SELL) return [];
    const paymentOptions = this.fiatCurrencyOptions
      .find((e) => e.symbol === fiatCurrency.symbol)
      ?.paymentMethods.filter((e) => e.isActive)
      .map((e) => e.id);

    return (
      await Promise.all(
        paymentOptions!.map((po) => {
          return BaseApi.get(
            BaseApi.buildUrl(this.baseUrl, 'api/v1/pricing/public/quotes'),
            {
              partnerApiKey: this.apiKey,
              fiatCurrency: fiatCurrency.symbol,
              cryptoCurrency: 'HIVE',
              isBuyOrSell: rampType.toString(),
              network: 'mainnet',
              paymentMethod: po,
              [rampType === RampType.BUY ? 'fiatAmount' : 'cryptoAmount']:
                amount.toString(),
            },
          );
        }),
      )
    ).map(
      (e) =>
        ({
          ramp: Ramps.TRANSAK,
          type: rampType,
          amount,
          estimation:
            rampType === RampType.BUY
              ? e.response.cryptoAmount
              : e.response.fiatAmount,
          crypto: e.response.cryptoCurrency,
          fiat: e.response.fiatCurrency,
          network: e.response.network,
          quote: e.response.quoteId,
          paymentMethod: e.response.paymentMethod,
        } as RampEstimation),
    );
  };

  getFiatCurrencyOptions = async (): Promise<RampFiatCurrency[]> => {
    const currencyList = await BaseApi.get(
      BaseApi.buildUrl(this.baseUrl, 'api/v2/currencies/fiat-currencies'),
    );
    this.fiatCurrencyOptions = currencyList.response
      .filter((e: any) => e.isAllowed)
      .map((e: any) => {
        return {
          icon: e.icon,
          name: e.name,
          symbol: e.symbol,
          paymentMethods: e.paymentOptions,
        };
      });
    return this.fiatCurrencyOptions;
  };
  getLink = (estimation: RampEstimation, name: string) => {
    return `https://global.transak.com/?apiKey=${this.apiKey}&cryptoCurrencyCode=${estimation.crypto}&fiatAmount=${estimation.amount}&fiatCurrency=${estimation.fiat}&paymentMethod=${estimation.paymentMethod}&productsAvailed=${estimation.type}&walletAddress=${name}&partnerOrderId=null&network=${estimation.network}&exchangeScreenTitle=Buy%20HIVEs&isFeeCalculationHidden=true&quoteId=${estimation.quote}`;
  };
}

class RampProvider extends BaseProvider {
  constructor() {
    super(Config.ramps.ramp);
  }
}
