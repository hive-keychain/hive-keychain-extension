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
import CurrencyPricesUtils from '@popup/hive/utils/currency-prices.utils';
import { ThrottleSettings, throttle } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import Config from 'src/config';
import { useCountdown } from 'src/dialog/hooks/countdown.hook';

const BuyRamps = ({
  username,
  price,
}: {
  username: string;
  price: CurrencyPrices;
}) => {
  const [ramps, setRamps] = useState<RampMerger>();
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

      setEstimations(estimations);
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
        <FormContainer>
          <div className="form-fields">
            <div className="fiat-token">
              <div className="inputs">
                <ComplexeCustomSelect
                  //@ts-ignore
                  selectedItem={fiat}
                  options={currencies.map((e) => ({
                    label: e.name,
                    value: e,
                    img: e.icon,
                    subLabel: e.symbol,
                  }))}
                  setSelectedItem={setFiat}
                  label="fiat"
                  filterable
                />
                <InputComponent
                  type={InputType.NUMBER}
                  value={amount}
                  onChange={setAmount}
                  label="popup_html_transfer_amount"
                  placeholder="popup_html_transfer_amount"
                  min={0}
                />
              </div>
            </div>
            <SVGIcon icon={SVGIcons.SWAPS_SWITCH} className="swap-icon" />
            <div className="end-token">
              <div className="inputs">
                <ComplexeCustomSelect
                  selectedItem={{
                    label: 'HIVE',
                    value: 'HIVE',
                    img: `/assets/images/wallet/hive-logo.svg`,
                  }}
                  options={[
                    {
                      label: 'HIVE',
                      value: 'HIVE',
                      img: `/assets/images/wallet/hive-logo.svg`,
                    },
                  ]}
                  setSelectedItem={() => {}}
                  label="token"
                />
              </div>
            </div>
            <div className="estimations">
              <div className="quote-label-wrapper">
                {estimations.length !== 0 && (
                  <span className="quote-label">
                    {chrome.i18n.getMessage('quotes')}
                  </span>
                )}
                {!!countdown && (
                  <span className="countdown">
                    {chrome.i18n.getMessage('swap_autorefresh', countdown + '')}
                  </span>
                )}
              </div>
              <div className="quotes">
                {estimations.map((estimation) => (
                  <div
                    className="quote"
                    onClick={() => {
                      window.open(estimation.link, '__blank');
                    }}>
                    <SVGIcon icon={estimation.logo} />
                    <span className="method">
                      <SVGIcon
                        icon={estimation.paymentMethod.icon}
                        skipTooltipTranslation
                        tooltipPosition="bottom"
                        tooltipDelayShow={1000}
                        tooltipMessage={estimation.paymentMethod.title}
                      />
                    </span>
                    <div className="receive">
                      <span>{estimation.estimation}</span>
                      <span className="amount">
                        {CurrencyPricesUtils.getTokenUSDPrice(
                          estimation.estimation + '',
                          'HIVE',
                          price,
                          [],
                        )}
                      </span>
                    </div>
                    <span className="chevron">
                      <SVGIcon icon={SVGIcons.SELECT_ARROW_RIGHT} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FormContainer>
      ) : (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
      )}
    </div>
  );
};

export default BuyRamps;
