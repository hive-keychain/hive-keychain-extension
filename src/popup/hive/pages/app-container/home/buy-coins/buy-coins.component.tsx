import BuyExchanges from '@popup/hive/pages/app-container/home/buy-coins/buy-exchanges/buy-exchanges.component';
import BuyRamps from '@popup/hive/pages/app-container/home/buy-coins/buy-ramps/ramps.component';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SlidingBarComponent } from 'src/common-ui/switch-bar/sliding-bar.component';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { BuyCoinType } from 'src/popup/hive/pages/app-container/home/buy-coins/buy-coin-type.enum';
import { RootState } from 'src/popup/hive/store';

const BuyCoins = ({
  setTitleContainerProperties,
  activeAccountName,
  price,
}: PropsFromRedux) => {
  const [buyType, setBuyType] = useState(BuyCoinType.FIAT);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_buy_title',
      isBackButtonEnabled: true,
    });
  }, []);

  const changeSelectedCurrency = (selectedValue: BuyCoinType) => {
    setBuyType(selectedValue);
  };

  const renderPage = () => {
    switch (buyType) {
      case BuyCoinType.EXCHANGES:
        return <BuyExchanges />;
      case BuyCoinType.FIAT:
        return <BuyRamps username={activeAccountName} price={price} />;
      default:
        return null;
    }
  };

  return (
    <div className="buy-coins-page">
      <SlidingBarComponent
        dataTestId="buy-coins"
        id="buy-coins"
        onChange={changeSelectedCurrency}
        selectedValue={buyType}
        values={[
          {
            value: BuyCoinType.FIAT,
            label: BuyCoinType.FIAT,
          },
          {
            value: BuyCoinType.CRYPTO,
            label: BuyCoinType.CRYPTO,
          },
          {
            value: BuyCoinType.EXCHANGES,
            label: BuyCoinType.EXCHANGES,
          },
        ]}
      />
      {renderPage()}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccountName: state.activeAccount.name!,
    price: state.currencyPrices,
  };
};

const connector = connect(mapStateToProps, { setTitleContainerProperties });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const BuyCoinsComponent = connector(BuyCoins);
