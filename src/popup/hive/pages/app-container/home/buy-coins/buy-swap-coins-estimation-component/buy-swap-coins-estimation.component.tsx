import { CurrencyPrices } from '@interfaces/bittrex.interface';
import { RampEstimationDisplay } from '@interfaces/ramps.interface';
import {
  SwapCryptos,
  SwapCryptosEstimationDisplay,
} from '@interfaces/swap-cryptos.interface';
import { BuySwapCoinsEstimationItemComponent } from '@popup/hive/pages/app-container/home/buy-coins/buy-swap-coins-estimation-component/buy-swap-coins-estimation-item/buy-swap-coins-estimation-item.component';
import React from 'react';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
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
  estimations: RampEstimationDisplay[] | SwapCryptosEstimationDisplay[];
  countdown: number | null;
  setStep?: (provider: SwapCryptos) => void;
  price?: CurrencyPrices;
  minAcceptedAmount?: number;
  minAmountLabel?: string;
  swapTokens?: () => void;
  displayReceiveTokenLogo?: boolean;
  errorMessage?: string;
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
  setStep,
  swapTokens,
  displayReceiveTokenLogo,
  errorMessage,
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
                ? FormatUtils.formatCurrencyValue(minAcceptedAmount)
                : ''}
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
          <div className="quotes">
            {estimations.map((estimation, index) => {
              const key =
                estimation.name + estimation.amount + index.toString();
              return (
                <BuySwapCoinsEstimationItemComponent
                  key={key}
                  price={price!}
                  endTokenList={endTokenList}
                  displayReceiveTokenLogo={displayReceiveTokenLogo}
                  estimation={estimation}
                  setStep={setStep}
                />
              );
            })}
          </div>
        </div>
        {errorMessage && (
          <div className="error">
            {chrome.i18n.getMessage('buy_coins_swap_cryptos_error_api')}
          </div>
        )}
      </div>
    </FormContainer>
  );
};

export const BuySwapCoinsEstimationComponent = BuySwapCoinsEstimation;
