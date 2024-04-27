import {
  GenericObjectKeypair,
  SwapCryptos,
  SwapCryptosBaseProvider,
  SwapCryptosBaseProviderInterface,
  SwapCryptosEstimationDisplay,
} from '@interfaces/swap-cryptos.interface';
import axios from 'axios';
import {
  OptionItem,
  OptionItemBadgeType,
} from 'src/common-ui/custom-select/custom-select.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import Config from 'src/config';
import Logger from 'src/utils/logger.utils';

export class StealthexProvider
  extends SwapCryptosBaseProvider
  implements SwapCryptosBaseProviderInterface
{
  constructor(logInfo?: boolean) {
    super(Config.swapCryptos.stealthex);
    this.name = 'Stealthex';
    this.logo = SVGIcons.STEALTHEX;
    this.logInfo = logInfo;
  }
  name: string;
  logo: SVGIcons;
  logInfo?: boolean;
  buildUrl = (route: string) => {
    const baseUrl = this.urls.baseUrl;
    return `${baseUrl}${route}`;
  };
  getPairedCurrencyOptionItemList = async (symbol: string) => {
    let pairedCurrencyOptionsList: OptionItem[] = [];
    //build headers //TODO add to a method
    let requestHeaders: GenericObjectKeypair = {};
    requestHeaders[`${this.headerKey}`] = this.apiKey;
    //end headers

    const currenciesRoute = this.urls.routes.allCurrencies;
    if (this.logInfo) {
      Logger.log('currenciesRoute', {
        currenciesRoute,
        requestHeaders,
        buildUrl: this.buildUrl('-'),
      });
    }
    //TODO bellow include this as allCurrencyRoute in the config.
    const allCurrencies = (
      await axios.get(this.buildUrl(currenciesRoute), {
        headers: requestHeaders,
      })
    ).data;

    const pairedCurrencyRoute = `${this.urls.routes.currencyPair}${symbol}`;
    if (this.logInfo) {
      Logger.log('pairedCurrencyRoute', { pairedCurrencyRoute });
    }

    const pairedCurrencyList = (
      await axios.get(this.buildUrl(pairedCurrencyRoute), {
        headers: requestHeaders,
      })
    ).data;
    allCurrencies.map((x: any) => {
      if (pairedCurrencyList.includes(x.symbol)) {
        const bagde = x.network
          ? {
              type: OptionItemBadgeType.BADGE_GREEN,
              label: x.network,
            }
          : undefined;
        pairedCurrencyOptionsList.push({
          label: x.name,
          subLabel: x.symbol,
          img: x.image,
          value: x,
          bagde,
        });
      }
    });
    return pairedCurrencyOptionsList;
  };
  getMinMaxAmountAccepted = async (from: string, to: string) => {
    //build headers //TODO add to a method
    let requestHeaders: GenericObjectKeypair = {};
    requestHeaders[`${this.headerKey}`] = this.apiKey;
    //end headers
    const minMaxAcceptedRoute = this.urls.routes.minMaxAccepted;
    if (minMaxAcceptedRoute.trim().length === 0) return [];
    const minMaxRoute = `${this.urls.routes.minMaxAccepted}${from}/${to}`;
    if (this.logInfo) {
      Logger.log('minMaxRoute', { minMaxRoute, requestHeaders });
    }
    return (
      await axios.get(this.buildUrl(minMaxRoute), { headers: requestHeaders })
    ).data.min_amount;
  };
  getExchangeEstimation = async (amount: string, from: string, to: string) => {
    //build headers //TODO add to a method
    let requestHeaders: GenericObjectKeypair = {};
    requestHeaders[`${this.headerKey}`] = this.apiKey;
    //end headers

    const requestConfig = {
      headers: requestHeaders,
      params: {
        amount: parseFloat(amount),
        partner_fee: Config.swapCryptos.stealthex.partnerFeeAmount ?? 0,
      },
    };

    const estimationRoute = `${this.urls.routes.estimation}${from}/${to}`;
    const link = `${Config.swapCryptos.stealthex.urls.referalBaseUrl}${Config.swapCryptos.stealthex.refId}&amount=${amount}&from=${from}&to=${to}`;
    if (this.logInfo) {
      Logger.log('estimationRoute', { estimationRoute, requestConfig, link });
    }

    const estimation = (
      await axios.get(this.buildUrl(estimationRoute), requestConfig)
    ).data;

    return {
      swapCrypto: SwapCryptos.STEALTHEX,
      link: link,
      logo: SVGIcons.STEALTHEX,
      network: 'not_needed',
      name: SwapCryptos.STEALTHEX,
      from: from,
      to: to,
      amount: parseFloat(amount),
      estimation: estimation.estimated_amount,
    } as SwapCryptosEstimationDisplay;
  };
}

