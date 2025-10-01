import {
  ExchangeOperationForm,
  GenericObjectKeypair,
  SwapCryptoListItem,
  SwapCryptos,
  SwapCryptosBaseProvider,
  SwapCryptosBaseProviderInterface,
  SwapCryptosEstimationDisplay,
  SwapCryptosExchangeResult,
} from '@interfaces/swap-cryptos.interface';
import axios from 'axios';
import {
  OptionItem,
  OptionItemBadgeType,
} from 'src/common-ui/custom-select/custom-select.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import Config from 'src/config';

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
    return [response.min_amount, response.max_amount];
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
