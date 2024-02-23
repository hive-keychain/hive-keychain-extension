import { RampFiatCurrency } from '@interfaces/ramps.interface';
import {
  RampMerger,
  RampProvider,
  TransakProvider,
} from '@popup/hive/pages/app-container/home/buy-coins/buy-ramps/ramps.utils';
import React, { useEffect, useState } from 'react';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
const BuyRamps = () => {
  const [currencies, setCurrencies] = useState<RampFiatCurrency[]>([]);
  const [fiat, setFiat] = useState<OptionItem<RampFiatCurrency>>();
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const ramps = new RampMerger([new TransakProvider(), new RampProvider()]);
    ramps.getFiatCurrencyOptions().then((currencyOptions) => {
      setCurrencies(currencyOptions);
      setFiat({
        value: currencyOptions[0],
        label: currencyOptions[0].name,
        subLabel: currencyOptions[0].symbol,
        img: currencyOptions[0].icon,
      });
    });
  }, []);

  return (
    <div className="ramps">
      {currencies.length && fiat ? (
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
                {/*  </div>
          <span className="available">
            {chrome.i18n.getMessage('popup_html_available')} :{' '}
            {startToken?.value.balance
              ? FormatUtils.withCommas(startToken?.value.balance)
              : ''}
          </span>
        </div>
        <SVGIcon
          icon={SVGIcons.SWAPS_SWITCH}
          onClick={swapStartAndEnd}
          className="swap-icon"
        />
        <div className="end-token">
          <div className="inputs">
            {endTokenListOptions.length > 0 && endToken && (
              <ComplexeCustomSelect
                selectedItem={endToken}
                options={endTokenListOptions}
                setSelectedItem={setEndToken}
                label="token"
                filterable
              />
            )}
            <CustomTooltip
              color="grey"
              message={getTokenUSDPrice(estimateValue, endToken?.value.symbol)}
              position={'top'}
              skipTranslation>
              <InputComponent
                type={InputType.TEXT}
                value={
                  estimateValue ? FormatUtils.withCommas(estimateValue!) : ''
                }
                disabled
                onChange={() => {}}
                placeholder="popup_html_transfer_amount"
                rightActionIconClassname={loadingEstimate ? 'rotate' : ''}
                rightActionIcon={SVGIcons.SWAPS_ESTIMATE_REFRESH}
                rightActionClicked={() => {
                  if (!estimate) return;
                  calculateEstimate(
                    amount,
                    startToken!,
                    endToken!,
                    swapConfig!,
                  );
                  setAutoRefreshCountdown(Config.swaps.autoRefreshPeriodSec);
                }}
              />
            </CustomTooltip>
          </div>
          <div className="countdown">
            {!!autoRefreshCountdown && (
              <>
                {
                  <span>
                    {chrome.i18n.getMessage(
                      'swap_autorefresh',
                      autoRefreshCountdown + '',
                    )}
                  </span>
                }
              </>
            )} */}
              </div>
            </div>
          </div>
        </FormContainer>
      ) : (
        <LoadingComponent />
      )}
    </div>
  );
};

export default BuyRamps;
