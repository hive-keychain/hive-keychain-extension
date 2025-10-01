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
    if (from === 'HIVE') return;
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
    return [response.result.min, response.result.max];
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
