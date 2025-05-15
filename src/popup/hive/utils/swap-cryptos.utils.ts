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

export interface SwapCryptoListItem {
  name: string;
  symbol: string;
  network: string;
  precision: number;
  exchanges: SwapCryptos[];
}
export class StealthexProvider
  extends SwapCryptosBaseProvider
  implements SwapCryptosBaseProviderInterface
{
  pairedCurrencyOptionsList: OptionItem<SwapCryptoListItem>[] = [];
  constructor() {
    super(Config.swapCryptos.stealthex);
    this.name = SwapCryptos.STEALTHEX;
    this.logo = SVGIcons.SWAP_CRYPTOS_STEALTHEX;
  }
  name: string;
  logo: SVGIcons;
  buildUrl = (route: string) => {
    const baseUrl = this.urls.baseUrl;
    return `${baseUrl}${route}`;
  };
  getPairedCurrencyOptionItemList = async (symbol: string) => {
    let pairedCurrencyOptionsList: OptionItem<SwapCryptoListItem>[] = [];
    let requestHeaders: GenericObjectKeypair = {};
    requestHeaders[`Authorization`] = `Bearer ${this.apiKey}`;

    const currenciesRoute = this.urls.routes.allCurrencies;
    const currencyPairRoute = this.urls.routes.currencyPair;

    // Fetch all currencies by iterating offset in batches of 4 (parallel)
    let allCurrenciesData: any[] = [];
    let offset = 0;
    let hasMore = true;
    const batchSize = 10;
    while (hasMore) {
      const requests = [];
      for (let i = 0; i < batchSize; i++) {
        requests.push(
          axios.get(this.buildUrl(currenciesRoute), {
            headers: requestHeaders,
            params: { limit: 250, offset: offset + i * 250 },
          }),
        );
      }
      const responses = await Promise.all(requests);
      let anyBatchLessThan250 = false;
      for (const response of responses) {
        const batch = response.data;
        allCurrenciesData = allCurrenciesData.concat(batch);
        if (!batch || batch.length < 250) {
          anyBatchLessThan250 = true;
        }
      }
      if (anyBatchLessThan250) {
        hasMore = false;
      } else {
        offset += batchSize * 250;
      }
    }
    const pairedCurrencyList = await axios.get(
      this.buildUrl(currencyPairRoute + `${symbol}/mainnet`),
      {
        headers: requestHeaders,
        params: {
          include_available_routes: true,
        },
      },
    );

    pairedCurrencyList.data.available_routes.map((currency: any) => {
      const bagde = currency.network
        ? {
            type: OptionItemBadgeType.BADGE_RED,
            label: currency.network,
          }
        : undefined;
      const thisCurrency = allCurrenciesData.find(
        (c: any) =>
          c.symbol === currency.symbol && c.network === currency.network,
      );
      if (!thisCurrency) return; // skip if not found
      pairedCurrencyOptionsList.push({
        label: thisCurrency.name,
        subLabel: thisCurrency.symbol,
        img: thisCurrency.icon_url,
        value: {
          name: thisCurrency.name,
          symbol: thisCurrency.symbol,
          network: thisCurrency.network,
          precision: thisCurrency.precision,
          exchanges: [SwapCryptos.STEALTHEX],
        },
        bagde,
      });
    });
    this.pairedCurrencyOptionsList = pairedCurrencyOptionsList;
    return pairedCurrencyOptionsList;
  };

  getRouteParams = (from: string, to: string, otherParams?: any) => {
    const hiveObj = { symbol: 'hive', network: 'mainnet' };
    const isFromHive = from.toLowerCase() === hiveObj.symbol;
    const other = this.pairedCurrencyOptionsList.find(
      (c) => c.value.symbol === (isFromHive ? to : from),
    )!;
    const params = {
      route: isFromHive
        ? {
            from: hiveObj,
            to: { symbol: other.value.symbol, network: other.value.network },
          }
        : {
            from: { symbol: other.value.symbol, network: other.value.network },
            to: hiveObj,
          },
      estimation: 'direct',
      rate: 'floating',
      ...otherParams,
    };
    return params;
  };
  getMinMaxAmountAccepted = async (from: string, to: string) => {
    let requestHeaders: GenericObjectKeypair = {};
    requestHeaders[`Authorization`] = `Bearer ${this.apiKey}`;

    const minMaxAcceptedRoute = this.urls.routes.minMaxAccepted;
    if (minMaxAcceptedRoute.trim().length === 0) return [];
    const minMaxRoute = `${this.urls.routes.minMaxAccepted}`;
    const response = (
      await axios.post(
        this.buildUrl(minMaxRoute),
        this.getRouteParams(from, to),
        {
          headers: requestHeaders,
        },
      )
    ).data;
    return response.min_amount;
  };
  getExchangeEstimation = async (amount: string, from: string, to: string) => {
    let requestHeaders: GenericObjectKeypair = {};
    requestHeaders[`Authorization`] = `Bearer ${this.apiKey}`;

    const requestData = {
      ...this.getRouteParams(from, to, {
        amount: parseFloat(amount),
        additional_fee_percent:
          Config.swapCryptos.stealthex.partnerFeeAmount ?? 0,
      }),
    };

    const estimationRoute = `${this.urls.routes.estimation}`;
    const link = `${Config.swapCryptos.stealthex.urls.referalBaseUrl}${
      Config.swapCryptos.stealthex.refId
    }&amount=${amount}&from=${from.toLowerCase()}&to=${to.toLowerCase()}`;

    const estimation = (
      await axios.post(this.buildUrl(estimationRoute), requestData, {
        headers: requestHeaders,
      })
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
  constructor() {
    super(Config.swapCryptos.simpleswap);
    this.name = SwapCryptos.SIMPLESWAP;
    this.logo = SVGIcons.SWAP_CRYPTOS_SIMPLESWAP;
  }
  pairedCurrencyOptionsList: OptionItem<SwapCryptoListItem>[] = [];
  name: string;
  logo: SVGIcons;
  buildUrl = (route: string) => {
    const baseUrl = this.urls.baseUrl;
    return `${baseUrl}${route}`;
  };
  getPairedCurrencyOptionItemList = async (symbol: string) => {
    let pairedCurrencyOptionsList: OptionItem<SwapCryptoListItem>[] = [];
    const currenciesRoute = `${this.urls.routes.allCurrencies}?api_key=${this.apiKey}`;
    const pairedCurrencyRoute = `${this.urls.routes.currencyPair}?api_key=${this.apiKey}&fixed=false&symbol=${symbol}`;
    const [allCurrencies, pairedCurrencyList] = await Promise.all([
      axios.get(this.buildUrl(currenciesRoute)),
      axios.get(this.buildUrl(pairedCurrencyRoute)),
    ]);

    allCurrencies.data.map((currency: any) => {
      if (pairedCurrencyList.data.includes(currency.symbol)) {
        const bagde = currency.network
          ? {
              type: OptionItemBadgeType.BADGE_RED,
              label: currency.network,
            }
          : undefined;
        pairedCurrencyOptionsList.push({
          label: currency.name.split(' ')[0],
          subLabel: currency.symbol,
          img: currency.image,
          value: {
            name: currency.name,
            symbol: currency.symbol,
            network: currency.network,
            precision: currency.precision,
            exchanges: [SwapCryptos.SIMPLESWAP],
          },
          bagde,
        });
      }
    });
    this.pairedCurrencyOptionsList = pairedCurrencyOptionsList;
    return pairedCurrencyOptionsList;
  };

  getTickersAndNetworks = (from: string, to: string) => {
    const fromHive = from.toLowerCase() === 'hive';
    const otherCurrency = this.pairedCurrencyOptionsList.find(
      (c) => c.value.symbol === (fromHive ? to : from),
    );
    return {
      tickerFrom: fromHive ? 'hive' : otherCurrency?.value.symbol,
      networkFrom: fromHive ? 'hive' : otherCurrency?.value.network,
      tickerTo: !fromHive ? 'hive' : otherCurrency?.value.symbol,
      networkTo: !fromHive ? 'hive' : otherCurrency?.value.network,
    };
  };
  getMinMaxAmountAccepted = async (from: string, to: string) => {
    const minMaxAcceptedRoute = this.urls.routes.minMaxAccepted;
    if (minMaxAcceptedRoute.trim().length === 0) return [];
    const minMaxRoute = `${this.urls.routes.minMaxAccepted}`;
    const response = (
      await axios.get(this.buildUrl(minMaxRoute), {
        params: {
          api_key: this.apiKey,
          fixed: false,
          ...this.getTickersAndNetworks(from, to),
        },
      })
    ).data;
    return response.result.min;
  };
  /**
   * Note: For simpleswap fee is set in the website, specifically: https://partners.simpleswap.io/webtools/api
   */
  getExchangeEstimation = async (amount: string, from: string, to: string) => {
    if (from === 'HIVE') return;
    const estimationRoute = this.urls.routes.estimation;
    const link = `${this.urls.referalBaseUrl}${
      this.refId
    }&from=${from.toLowerCase()}&to=${to.toLowerCase()}&amount=${amount}`;
    const estimation = (
      await axios.get(`https://simpleswap.io/api/v4/estimates`, {
        params: {
          // api_key: this.apiKey,
          fixed: false,
          ...this.getTickersAndNetworks(from, to),
          amount,
          reverse: false,
        },
      })
    ).data;
    if (+amount > +estimation.result.max) return;
    return {
      swapCrypto: SwapCryptos.SIMPLESWAP,
      link: link,
      logo: SVGIcons.SWAP_CRYPTOS_SIMPLESWAP,
      network: 'not_needed',
      name: SwapCryptos.SIMPLESWAP,
      from: from,
      to: to,
      amount: parseFloat(amount),
      estimation: parseFloat(estimation.result.estimate),
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
        if (!estimation) continue;
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
