import { SwapCryptosEstimationDisplay } from '@interfaces/swap-cryptos.interface';
import { HIVE_OPTION_ITEM } from '@popup/hive/pages/app-container/home/buy-coins/buy-ramps/ramps.component';
import { BuySwapCoinsEstimationComponent } from '@popup/hive/pages/app-container/home/buy-coins/buy-swap-coins-estimation-component/buy-swap-coins-estimation.component';
import {
  SimpleSwapProvider,
  StealthexProvider,
  SwapCryptosMerger,
} from '@popup/hive/pages/app-container/home/buy-coins/swap-cryptos.utils';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { ThrottleSettings, throttle } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { OptionItem } from 'src/common-ui/custom-select/custom-select.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import Config from 'src/config';
import { useCountdown } from 'src/dialog/hooks/countdown.hook';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const SwapCryptos = ({ price }: PropsFromRedux) => {
  const [errorInApi, setErrorInApi] = useState<string>();
  const [swapCryptos, setSetswapCryptos] = useState<SwapCryptosMerger>();
  const [loadingMinMaxAccepted, setLoadingMinMaxAccepted] = useState(false);
  const [
    pairedCurrencyOptionsInitialList,
    setPairedCurrencyOptionsInitialList,
  ] = useState<OptionItem[]>([]);
  const [amount, setAmount] = useState('');
  const [startToken, setStartToken] = useState<OptionItem>();
  const [exchangeRangeAmount, setExchangeRangeAmount] = useState({
    min: 0,
    max: 0,
  });
  const [endToken, setEndToken] = useState<OptionItem>();
  const [startTokenListOptions, setStartTokenListOptions] = useState<
    OptionItem[]
  >([]);
  const [endTokenListOptions, setEndTokenListOptions] = useState<OptionItem[]>(
    [],
  );
  const [estimations, setEstimations] = useState<
    SwapCryptosEstimationDisplay[]
  >([]);
  const [loadingEstimation, setLoadingEstimation] = useState(false);
  const { countdown, refreshCountdown, nullifyCountdown } = useCountdown(
    Config.swapCryptos.autoRefreshPeriodSec,
    () => {
      if (
        parseFloat(amount) > 0 &&
        Number(amount) >= exchangeRangeAmount.min &&
        !loadingMinMaxAccepted &&
        startToken &&
        endToken &&
        swapCryptos
      ) {
        setLoadingEstimation(true);
        getExchangeEstimate(
          amount,
          startToken,
          endToken,
          loadingMinMaxAccepted,
          exchangeRangeAmount,
          swapCryptos,
        );
      }
    },
  );
  useEffect(() => {
    init();
    return () => {
      throttledRefresh.cancel();
    };
  }, []);

  const throttledRefresh = useMemo(() => {
    return throttle(
      (
        newAmount,
        newStartToken,
        newEndToken,
        newLoadingMinMaxAccepted,
        newExchangeRangeAmount,
        newSwapCryptos,
      ) => {
        getExchangeEstimate(
          newAmount,
          newStartToken,
          newEndToken,
          newLoadingMinMaxAccepted,
          newExchangeRangeAmount,
          newSwapCryptos,
        );
      },
      1000,
      { leading: false } as ThrottleSettings,
    );
  }, []);

  useEffect(() => {
    throttledRefresh(
      amount,
      startToken,
      endToken,
      loadingMinMaxAccepted,
      exchangeRangeAmount,
      swapCryptos,
    );
  }, [
    amount,
    startToken,
    endToken,
    loadingMinMaxAccepted,
    exchangeRangeAmount,
  ]);

  useEffect(() => {
    if (startToken && endToken) {
      setLoadingMinMaxAccepted(true);
      getMinAndMax(startToken, endToken);
    }
  }, [startToken, endToken]);

  const init = async () => {
    try {
      const newSwapCryptos = new SwapCryptosMerger([
        new StealthexProvider(true),
        new SimpleSwapProvider(true),
      ]);
      setSetswapCryptos(newSwapCryptos);
      newSwapCryptos.getCurrencyOptions('HIVE').then((currencyOptions) => {
        setPairedCurrencyOptionsInitialList(currencyOptions);
      });
    } catch (error) {
      Logger.log({ error });
    }
  };

  useEffect(() => {
    if (pairedCurrencyOptionsInitialList.length) {
      initializeFromStorage(pairedCurrencyOptionsInitialList);
    }
  }, [pairedCurrencyOptionsInitialList]);

  const initializeFromStorage = async (
    pairedCurrencyOptionsList: OptionItem[],
  ) => {
    const lastCryptoEstimation =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.LAST_CRYPTO_ESTIMATION,
      );
    let tempStartTokenOptionItem = HIVE_OPTION_ITEM;
    let tempStartTokenOptionItemList = [HIVE_OPTION_ITEM];
    let tempEndtTokenOptionItem = pairedCurrencyOptionsList[0];
    let tempEndTokenOptionItemList = pairedCurrencyOptionsList;
    if (lastCryptoEstimation) {
      tempStartTokenOptionItem =
        lastCryptoEstimation.from === HIVE_OPTION_ITEM.subLabel!
          ? HIVE_OPTION_ITEM
          : pairedCurrencyOptionsList.find(
              (i) => i.subLabel! === lastCryptoEstimation.from,
            )!;
      tempStartTokenOptionItemList =
        lastCryptoEstimation.from === HIVE_OPTION_ITEM.subLabel!
          ? [HIVE_OPTION_ITEM]
          : pairedCurrencyOptionsList;
      tempEndtTokenOptionItem =
        lastCryptoEstimation.to === HIVE_OPTION_ITEM.subLabel!
          ? HIVE_OPTION_ITEM
          : pairedCurrencyOptionsList.find(
              (i) => i.subLabel! === lastCryptoEstimation.to,
            )!;
      tempEndTokenOptionItemList =
        lastCryptoEstimation.to === HIVE_OPTION_ITEM.subLabel!
          ? [HIVE_OPTION_ITEM]
          : pairedCurrencyOptionsList;
    }
    setStartToken(tempStartTokenOptionItem);
    setStartTokenListOptions(tempStartTokenOptionItemList);
    setEndToken(tempEndtTokenOptionItem);
    setEndTokenListOptions(tempEndTokenOptionItemList);
  };

  const getMinAndMax = async (
    startTokenOption: OptionItem,
    endTokenOption: OptionItem,
  ) => {
    try {
      await swapCryptos
        ?.getMinMaxAccepted(startTokenOption, endTokenOption)
        .then((res) => {
          if (res) {
            if (res.length === 1) {
              setExchangeRangeAmount({ min: res[0].amount, max: 0 });
            } else if (res.length > 1) {
              const minValue = res.sort((a, b) => a.amount - b.amount)[0]
                .amount;
              setExchangeRangeAmount({
                min: minValue,
                max: 0,
              });
            }
          }
        });
      setLoadingMinMaxAccepted(false);
    } catch (error) {
      Logger.log({ error });
    }
  };

  const getExchangeEstimate = async (
    newAmount: string,
    newStartToken: OptionItem,
    newEndToken: OptionItem,
    newLoadingMinMaxAccepted: boolean,
    newExchangeRangeAmount: { min: number; max: number },
    newSwapCryptos: SwapCryptosMerger,
  ) => {
    if (
      parseFloat(newAmount) > 0 &&
      parseFloat(newAmount) >= newExchangeRangeAmount.min &&
      !newLoadingMinMaxAccepted &&
      newStartToken &&
      newEndToken &&
      newSwapCryptos
    ) {
      try {
        setLoadingEstimation(true);
        newSwapCryptos
          .getExchangeEstimation(
            newAmount,
            newStartToken.subLabel!,
            newEndToken.subLabel!,
          )
          .then((res) => {
            if (!res) {
              setErrorInApi('buy_coins_swap_cryptos_error_api');
              return;
            }
            setErrorInApi(undefined);
            setEstimations(
              res.map(({ estimation }) => {
                return { ...estimation };
              }),
            );
            LocalStorageUtils.saveValueInLocalStorage(
              LocalStorageKeyEnum.LAST_CRYPTO_ESTIMATION,
              {
                from: newStartToken.subLabel!,
                to: newEndToken.subLabel!,
              },
            );
          });
        setLoadingEstimation(false);
        refreshCountdown();
      } catch (error) {
        Logger.log({ error });
      }
    } else if (parseFloat(newAmount) === 0 || !newAmount.trim().length) {
      setEstimations([]);
      nullifyCountdown();
    }
  };

  const swapStartAndEnd = () => {
    const tempStarTokentListOptions = [...startTokenListOptions];
    const tempEndTokenListOptions = [...endTokenListOptions];
    const tempStartToken = { ...startToken! };
    const tempEndToken = { ...endToken! };
    setEndToken(tempStartToken);
    setStartToken(tempEndToken);
    setStartTokenListOptions(tempEndTokenListOptions);
    setEndTokenListOptions(tempStarTokentListOptions);
    setEstimations([]);
    setAmount('');
  };

  return (
    <div className="swap-cryptos">
      {startTokenListOptions.length !== 0 &&
      startToken &&
      endTokenListOptions.length !== 0 &&
      endToken ? (
        <BuySwapCoinsEstimationComponent
          startToken={startToken}
          startTokenList={startTokenListOptions}
          setStartToken={setStartToken}
          startTokenLabel="token"
          endToken={endToken}
          endTokenList={endTokenListOptions}
          setEndToken={setEndToken}
          endTokenLabel="token"
          amount={amount}
          setAmount={setAmount}
          inputAmountLabel={'popup_html_transfer_amount'}
          inputPlaceHolder={'popup_html_transfer_amount'}
          estimations={estimations}
          countdown={countdown}
          minAmountLabel={'html_popup_swap_crypto_min_accepted_label'}
          minAcceptedAmount={exchangeRangeAmount.min}
          swapTokens={swapStartAndEnd}
          displayReceiveTokenLogo
          errorMessage={errorInApi}
        />
      ) : (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    price: state.hive.currencyPrices,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SwapCryptosComponent = connector(SwapCryptos);
function buildUrl(arg0: string): string {
  throw new Error('Function not implemented.');
}
