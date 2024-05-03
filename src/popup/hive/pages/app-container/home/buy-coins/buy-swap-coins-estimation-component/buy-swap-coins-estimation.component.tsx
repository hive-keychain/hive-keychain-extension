import { CurrencyPrices } from '@interfaces/bittrex.interface';
import { RampEstimationDisplay } from '@interfaces/ramps.interface';
import { SwapCryptosEstimationDisplay } from '@interfaces/swap-cryptos.interface';
import { HIVE_OPTION_ITEM } from '@popup/hive/pages/app-container/home/buy-coins/buy-ramps/ramps.component';
import CurrencyPricesUtils from '@popup/hive/utils/currency-prices.utils';
import React from 'react';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
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
                <div
                  className="quote"
                  key={key}
                  onClick={() => {
                    window.open(estimation.link, '__blank');
                  }}>
                  <SVGIcon icon={estimation.logo} />
                  {(estimation as RampEstimationDisplay).hasOwnProperty(
                    'paymentMethod',
                  ) && (
                    <span className="method">
                      <SVGIcon
                        icon={
                          (estimation as RampEstimationDisplay).paymentMethod
                            .icon
                        }
                        skipTooltipTranslation
                        tooltipPosition="bottom"
                        tooltipDelayShow={1000}
                        tooltipMessage={
                          (estimation as RampEstimationDisplay).paymentMethod
                            .title
                        }
                      />
                    </span>
                  )}
                  <div className="receive">
                    {displayReceiveTokenLogo ? (
                      <div className="receive-token">
                        <PreloadedImage
                          className="left-image"
                          src={
                            (estimation as SwapCryptosEstimationDisplay).to ===
                            'HIVE'
                              ? HIVE_OPTION_ITEM.img!
                              : endTokenList.find(
                                  (i) =>
                                    i.subLabel ===
                                    (estimation as SwapCryptosEstimationDisplay)
                                      .to,
                                )?.img!
                          }
                          alt={`side-icon-${
                            (estimation as SwapCryptosEstimationDisplay).to
                          }`}
                        />
                        <span className="estimation-span">
                          {FormatUtils.formatCurrencyValue(
                            estimation.estimation,
                          )}{' '}
                          {(
                            estimation as SwapCryptosEstimationDisplay
                          ).to.toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <div className="receive-token">
                        <span>{estimation.estimation}</span>
                        {price && (
                          <span className="amount">
                            {CurrencyPricesUtils.getTokenUSDPrice(
                              estimation.estimation + '',
                              'HIVE',
                              price,
                              [],
                            )}
                          </span>
                        )}
                      </div>
                    )}
                    <span className="chevron">
                      <SVGIcon icon={SVGIcons.SELECT_ARROW_RIGHT} />
                    </span>
                  </div>
                </div>
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
