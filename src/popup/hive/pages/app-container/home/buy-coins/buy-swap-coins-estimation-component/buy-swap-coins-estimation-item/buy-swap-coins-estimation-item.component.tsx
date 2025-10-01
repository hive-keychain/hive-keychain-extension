import { CurrencyPrices } from '@interfaces/bittrex.interface';
import { RampEstimationDisplay } from '@interfaces/ramps.interface';
import { SwapCryptosEstimationDisplay } from '@interfaces/swap-cryptos.interface';
import { HIVE_OPTION_ITEM } from '@popup/hive/pages/app-container/home/buy-coins/buy-ramps/ramps.component';
import CurrencyPricesUtils from '@popup/hive/utils/currency-prices.utils';
import React from 'react';
import { OptionItem } from 'src/common-ui/custom-select/custom-select.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import FormatUtils from 'src/utils/format.utils';

interface Props {
  estimation: RampEstimationDisplay | SwapCryptosEstimationDisplay;
  price: CurrencyPrices;
  displayReceiveTokenLogo?: boolean;
  endTokenList: OptionItem[];
}

const BuySwapCoinsEstimationItem = ({
  estimation,
  price,
  displayReceiveTokenLogo,
  endTokenList,
}: Props) => {
  const isRamp = (estimation as RampEstimationDisplay).hasOwnProperty(
    'paymentMethod',
  );

  const gotoUrl = () => {
    window.open(estimation.link, '__blank');
  };

  return (
    <div className="quote" onClick={gotoUrl}>
      <SVGIcon icon={estimation.logo} />
      {isRamp && (
        <span className="method">
          <SVGIcon
            icon={(estimation as RampEstimationDisplay).paymentMethod.icon}
            skipTooltipTranslation
            tooltipPosition="bottom"
            tooltipDelayShow={1000}
            tooltipMessage={
              (estimation as RampEstimationDisplay).paymentMethod.title
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
                (estimation as SwapCryptosEstimationDisplay).to === 'HIVE'
                  ? HIVE_OPTION_ITEM.img!
                  : endTokenList.find(
                      (i) =>
                        i.subLabel ===
                        (estimation as SwapCryptosEstimationDisplay).to,
                    )?.img!
              }
              alt={`side-icon-${
                (estimation as SwapCryptosEstimationDisplay).to
              }`}
            />
            <span className="estimation-span">
              {FormatUtils.formatCurrencyValue(estimation.estimation, -1)}{' '}
              {(estimation as SwapCryptosEstimationDisplay).to.toUpperCase()}
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
};

export const BuySwapCoinsEstimationItemComponent = BuySwapCoinsEstimationItem;
