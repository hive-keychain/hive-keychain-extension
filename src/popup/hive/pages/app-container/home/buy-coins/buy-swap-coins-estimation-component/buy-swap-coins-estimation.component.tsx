import { CurrencyPrices } from '@interfaces/bittrex.interface';
import { RampEstimationDisplay } from '@interfaces/ramps.interface';
import { BuySwapCoinsEstimationItemComponent } from '@popup/hive/pages/app-container/home/buy-coins/buy-swap-coins-estimation-component/buy-swap-coins-estimation-item/buy-swap-coins-estimation-item.component';
import { ExchangeEstimation } from 'hive-keychain-commons';
import React from 'react';
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
import FormatUtils from 'src/utils/format.utils';

interface Props {
  startTokenList: OptionItem[];
  endTokenList: OptionItem[];
  setStartToken: (token: OptionItem) => void;
  setEndToken: (token: OptionItem) => void;
  startToken: OptionItem;
  endToken: OptionItem;
  amount: string;
  setAmount: (amount: string) => void;
  startTokenLabel: string;
  endTokenLabel: string;
  inputAmountLabel: string;
  inputPlaceHolder: string;
  estimations: RampEstimationDisplay[] | ExchangeEstimation[];
  countdown: number | null;
  price?: CurrencyPrices;
  minAcceptedAmount?: number;
  minAmountLabel?: string;
  maxAcceptedAmount?: number;
  maxAmountLabel?: string;
  swapTokens?: () => void;
  displayReceiveTokenLogo?: boolean;
  errorMessage?: string;
  loadingEstimate?: boolean;
}

const BuySwapCoinsEstimation = ({
  startTokenList,
  endTokenList,
  setStartToken,
  setEndToken,
  amount,
  setAmount,
  startTokenLabel,
  inputAmountLabel,
  inputPlaceHolder,
  startToken,
  endToken,
  endTokenLabel,
  estimations,
  countdown,
  price,
  minAcceptedAmount,
  minAmountLabel,
  swapTokens,
  displayReceiveTokenLogo,
  errorMessage,
  maxAcceptedAmount,
  maxAmountLabel,
  loadingEstimate,
}: Props) => {
  return (
    <FormContainer>
      <div className="form-fields">
        <div className="start-token">
          <div className="inputs">
            <ComplexeCustomSelect
              //@ts-ignore
              selectedItem={startToken}
              options={startTokenList}
              setSelectedItem={setStartToken}
              label={startTokenLabel}
              filterable={startTokenList.length > 1}
            />
            <InputComponent
              type={InputType.NUMBER}
              value={amount}
              onChange={setAmount}
              label={inputAmountLabel}
              placeholder={inputPlaceHolder}
              min={0}
            />
          </div>
        </div>
        <div className="min-amount">
          {minAcceptedAmount && minAmountLabel ? (
            <div>
              {chrome.i18n.getMessage(minAmountLabel)}{' '}
              {minAcceptedAmount > 0
                ? FormatUtils.formatCurrencyValue(minAcceptedAmount, 4, true)
                : ''}
            </div>
          ) : null}
        </div>
        <div className="min-amount">
          {maxAcceptedAmount &&
          maxAmountLabel &&
          maxAcceptedAmount !== Infinity ? (
            <div>
              {chrome.i18n.getMessage(maxAmountLabel)}{' '}
              {FormatUtils.formatCurrencyValue(maxAcceptedAmount, 4, true)}
            </div>
          ) : null}
        </div>
        <SVGIcon
          icon={SVGIcons.SWAPS_SWITCH}
          className="swap-icon"
          onClick={swapTokens}
        />
        <div className="end-token">
          <div className="inputs">
            <ComplexeCustomSelect
              selectedItem={endToken}
              options={endTokenList}
              setSelectedItem={setEndToken}
              label={endTokenLabel}
              filterable={endTokenList.length > 1}
            />
          </div>
        </div>
        {!errorMessage && (
          <div className="estimations">
            <div className="quote-label-wrapper">
              {estimations.length !== 0 && (
                <span className="quote-label">
                  {chrome.i18n.getMessage('quotes')}
                </span>
              )}
              {!!countdown && estimations.length != 0 && (
                <span className="countdown">
                  {chrome.i18n.getMessage('swap_autorefresh', countdown + '')}
                </span>
              )}
            </div>
            {!loadingEstimate && (
              <div className="quotes">
                {estimations.map((estimation, index) => {
                  const key =
                    (estimation as ExchangeEstimation).estimation.name +
                    (estimation as ExchangeEstimation).estimation.amount +
                    index.toString();
                  return (
                    <BuySwapCoinsEstimationItemComponent
                      key={key}
                      price={price!}
                      endTokenList={endTokenList}
                      displayReceiveTokenLogo={displayReceiveTokenLogo}
                      estimation={estimation}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
        {loadingEstimate && (
          <div className="loading-panel">
            <RotatingLogoComponent />
          </div>
        )}
        {errorMessage && (
          <div className="error">{chrome.i18n.getMessage(errorMessage)}</div>
        )}
      </div>
    </FormContainer>
  );
};

export const BuySwapCoinsEstimationComponent = BuySwapCoinsEstimation;
