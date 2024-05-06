import {
  GenericObjectKeypair,
  SwapCryptos,
  SwapCryptosBaseProvider,
  SwapCryptosBaseProviderInterface,
  SwapCryptosEstimationDisplay,
  SwapCryptosExchangeResult,
} from '@interfaces/swap-cryptos.interface';
import { ExchangeOperationForm } from '@popup/hive/pages/app-container/home/buy-coins/swap-cryptos/swap-cryptos.component';
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
    this.name = SwapCryptos.STEALTHEX;
    this.logo = SVGIcons.SWAP_CRYPTOS_STEALTHEX;
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
    let requestHeaders: GenericObjectKeypair = {};
    requestHeaders[`${this.headerKey}`] = this.apiKey;

    const currenciesRoute = this.urls.routes.allCurrencies;
    if (this.logInfo) {
      Logger.log('currenciesRoute', {
        currenciesRoute,
        requestHeaders,
        buildUrl: this.buildUrl('-'),
      });
    }

    const pairedCurrencyRoute = `${this.urls.routes.currencyPair}${symbol}`;
    if (this.logInfo) {
      Logger.log('pairedCurrencyRoute', { pairedCurrencyRoute });
    }

    const [allCurrencies, pairedCurrencyList] = await Promise.all([
      axios.get(this.buildUrl(currenciesRoute), {
        headers: requestHeaders,
      }),
      axios.get(this.buildUrl(pairedCurrencyRoute), {
        headers: requestHeaders,
      }),
    ]);

    allCurrencies.data.map((x: any) => {
      if (pairedCurrencyList.data.includes(x.symbol)) {
        const bagde = x.network
          ? {
              type: OptionItemBadgeType.BADGE_RED,
              label: x.network,
            }
          : undefined;
        pairedCurrencyOptionsList.push({
          label: x.name,
          subLabel: x.symbol,
          img: x.image,
          value: { ...x, exchanges: [SwapCryptos.STEALTHEX] },
          bagde,
        });
      }
    });
    return pairedCurrencyOptionsList;
  };
  getMinMaxAmountAccepted = async (from: string, to: string) => {
    let requestHeaders: GenericObjectKeypair = {};
    requestHeaders[`${this.headerKey}`] = this.apiKey;

    const minMaxAcceptedRoute = this.urls.routes.minMaxAccepted;
    if (minMaxAcceptedRoute.trim().length === 0) return [];
    const minMaxRoute = `${this.urls.routes.minMaxAccepted}${from}/${to}?partner_fee=${this.partnerFeeAmount}`;
    if (this.logInfo) {
      Logger.log('minMaxRoute', { minMaxRoute, requestHeaders });
    }
    const response = (
      await axios.get(this.buildUrl(minMaxRoute), { headers: requestHeaders })
    ).data;
    return response.min_amount;
  };
  getExchangeEstimation = async (amount: string, from: string, to: string) => {
    let requestHeaders: GenericObjectKeypair = {};
    requestHeaders[`${this.headerKey}`] = this.apiKey;

    const requestConfig = {
      headers: requestHeaders,
      params: {
        amount: parseFloat(amount),
        partner_fee: Config.swapCryptos.stealthex.partnerFeeAmount ?? 0,
      },
    };

    const estimationRoute = `${this.urls.routes.estimation}${from}/${to}`;
    const link = `${Config.swapCryptos.stealthex.urls.referalBaseUrl}${
      Config.swapCryptos.stealthex.refId
    }&amount=${amount}&from=${from.toLowerCase()}&to=${to.toLowerCase()}`;
    if (this.logInfo) {
      Logger.log('estimationRoute', { estimationRoute, requestConfig, link });
    }

    const estimation = (
      await axios.get(this.buildUrl(estimationRoute), requestConfig)
    ).data;

    return {
      swapCrypto: SwapCryptos.STEALTHEX,
      link: link,
      logo: SVGIcons.SWAP_CRYPTOS_STEALTHEX,
      network: 'not_needed',
      name: SwapCryptos.STEALTHEX,
      from: from,
      to: to,
      amount: parseFloat(amount),
      estimation: estimation.estimated_amount,
    } as SwapCryptosEstimationDisplay;
  };
  getNewExchange = async (
    formData: ExchangeOperationForm,
  ): Promise<SwapCryptosExchangeResult> => {
    let data: GenericObjectKeypair = {
      fixed: formData.fixed,
      currency_from: formData.currencyFrom,
      currency_to: formData.currencyTo,
      amount_from: parseFloat(formData.amountFrom),
      partner_fee: Config.swapCryptos.stealthex.partnerFeeAmount,
      address_to: formData.addressTo,
    };
    if (formData.refundAddress.trim().length > 0) {
      data['refund_address'] = formData.refundAddress;
    }
    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const exchangeRoute = this.urls.routes.exchange;
    const finalUrl = this.buildUrl(exchangeRoute) + `?api_key=${this.apiKey}`;
    if (this.logInfo) {
      Logger.log('getNewExchange', {
        exchangeRoute,
        requestConfig,
        data,
        finalUrl,
      });
    }
    const exchangeResult = await axios.post(finalUrl, data, requestConfig);
    return {
      id: exchangeResult.data.id,
      link: this.urls.fullLinkToExchange + exchangeResult.data.id,
    } as SwapCryptosExchangeResult;
  };
}

