import {
  GenericObjectKeypair,
  SwapCryptos,
  SwapCryptosEstimationDisplay,
} from '@interfaces/swap-cryptos.interface';
import axios from 'axios';
import {
  OptionItem,
  OptionItemBadgeType,
} from 'src/common-ui/custom-select/custom-select.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import Config from 'src/config';

let headers: GenericObjectKeypair = {};
headers[`${Config.swapCryptos.stealthex.headerKey}`] =
  Config.swapCryptos.stealthex.apiKey;

const buildUrl = (route: string) => {
  const baseUrl = Config.swapCryptos.stealthex.urls.baseUrl;
  return `${baseUrl}${route}`;
};

const getSupportedCurrenciesCustomFeeList = async () => {
  const route = `${Config.swapCryptos.stealthex.urls.routes.allCurrencies}`;
  const allCurrencies = await axios.get(buildUrl(route), {
    headers,
  });
  return allCurrencies.data;
};

const getPairedCurrencyOptionItemList = async (pairedToSymbol: string) => {
  let pairedCurrencyCustomFeeOptionsList: OptionItem[] = [];
  //get token info full list from exchange with supported custom fee
  const supportedCurrenciesListCustomFee =
    await SwapCryptosUtils.getSupportedCurrenciesCustomFeeList();
  //get paired to HIVE with custom fees
  const pairRoute = `${Config.swapCryptos.stealthex.urls.routes.currencyPair}${pairedToSymbol}`;
  const { data: hiveAvailablePairCustomFeeList } = await axios.get(
    buildUrl(pairRoute),
    { headers },
  );
  supportedCurrenciesListCustomFee.map((x: any) => {
    //adding optionitem list using both lists + token info list
    if (hiveAvailablePairCustomFeeList.includes(x.symbol)) {
      const bagde = x.network
        ? {
            type: OptionItemBadgeType.BADGE_GREEN,
            label: x.network,
          }
        : undefined;
      pairedCurrencyCustomFeeOptionsList.push({
        label: x.name,
        subLabel: x.symbol,
        img: x.image,
        value: x,
        bagde,
      });
    }
  });
  return pairedCurrencyCustomFeeOptionsList;
};

const getMinAndMaxAmountAcceptedCustomFee = async (
  startTokenSymbol: string,
  endTokenSymbol: string,
) => {
  const route = `${Config.swapCryptos.stealthex.urls.routes.minMaxAccepted}${startTokenSymbol}/${endTokenSymbol}`;
  const responseCustomFee = await axios(buildUrl(route), {
    headers,
    params: {
      partner_fee: Config.swapCryptos.stealthex.partnerFeeAmount ?? 0,
    },
  });
  return responseCustomFee.data;
};

const getExchangeEstimationCustomFee = async (
  amount: string,
  startTokenSymbol: string,
  endTokenSymbol: string,
): Promise<SwapCryptosEstimationDisplay> => {
  const route = `${Config.swapCryptos.stealthex.urls.routes.estimation}${startTokenSymbol}/${endTokenSymbol}`;
  const response = await axios.get(buildUrl(route), {
    headers,
    params: {
      amount: parseFloat(amount),
      partner_fee: Config.swapCryptos.stealthex.partnerFeeAmount ?? 0,
    },
  });
  const getRefOperationLink = (
    amount: string,
    fromToken: string,
    toToken: string,
  ) => {
    const link = `${Config.swapCryptos.stealthex.urls.referalBaseUrl}${Config.swapCryptos.stealthex.refId}&amount=${amount}&from=${fromToken}&to=${toToken}`;
    return link;
  };
  return {
    swapCrypto: SwapCryptos.STEALTHEX,
    link: getRefOperationLink(amount, startTokenSymbol, endTokenSymbol),
    logo: SVGIcons.STEALTHEX,
    network: 'not_needed',
    name: SwapCryptos.STEALTHEX,
    from: startTokenSymbol,
    to: endTokenSymbol,
    amount: parseFloat(amount),
    estimation: response.data.estimated_amount,
  };
};

export const SwapCryptosUtils = {
  getExchangeEstimationCustomFee,
  getMinAndMaxAmountAcceptedCustomFee,
  getPairedCurrencyOptionItemList,
  getSupportedCurrenciesCustomFeeList,
};
