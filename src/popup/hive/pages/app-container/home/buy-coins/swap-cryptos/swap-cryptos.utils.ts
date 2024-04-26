import {
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

interface GenericObjectKeypair {
  [key: string]: string;
}

let headers: GenericObjectKeypair = {};
headers[`${Config.swapCryptos.stealthex.headerKey}`] =
  Config.swapCryptos.stealthex.apiKey;

//TODO define this in class
//specific for stealthx
const buildUrl = (route: string) => {
  const baseUrl = Config.swapCryptos.stealthex.baseUrl;
  return `${baseUrl}${route}`;
};

const getSupportedCurrenciesCustomFeeList = async () => {
  const allCurrencies = await axios.get(buildUrl('fee/currency'), {
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
  const { data: hiveAvailablePairCustomFeeList } = await axios.get(
    buildUrl(`fee/pairs/${pairedToSymbol}`),
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

const getMinAndMaxAmountAccepted = async (
  startTokenSymbol: string,
  endTokenSymbol: string,
) => {
  const responseCustomFee = await axios(
    buildUrl(`fee/range/${startTokenSymbol}/${endTokenSymbol}`),
    {
      headers,
      params: {
        partner_fee: Config.swapCryptos.stealthex.partner_fee ?? 0,
      },
    },
  );
  return responseCustomFee.data;
};

const getExchangeEstimationCustomFee = async (
  amount: string,
  startTokenSymbol: string,
  endTokenSymbol: string,
): Promise<SwapCryptosEstimationDisplay> => {
  const response = await axios.get(
    buildUrl(`fee/estimate/${startTokenSymbol}/${endTokenSymbol}`),
    {
      headers,
      params: {
        amount: parseFloat(amount),
        partner_fee: Config.swapCryptos.stealthex.partner_fee ?? 0,
      },
    },
  );
  const getRefOperationLink = (
    amount: string,
    fromToken: string,
    toToken: string,
  ) => {
    return `${Config.swapCryptos.stealthex.baseRefereeUrl}${Config.swapCryptos.stealthex.refId}&amount=${amount}&from=${fromToken}&to=${toToken}`;
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
  getMinAndMaxAmountAccepted,
  getPairedCurrencyOptionItemList,
  getSupportedCurrenciesCustomFeeList,
};
