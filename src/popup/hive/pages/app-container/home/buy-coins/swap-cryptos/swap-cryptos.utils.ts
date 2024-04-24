import {
  SwapCryptos,
  SwapCryptosCurrencyInfo,
  SwapCryptosEstimationDisplay,
} from '@interfaces/swap-cryptos.interface';
import axios from 'axios';
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

const getPairedCurrencies = async (pairedToSymbol: string) => {
  let currencyOptions: SwapCryptosCurrencyInfo[] = [];
  const hiveAvailablePairList = await axios.get(
    buildUrl(`pairs/${pairedToSymbol}`),
    {
      headers,
    },
  );
  //TODO for now just using first 20.
  const tempHivePairsList = (hiveAvailablePairList.data as string[]).slice(
    0,
    20,
  );
  for (const pairedSymbol of tempHivePairsList) {
    const { data } = await axios.get(buildUrl(`currency/${pairedSymbol}`), {
      headers,
    });
    if (data) {
      const { symbol, image, name, network } = data;
      currencyOptions.push({
        symbol,
        iconUrl: image,
        name,
        network,
      });
    }
  }
  return currencyOptions;
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
  getPairedCurrencies,
};
