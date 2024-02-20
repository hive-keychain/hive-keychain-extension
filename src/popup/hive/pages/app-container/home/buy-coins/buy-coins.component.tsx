import {
  RampType,
  TransakProvider,
} from '@popup/hive/pages/app-container/home/buy-coins/ramps';
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
    const a = new TransakProvider();
    a.getFiatCurrencyOptions().then((e) => {
      a.getEstimation(RampType.BUY, 200, {
        symbol: 'TWD',
        icon: '',
        name: 'Euro',
        paymentMethods: [],
      }).then((f) => {
        console.log(f);
        console.log(a.getLink(f[0], 'stoodkev'));
      });
    });

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