export class SimpleSwapProvider
  extends SwapCryptosBaseProvider
  implements SwapCryptosBaseProviderInterface
{
  constructor(logInfo?: boolean) {
    super(Config.swapCryptos.simpleswap);
    this.name = 'Simpleswap';
    this.logo = SVGIcons.SIMPLESWAP;
    this.logInfo = logInfo;
  }
  name: string;
  logo: SVGIcons;
  logInfo?: boolean;
  buildUrl = (route: string) => {
    const baseUrl = this.urls.baseUrl;
    return `${baseUrl}${route}`;
  };
  getPairedCurrencyOptionItemList = async (symbol: string) => {
    let pairedCurrencyOptionsList: OptionItem[] = [];
    const currenciesRoute = `${this.urls.routes.allCurrencies}?api_key=${this.apiKey}`;
    if (this.logInfo) {
      Logger.log('currenciesRoute', {
        currenciesRoute,
        buildUrl: this.buildUrl('-'),
      });
    }
    const allCurrencies = (await axios.get(this.buildUrl(currenciesRoute)))
      .data;
    const pairedCurrencyRoute = `${this.urls.routes.currencyPair}?api_key=${this.apiKey}&fixed=false&symbol=${symbol}`;
    if (this.logInfo) {
      Logger.log('pairedCurrencyRoute', { pairedCurrencyRoute });
    }
    const pairedCurrencyList = (
      await axios.get(this.buildUrl(pairedCurrencyRoute))
    ).data;
    allCurrencies.map((x: any) => {
      if (pairedCurrencyList.includes(x.symbol)) {
        const bagde = x.network
          ? {
              type: OptionItemBadgeType.BADGE_GREEN,
              label: x.network,
            }
          : undefined;
        pairedCurrencyOptionsList.push({
          label: x.name.split(' ')[0],
          subLabel: x.symbol,
          img: x.image,
          value: x,
          bagde,
        });
      }
    });
    return pairedCurrencyOptionsList;
  };
  getMinMaxAmountAccepted = async (from: string, to: string) => {
    const minMaxAcceptedRoute = this.urls.routes.minMaxAccepted;
    if (minMaxAcceptedRoute.trim().length === 0) return [];
    const minMaxRoute = `${this.urls.routes.minMaxAccepted}?api_key=${this.apiKey}&fixed=false&currency_from=${from}&currency_to=${to}`;
    if (this.logInfo) {
      Logger.log('minMaxRoute', { minMaxRoute });
    }
    return (await axios.get(this.buildUrl(minMaxRoute))).data;
  };
  getExchangeEstimation = async (amount: string, from: string, to: string) => {
    const estimationRoute = `${this.urls.routes.estimation}?api_key=${this.apiKey}&fixed=false&currency_from=${from}&currency_to=${to}&amount=${amount}`;
    //https://simpleswap.io/?ref=a81a6051c500&from=hive&to=btc&amount=1000
    const link = `${this.urls.referalBaseUrl}${this.refId}&from=${from}&to=${to}&amount=${amount}`;
    if (this.logInfo) {
      Logger.log('estimationRoute', { estimationRoute, link });
    }
    const estimation = (await axios.get(this.buildUrl(estimationRoute))).data;

    return {
      swapCrypto: SwapCryptos.SIMPLESWAP,
      link: link,
      logo: SVGIcons.SIMPLESWAP,
      network: 'not_needed',
      name: SwapCryptos.SIMPLESWAP,
      from: from,
      to: to,
      amount: parseFloat(amount),
      estimation: estimation,
    } as SwapCryptosEstimationDisplay;
  };
}

export class SwapCryptosMerger {
  providers: SwapCryptosBaseProviderInterface[];
  constructor(providers: SwapCryptosBaseProviderInterface[]) {
    this.providers = providers;
  }
  getCurrencyOptions = async (
    symbol: string,
  ): Promise<
    {
      provider: SwapCryptos;
      list: OptionItem[];
    }[]
  > => {
    let providerCurrencyOptionsList = [];
    for (const provider of this.providers) {
      const currencyList = await provider.getPairedCurrencyOptionItemList(
        symbol,
      );
      providerCurrencyOptionsList.push({
        provider: provider.name as SwapCryptos,
        list: currencyList,
      });
    }
    return providerCurrencyOptionsList;
  };
  getMinMaxAccepted = async (
    startTokenSymbol: string,
    endTokenSymbol: string,
  ): Promise<
    {
      provider: SwapCryptos;
      amount: string;
    }[]
  > => {
    let providerMinMaxAmountList = [];
    for (const provider of this.providers) {
      const minMaxAccepted = await provider.getMinMaxAmountAccepted(
        startTokenSymbol,
        endTokenSymbol,
      );
      providerMinMaxAmountList.push({
        provider: provider.name as SwapCryptos,
        amount: minMaxAccepted,
      });
    }
    return providerMinMaxAmountList;
  };
  getExchangeEstimation = async (
    amount: string,
    from: string,
    to: string,
  ): Promise<
    {
      provider: SwapCryptos;
      estimation: SwapCryptosEstimationDisplay;
    }[]
  > => {
    let providerEstimationList = [];
    for (const provider of this.providers) {
      const estimation = await provider.getExchangeEstimation(amount, from, to);
      providerEstimationList.push({
        provider: provider.name as SwapCryptos,
        estimation: estimation,
      });
    }
    return providerEstimationList;
  };
}
