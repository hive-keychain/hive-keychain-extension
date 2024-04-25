import {
  SwapCryptos,
  SwapCryptosEstimationDisplay,
} from '@interfaces/swap-cryptos.interface';
import axios from 'axios';
import { OptionItem } from 'src/common-ui/custom-select/custom-select.component';
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

const getSupportedCurrenciesList = async () => {
  const allCurrencies = await axios.get(buildUrl('currency'), {
    headers,
  });
  return allCurrencies.data;
};

//TODo bellow check if needed at all
const getSupportedCurrenciesListCustomFee = async () => {
  const allCurrencies = await axios.get(buildUrl('fee/currency'), {
    headers,
  });
  return allCurrencies.data;
};

const getPairedCurrencyOptionItemList = async (pairedToSymbol: string) => {
  const supportedCurrenciesList =
    await SwapCryptosUtils.getSupportedCurrenciesList();
  let pairedCurrencyOptionsList: OptionItem[] = [];
  const { data: hiveAvailablePairList } = await axios.get(
    buildUrl(`pairs/${pairedToSymbol}`),
    {
      headers,
    },
  );
  supportedCurrenciesList.map((x: any) => {
    if (hiveAvailablePairList.includes(x.symbol)) {
      pairedCurrencyOptionsList.push({
        label: x.name,
        subLabel: x.symbol,
        img: x.image,
        value: x,
      });
    }
  });
  return pairedCurrencyOptionsList;
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
  return {
    swapCrypto: SwapCryptos.STEALTHEX,
    link: '//TODO',
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
  getSupportedCurrenciesList,
  getSupportedCurrenciesListCustomFee,
};
