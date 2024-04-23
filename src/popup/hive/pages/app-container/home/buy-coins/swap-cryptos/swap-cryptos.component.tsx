import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect } from 'react';
import { ConnectedProps, connect } from 'react-redux';

const SwapCryptos = ({ setTitleContainerProperties }: PropsFromRedux) => {
  // const [buyType, setBuyType] = useState(BuyCoinType.FIAT);
  //TODO cleanup
  useEffect(() => {
    //TODO add tr keys
    setTitleContainerProperties({
      title: 'popup_html_buy_title',
      isBackButtonEnabled: true,
    });
  }, []);

  // const changeSelectedCurrency = (selectedValue: BuyCoinType) => {
  //   setBuyType(selectedValue);
  // };

  // const renderPage = () => {
  //   switch (buyType) {
  //     case BuyCoinType.EXCHANGES:
  //       return <BuyExchanges />;
  //     case BuyCoinType.FIAT:
  //       return <BuyRamps username={activeAccountName} price={price} />;
  //     default:
  //       return null;
  //   }
  // };

  return (
    <div className="swap-cryptos-page">
      <div>//TODO</div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, { setTitleContainerProperties });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SwapCryptosComponent = connector(SwapCryptos);
