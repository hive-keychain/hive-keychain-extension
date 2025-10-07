import { KeychainApi } from '@api/keychain';
import { HIVE_OPTION_ITEM } from '@popup/hive/pages/app-container/home/buy-coins/buy-ramps/ramps.component';
import { BuySwapCoinsEstimationComponent } from '@popup/hive/pages/app-container/home/buy-coins/buy-swap-coins-estimation-component/buy-swap-coins-estimation.component';

import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import {
  ExchangeEstimation,
  ExchangeMinMaxAmount,
  ExchangeableToken,
} from 'hive-keychain-commons';
import { ThrottleSettings, throttle } from 'lodash';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ConnectedProps, connect } from 'react-redux';
import {
  OptionItem,
  OptionItemBadgeType,
} from 'src/common-ui/custom-select/custom-select.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import Config from 'src/config';
import { useCountdown } from 'src/dialog/hooks/countdown.hook';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const SwapCryptos = ({ price }: PropsFromRedux) => {
  const [errorInApi, setErrorInApi] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [loadingMinMaxAccepted, setLoadingMinMaxAccepted] = useState(false);
  const isInitializedFromStorage = useRef(false);
  const [
    pairedCurrencyOptionsInitialList,
    setPairedCurrencyOptionsInitialList,
  ] = useState<OptionItem[]>([]);
  const [amount, setAmount] = useState('');
  const [startToken, setStartToken] = useState<OptionItem>(HIVE_OPTION_ITEM);
  const [exchangeRangeAmount, setExchangeRangeAmount] = useState({
    min: 0,
    max: 0,
  });
  const [endToken, setEndToken] = useState<OptionItem>(HIVE_OPTION_ITEM);
  const [startTokenListOptions, setStartTokenListOptions] = useState<
    OptionItem[]
  >([HIVE_OPTION_ITEM]);
  const [endTokenListOptions, setEndTokenListOptions] = useState<OptionItem[]>([
    HIVE_OPTION_ITEM,
  ]);
  const [estimations, setEstimations] = useState<ExchangeEstimation[]>([]);
  const { countdown, refreshCountdown, nullifyCountdown } = useCountdown(
    Config.swapCryptos.autoRefreshPeriodSec,
    () => {
      if (
        parseFloat(amount) > 0 &&
        Number(amount) >= exchangeRangeAmount.min &&
        !loadingMinMaxAccepted &&
        startToken &&
        endToken
      ) {
        getExchangeEstimate(
          amount,
          startToken,
          endToken,
          loadingMinMaxAccepted,
          exchangeRangeAmount,
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
      ) => {
        getExchangeEstimate(
          newAmount,
          newStartToken,
          newEndToken,
          newLoadingMinMaxAccepted,
          newExchangeRangeAmount,
        );
      },
      500,
      { leading: false } as ThrottleSettings,
    );
  }, []);

  // Throttled effect for amount changes only
  useEffect(() => {
    throttledRefresh(
      amount,
      startToken,
      endToken,
      loadingMinMaxAccepted,
      exchangeRangeAmount,
    );
  }, [amount]);

  useEffect(() => {
    if (
      startToken &&
      endToken &&
      startToken.value.symbol !== endToken.value.symbol
    ) {
      setLoadingMinMaxAccepted(true);
      setErrorInApi(undefined);
      setEstimations([]);
      setAmount('');
      getMinAndMax(startToken, endToken);
    }
  }, [startToken, endToken]);

  const init = async () => {
    KeychainApi.get('swap-cryptos/currencies')
      .then((currencyOptions: ExchangeableToken[]) => {
        if (currencyOptions.length === 0) {
          setErrorInApi('buy_coins_swap_cryptos_error_api');
          return;
        }
        setErrorInApi(undefined);
        const formattedCurrencyOptions = currencyOptions.map((i) => {
          return {
            label: i.name.toUpperCase(),
            value: i,
            img: i.icon,
            badge: {
              type: OptionItemBadgeType.BADGE_RED,
              label: i.displayedNetwork.toUpperCase(),
            },
          };
        });
        setPairedCurrencyOptionsInitialList(formattedCurrencyOptions);
      })
      .catch((error) => {
        setErrorInApi('buy_coins_swap_cryptos_error_api');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (
      pairedCurrencyOptionsInitialList.length &&
      !isInitializedFromStorage.current
    ) {
      isInitializedFromStorage.current = true;
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
            ) || pairedCurrencyOptionsList[0];
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
      await KeychainApi.get(
        `swap-cryptos/range/${startTokenOption.value.symbol}/${startTokenOption.value.network}/${endTokenOption.value.symbol}/${endTokenOption.value.network}`,
      ).then((res: ExchangeMinMaxAmount[]) => {
        if (!res || res.length === 0) {
          setErrorInApi('buy_coins_swap_cryptos_unsupported_pair');
          setExchangeRangeAmount({ min: 0, max: 0 });
          return;
        }
        const min = res.reduce((min, item) => {
          return item.min ? Math.min(min, item.min) : min;
        }, Infinity);
        const max = res.reduce((max, item) => {
          return item.max ? Math.max(max, item.max) : max;
        }, 0);
        setExchangeRangeAmount({ min, max });
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
  ) => {
    if (
      parseFloat(newAmount) > 0 &&
      parseFloat(newAmount) >= newExchangeRangeAmount.min &&
      parseFloat(newAmount) <= newExchangeRangeAmount.max &&
      !newLoadingMinMaxAccepted &&
      newStartToken &&
      newEndToken
    ) {
      try {
        setLoadingEstimate(true);
        KeychainApi.get(
          `swap-cryptos/estimate/${newAmount}/${newStartToken.value.symbol}/${newStartToken.value.network}/${newEndToken.value.symbol}/${newEndToken.value.network}`,
        )
          .then((res: ExchangeEstimation[]) => {
            if (!res) {
              if (
                +amount > newExchangeRangeAmount.max ||
                +amount < newExchangeRangeAmount.min
              ) {
                setErrorInApi('buy_coins_swap_cryptos_out_of_range');
                return;
              }
              setErrorInApi('buy_coins_swap_cryptos_error_api');
              return;
            }
            setErrorInApi(undefined);
            setEstimations(res);
            LocalStorageUtils.saveValueInLocalStorage(
              LocalStorageKeyEnum.LAST_CRYPTO_ESTIMATION,
              {
                from: newStartToken.subLabel!,
                to: newEndToken.subLabel!,
              },
            );
          })
          .finally(() => {
            setLoadingEstimate(false);
          });
        refreshCountdown();
      } catch (error) {
        Logger.log({ error });
      }
    } else if (parseFloat(newAmount) === 0 || !newAmount.trim().length) {
      setEstimations([]);
      nullifyCountdown();
    }
  };

  const swapStartAndEnd = useCallback(() => {
    // Batch all state updates to prevent race conditions
    const tempStarTokentListOptions = startTokenListOptions;
    const tempEndTokenListOptions = endTokenListOptions;
    const tempStartToken = startToken;
    const tempEndToken = endToken;

    // Use functional updates to ensure we're working with the latest state
    setStartToken(tempEndToken);
    setEndToken(tempStartToken);
    setStartTokenListOptions(tempEndTokenListOptions);
    setEndTokenListOptions(tempStarTokentListOptions);
    setEstimations([]);
    setAmount('');
    setErrorInApi(undefined);
  }, [startToken, endToken, startTokenListOptions, endTokenListOptions]);

  return (
    <div className="swap-cryptos">
      {loading && (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
      )}
      {!loading &&
        startTokenListOptions.length !== 0 &&
        startToken &&
        endTokenListOptions.length !== 0 &&
        endToken && (
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
            maxAcceptedAmount={exchangeRangeAmount.max}
            maxAmountLabel={'html_popup_swap_crypto_max_accepted_label'}
            swapTokens={swapStartAndEnd}
            displayReceiveTokenLogo
            errorMessage={errorInApi}
            loadingEstimate={loadingEstimate}
          />
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
