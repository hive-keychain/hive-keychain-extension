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
  const response = await axios.get(
    buildUrl(`range/${startTokenSymbol}/${endTokenSymbol}`),
    { headers },
  );
  return response.data;
};

const getExchangeEstimation = async (
  amount: string,
  startTokenSymbol: string,
  endTokenSymbol: string,
): Promise<SwapCryptosEstimationDisplay> => {
  const response = await axios.get(
    buildUrl(`estimate/${startTokenSymbol}/${endTokenSymbol}`),
    {
      headers,
      params: {
        amount: parseFloat(amount),
      },
    },
  );
  console.log({ est: response.data }); //TODO remove line
  const getRefOperationLink = (
    amount: string,
    fromToken: string,
    toToken: string,
  ) => {
    return `https://stealthex.io/?ref=${Config.swapCryptos.stealthex.refId}&amount=${amount}&from=${fromToken}&to=${toToken}`;
  };
  //https://stealthex.io/?ref=ldJCcGZA9H&amount=0.91&from=BTC&to=ETH
  return {
    swapCrypto: SwapCryptos.STEALTHEX,
    link: getRefOperationLink(amount, startTokenSymbol, endTokenSymbol),
    logo: SVGIcons.STEALTHEX,
    network: '//TODO',
    name: SwapCryptos.STEALTHEX,
    from: startTokenSymbol,
    to: endTokenSymbol,
    amount: parseFloat(amount),
    estimation: response.data.estimated_amount,
  };
};

export const SwapCryptosUtils = {
  getExchangeEstimation,
  getMinAndMaxAmountAccepted,
  getPairedCurrencyOptionItemList,
  getSupportedCurrenciesCustomFeeList,
};
