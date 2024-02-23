import { RampType } from '@interfaces/ramps.interface';
import {
  RampMerger,
  RampProvider,
  TransakProvider,
} from '@popup/hive/pages/app-container/home/buy-coins/ramps.utils';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { SlidingBarComponent } from 'src/common-ui/switch-bar/sliding-bar.component';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { BuyCoinType } from 'src/popup/hive/pages/app-container/home/buy-coins/buy-coin-type.enum';
import { getExchangeListItems } from 'src/popup/hive/pages/app-container/home/buy-coins/buy-coins-list-item.list';
import { RootState } from 'src/popup/hive/store';

const BuyCoins = ({
  setTitleContainerProperties,
  activeAccountName,
}: PropsFromRedux) => {
  const [buyType, setBuyType] = useState(BuyCoinType.BUY);

  useEffect(() => {
    (async () => {
      const ramps = new RampMerger([new TransakProvider(), new RampProvider()]);
      const currencies = await ramps.getFiatCurrencyOptions();
      const estimations = await ramps.getEstimations(
        RampType.BUY,
        200, // amount
        'USD', // Chose from the list of currencies
        'BTC', // crypto
        'BTC', // network
        'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // wallet
      );
      console.log(estimations);
    })();

    setTitleContainerProperties({
      title: 'popup_html_buy',
      isBackButtonEnabled: true,
    });
  }, []);

  const changeSelectedCurrency = (selectedValue: BuyCoinType) => {
    setBuyType(selectedValue);
  };

  const goTo = (url: string) => {
    chrome.tabs.create({ url: url });
  };

  const renderBuy = () => {
    return null;
  };

  const renderExchanges = () => {
    return (
      <div className="list">
        <div className="card exchanges-card">
          <div className="title">
            {chrome.i18n.getMessage('html_popup_exchanges')}
          </div>
          <div className="exchange-list">
            {getExchangeListItems().map((item, index) => (
              <div
                className="exchange-item"
                key={`exchange-item-${index}`}
                onClick={() => goTo(item.link)}>
                <SVGIcon icon={item.image} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="buy-coins-page"
      data-testid={`${Screen.BUY_COINS_PAGE}-page`}>
      <SlidingBarComponent
        dataTestId="buy-coins"
        id="buy-coins"
        onChange={changeSelectedCurrency}
        selectedValue={buyType}
        values={[
          {
            value: BuyCoinType.BUY,
            label: BuyCoinType.BUY,
          },
          {
            value: BuyCoinType.EXCHANGES,
            label: BuyCoinType.EXCHANGES,
          },
        ]}
      />
      {buyType === BuyCoinType.BUY ? renderBuy() : renderExchanges()}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccountName: state.activeAccount.name!,
  };
};

const connector = connect(mapStateToProps, { setTitleContainerProperties });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const BuyCoinsComponent = connector(BuyCoins);
