import {
  ExchangeOperationForm,
  SwapCryptos,
  SwapCryptosBaseProviderInterface,
  SwapCryptosEstimationDisplay,
  SwapCryptosExchangeResult,
} from '@interfaces/swap-cryptos.interface';
import { OptionItem } from 'src/common-ui/custom-select/custom-select.component';
import Logger from 'src/utils/logger.utils';

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
    return providerEstimationList.length
      ? providerEstimationList.sort(
          (a, b) => b.estimation.estimation - a.estimation.estimation,
        )
      : undefined;
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