export class SimpleSwapProvider
  extends SwapCryptosBaseProvider
  implements SwapCryptosBaseProviderInterface
{
  constructor(logInfo?: boolean) {
    super(Config.swapCryptos.simpleswap);
    this.name = SwapCryptos.SIMPLESWAP;
    this.logo = SVGIcons.SWAP_CRYPTOS_SIMPLESWAP;
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
    const pairedCurrencyRoute = `${this.urls.routes.currencyPair}?api_key=${this.apiKey}&fixed=false&symbol=${symbol}`;
    if (this.logInfo) {
      Logger.log('pairedCurrencyRoute', { pairedCurrencyRoute });
    }
    const [allCurrencies, pairedCurrencyList] = await Promise.all([
      axios.get(this.buildUrl(currenciesRoute)),
      axios.get(this.buildUrl(pairedCurrencyRoute)),
    ]);

    allCurrencies.data.map((x: any) => {
      if (pairedCurrencyList.data.includes(x.symbol)) {
        const bagde = x.network
          ? {
              type: OptionItemBadgeType.BADGE_RED,
              label: x.network,
            }
          : undefined;
        pairedCurrencyOptionsList.push({
          label: x.name.split(' ')[0],
          subLabel: x.symbol,
          img: x.image,
          value: { ...x, exchanges: [SwapCryptos.SIMPLESWAP] },
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
    const response = (await axios.get(this.buildUrl(minMaxRoute))).data;
    return response.min;
  };
  /**
   * Note: For simpleswap fee is set in the website, specifically: https://partners.simpleswap.io/webtools/api
   */
  getExchangeEstimation = async (amount: string, from: string, to: string) => {
    const estimationRoute = `${this.urls.routes.estimation}?api_key=${this.apiKey}&fixed=false&currency_from=${from}&currency_to=${to}&amount=${amount}`;
    const link = `${this.urls.referalBaseUrl}${
      this.refId
    }&from=${from.toLowerCase()}&to=${to.toLowerCase()}&amount=${amount}`;
    if (this.logInfo) {
      Logger.log('estimationRoute', { estimationRoute, link });
    }
    const estimation = (await axios.get(this.buildUrl(estimationRoute))).data;

    return {
      swapCrypto: SwapCryptos.SIMPLESWAP,
      link: link,
      logo: SVGIcons.SWAP_CRYPTOS_SIMPLESWAP,
      network: 'not_needed',
      name: SwapCryptos.SIMPLESWAP,
      from: from,
      to: to,
      amount: parseFloat(amount),
      estimation: estimation,
    } as SwapCryptosEstimationDisplay;
  };
  getNewExchange = async (formData: ExchangeOperationForm) => {
    const data: GenericObjectKeypair = {
      fixed: formData.fixed,
      currency_from: formData.currencyFrom,
      currency_to: formData.currencyTo,
      amount: parseFloat(formData.amountFrom),
      address_to: formData.addressTo,
      extra_id_to: '',
      user_refund_address:
        formData.refundAddress.trim().length > 0 ? formData.refundAddress : '',
      user_refund_extra_id: '',
    };
    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const exchangeRoute = this.urls.routes.exchange;
    const finalUrl = this.buildUrl(exchangeRoute) + `?api_key=${this.apiKey}`;
    if (this.logInfo) {
      Logger.log('getNewExchange', {
        exchangeRoute,
        requestConfig,
        data,
        finalUrl,
      });
    }
    const exchangeResult = await axios.post(finalUrl, data, requestConfig);
    return {
      id: exchangeResult.data.id,
      link: this.urls.fullLinkToExchange + exchangeResult.data.id,
    } as SwapCryptosExchangeResult;
  };
}

export class SwapCryptosMerger {
  providers: SwapCryptosBaseProviderInterface[];
  constructor(providers: SwapCryptosBaseProviderInterface[]) {
    this.providers = providers;
  }
  getCurrencyOptions = async (symbol: string): Promise<OptionItem[]> => {
    let providersCurrencyOptionsList: OptionItem[] = [];
    for (const provider of this.providers) {
      try {
        const currencyOptionList =
          await provider.getPairedCurrencyOptionItemList(symbol);
        for (const currencyOption of currencyOptionList) {
          const i = providersCurrencyOptionsList.findIndex(
            (e) => e.value.symbol === currencyOption.value.symbol,
          );
          if (i >= 0) {
            const exchanges: string[] =
              providersCurrencyOptionsList[i].value.exchanges;
            exchanges.push(currencyOption.value.exchanges[0]);
            providersCurrencyOptionsList[i] = {
              ...providersCurrencyOptionsList[i],
              value: {
                ...providersCurrencyOptionsList[i].value,
                exchanges: exchanges,
              },
            };
          } else {
            providersCurrencyOptionsList.push(currencyOption);
          }
        }
      } catch (error) {
        Logger.log('Error getting exchange currencies', { provider, error });
      }
    }

    return providersCurrencyOptionsList;
  };
  getMinMaxAccepted = async (
    startTokenOption: OptionItem,
    endTokenOption: OptionItem,
  ): Promise<
    {
      provider: SwapCryptos;
      amount: number;
    }[]
  > => {
    let providerMinMaxAmountList = [];
    for (const provider of this.providers) {
      try {
        const minMaxAccepted = await provider.getMinMaxAmountAccepted(
          startTokenOption.subLabel!,
          endTokenOption.subLabel!,
        );
        providerMinMaxAmountList.push({
          provider: provider.name as SwapCryptos,
          amount: parseFloat(minMaxAccepted),
        });
      } catch (error) {
        Logger.log('No min/max available in Exchange', { provider, error });
      }
    }
    return providerMinMaxAmountList;
  };
  getExchangeEstimation = async (
    amount: string,
    from: string,
    to: string,
  ): Promise<
    | {
        provider: SwapCryptos;
        estimation: SwapCryptosEstimationDisplay;
      }[]
    | undefined
  > => {
    let providerEstimationList = [];
    for (const provider of this.providers) {
      try {
        const estimation = await provider.getExchangeEstimation(
          amount,
          from,
          to,
        );
        providerEstimationList.push({
          provider: provider.name as SwapCryptos,
          estimation: estimation,
        });
      } catch (error) {
        Logger.log('No estimation available in Exchange', { provider, error });
      }
    }
    return providerEstimationList.length ? providerEstimationList : undefined;
  };
  getNewExchange = async (
    formData: ExchangeOperationForm,
    providerName: SwapCryptos,
  ): Promise<SwapCryptosExchangeResult | undefined> => {
    let result: SwapCryptosExchangeResult | undefined = undefined;
    try {
      result = await this.providers
        .find((p) => p.name === providerName)
        ?.getNewExchange(formData);
    } catch (error) {
      Logger.log('Error getting new exchange.', { providerName, error });
    } finally {
      return result;
    }
  };
}
