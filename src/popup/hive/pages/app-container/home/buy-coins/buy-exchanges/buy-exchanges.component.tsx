import { getExchangeListItems } from '@popup/hive/pages/app-container/home/buy-coins/buy-exchanges/buy-exchanges-list-item.list';
import { Screen } from '@reference-data/screen.enum';
import React from 'react';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

const BuyExchanges = () => {
  const goTo = (url: string) => {
    chrome.tabs.create({ url: url });
  };

  return (
    <div
      className="buy-exchange-page"
      data-testid={`${Screen.BUY_COINS_PAGE}-page`}>
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
    </div>
  );
};

export default BuyExchanges;
