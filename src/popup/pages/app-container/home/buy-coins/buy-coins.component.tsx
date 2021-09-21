import { BuyCoinType } from '@popup/pages/app-container/home/buy-coins/buy-coin-type.enum';
import { BuyCoinsListItem } from '@popup/pages/app-container/home/buy-coins/buy-coins-list-item.list';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';

const BuyCoins = ({ buyCoinType }: PropsFromRedux) => {
  return (
    <div className="buy-coins-page">
      <PageTitleComponent title={buyCoinType} isBackButtonEnabled={true} />

      {BuyCoinsListItem(buyCoinType).map((category) => (
        <div className="category" key={category.categoryLabel}>
          <h2 className="category-title">
            {chrome.i18n.getMessage(category.categoryLabel)}
          </h2>
          <div className="items">
            {category.items.map((item) => (
              <a href={item.link} key={item.image}>
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
  return { buyCoinType: state.navigation.params.buyCoinType as BuyCoinType };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const BuyCoinsComponent = connector(BuyCoins);
