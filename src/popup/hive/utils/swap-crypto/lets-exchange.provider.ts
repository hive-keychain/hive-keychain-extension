import {
  ExchangeOperationForm,
  GenericObjectKeypair,
  SwapCryptoListItem,
  SwapCryptos,
  SwapCryptosBaseProvider,
  SwapCryptosBaseProviderInterface,
} from '@interfaces/swap-cryptos.interface';
import axios from 'axios';
import {
  OptionItem,
  OptionItemBadgeType,
} from 'src/common-ui/custom-select/custom-select.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import Config from 'src/config';

interface LetsExchangeCurrency {
  code: string;
  name: string;
  icon: string;
  price_change_24h: string;
  additional_info_get: string;
  additional_info_send: string;
  created_at_date: number;
  rating: number;
  coins_highest: string;
  stable: number;
  is_active: number;
  disabled: number;
  default_amount: string;
  min_amount: string;
  max_amount: string;
  default_network_code: string;
  default_network_name: string;
  networks: LetsExchangeNetwork[];
}
interface LetsExchangeNetwork {
  code: string;
  name: string;
  icon: string;
  is_active: number;
  has_extra: number;
  validation_address_regex: string;
  validation_address_extra_regex: string;
  extra_name: string;
  explorer: string;
  contract_address: string;
  chain_id: string;
  is_wallet_connect: number;
}
export class LetsExchangeProvider
  extends SwapCryptosBaseProvider
  implements SwapCryptosBaseProviderInterface
{
  name: string;
  logo: SVGIcons;
  constructor() {
    super(Config.swapCryptos.letsExchange);
    this.name = SwapCryptos.LETS_EXCHANGE;
    this.logo = SVGIcons.SWAP_CRYPTOS_LETS_EXCHANGE;
  }

  buildUrl = (route: string) => {
    const baseUrl = this.urls.baseUrl;
    return `${baseUrl}${route}`;
  };
  getPairedCurrencyOptionItemList = async (symbol: string) => {
    let pairedCurrencyOptionsList: OptionItem<SwapCryptoListItem>[] = [];
    let requestHeaders: GenericObjectKeypair = {};
    requestHeaders[`Authorization`] = `Bearer ${this.apiKey}`;
    const currenciesRoute = this.urls.routes.allCurrencies;
    const allCurrencies: LetsExchangeCurrency[] = (
      await axios.get(this.buildUrl(currenciesRoute), {
        headers: requestHeaders,
      })
    ).data;
    //Flatten to get one by code / network code combination
    const flattenedCurrencies = allCurrencies.flatMap((currency) =>
      currency.networks.map((network) => ({
        ...currency,
        network: network,
      })),
    );
    //     console.log(flattenedCurrencies, 'flattenedCurrencies');

    //list all network (code + name), no doublons
    const allNetworks = flattenedCurrencies.map((currency) => currency.network);
    const uniqueNetworks = allNetworks.filter(
      (network, index, self) =>
        index === self.findIndex((t) => t.code === network.code),
    );
    //     console.log(uniqueNetworks, 'uniqueNetworks');

    return flattenedCurrencies.map((currency) => ({
      label: currency.name.split(' ')[0],
      subLabel: currency.code,
      img: currency.icon,
      value: {
        name: currency.name,
        symbol: currency.code.toLowerCase(),
        network: currency.network.code.toLowerCase(),
        exchanges: [SwapCryptos.LETS_EXCHANGE],
      },
      bagde: {
        type: OptionItemBadgeType.BADGE_RED,
        label: currency.network.code.toLowerCase(),
      },
    }));
  };

  getMinMaxAmountAccepted = async (
    from: string,
    fromNetwork: string,
    to: string,
    toNetwork: string,
  ) => {
    return await [];
  };
  getExchangeEstimation = async (
    amount: string,
    from: string,
    fromNetwork: string,
    to: string,
    toNetwork: string,
  ) => {
    return await undefined;
  };
  getNewExchange = async (formData: ExchangeOperationForm) => {
    return await undefined;
  };
}
