import { CurrencyPrices } from '@interfaces/bittrex.interface';
import {
  RampEstimationDisplay,
  RampFiatCurrency,
  RampType,
} from '@interfaces/ramps.interface';
import {
  RampMerger,
  RampProvider,
  TransakProvider,
} from '@popup/hive/pages/app-container/home/buy-coins/buy-ramps/ramps.utils';
import { BuySwapCoinsEstimationComponent } from '@popup/hive/pages/app-container/home/buy-coins/buy-swap-coins-estimation-component/buy-swap-coins-estimation.component';
import { ThrottleSettings, throttle } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { OptionItem } from 'src/common-ui/custom-select/custom-select.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import Config from 'src/config';
import { useCountdown } from 'src/dialog/hooks/countdown.hook';

export const HIVE_OPTION_ITEM = {
  label: 'HIVE',
  subLabel: 'HIVE',
  value: 'HIVE',
  img: `/assets/images/wallet/hive-logo.svg`,
} as OptionItem;

const BuyRamps = ({
  username,
  price,
}: {
  username: string;
  price: CurrencyPrices;
}) => {
  const [ramps, setRamps] = useState<RampMerger>();
  const [errorInApi, setErrorInApi] = useState<string>();
  const [currencies, setCurrencies] = useState<RampFiatCurrency[]>([]);
  const [fiat, setFiat] = useState<OptionItem<RampFiatCurrency>>();
  const [amount, setAmount] = useState('');
  const [estimations, setEstimations] = useState<RampEstimationDisplay[]>([]);
  const { countdown, refreshCountdown } = useCountdown(
    Config.ramps.autoRefreshPeriodSec,
    () => {
      getEstimations(false, amount, fiat!, ramps!);
    },
  );
  useEffect(() => {
    throttledRefresh(amount, fiat, ramps);
  }, [amount, fiat, ramps]);

  const throttledRefresh = useMemo(() => {
    return throttle(
      (newAmount, newFiatCurrenc, newRamps) => {
        getEstimations(true, newAmount, newFiatCurrenc, newRamps);
      },
      1000,
      { leading: false } as ThrottleSettings,
    );
  }, []);

  const getEstimations = async (
    shouldRefresh: boolean,
    amount: string,
    fiat: OptionItem<RampFiatCurrency>,
    ramps: RampMerger,
  ) => {
    if (ramps && parseFloat(amount) > 0 && fiat) {
      const estimations = await ramps.getEstimations(
        RampType.BUY,
        +amount,
        fiat!.value.symbol,
        // 'HIVE',
        // 'HIVE',
        // username,
        'BTC',
        'BTC',
        'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      );

      if (estimations) {
        setErrorInApi(undefined);
        setEstimations(estimations);
      } else {
        setErrorInApi('buy_coins_swap_cryptos_error_api');
      }

      if (shouldRefresh) refreshCountdown();
    }
  };

  useEffect(() => {
    const newRamps = new RampMerger([
      new TransakProvider(),
      new RampProvider(),
    ]);
    setRamps(newRamps);
    newRamps.getFiatCurrencyOptions().then((currencyOptions) => {
      setCurrencies(currencyOptions);
      setFiat({
        value: currencyOptions[0],
        label: currencyOptions[0].name,
        subLabel: currencyOptions[0].symbol,
        img: currencyOptions[0].icon,
      });
    });
    return () => {
      throttledRefresh.cancel();
    };
  }, []);

  return (
    <div className="ramps">
      {currencies.length !== 0 && fiat ? (
        <BuySwapCoinsEstimationComponent
          startToken={fiat}
          startTokenList={currencies.map((e) => ({
            label: e.name,
            value: e,
            img: e.icon,
            subLabel: e.symbol,
          }))}
          setStartToken={setFiat}
          startTokenLabel="fiat"
          amount={amount}
          setAmount={setAmount}
          inputAmountLabel="popup_html_transfer_amount"
          inputPlaceHolder="popup_html_transfer_amount"
          endToken={HIVE_OPTION_ITEM}
          endTokenList={[HIVE_OPTION_ITEM]}
          setEndToken={() => {}}
          endTokenLabel="token"
          estimations={estimations}
          countdown={countdown}
          price={price}
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

export default BuyRamps;
