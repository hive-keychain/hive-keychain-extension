import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { BuyCoinType } from '@popup/pages/app-container/home/buy-coins/buy-coin-type.enum';
import { BuyCoinsListItem } from '@popup/pages/app-container/home/buy-coins/buy-coins-list-item.list';
import { RootState } from '@popup/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './buy-coins.component.scss';

const BuyCoins = ({
  buyCoinType,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: buyCoinType,
      isBackButtonEnabled: true,
    });
  });
  return (
    <div className="buy-coins-page">
      <div className="disclaimer">
        {chrome.i18n.getMessage(
          'popup_html_buy_intro',
          buyCoinType === BuyCoinType.BUY_HDB ? 'HBD' : 'HIVE',
        )}
      </div>
      {BuyCoinsListItem(buyCoinType).map((category) => (
        <div className="category" key={category.categoryLabel}>
          <h2 className="category-title">
            {chrome.i18n.getMessage(category.categoryLabel)}
          </h2>
          <div className="items">
            {category.items.map((item) => (
              <a href={item.link} key={item.image} target="_blank">
                <img src={`/assets/images/${item.image}`} />
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    buyCoinType: state.navigation.stack[0].params.buyCoinType as BuyCoinType,
  };
};

const connector = connect(mapStateToProps, { setTitleContainerProperties });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const BuyCoinsComponent = connector(BuyCoins);
