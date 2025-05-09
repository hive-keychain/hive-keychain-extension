import { Screen } from '@interfaces/screen.interface';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { HiveChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { SlidingBarComponent } from 'src/common-ui/switch-bar/sliding-bar.component';
import { BuyCoinType } from 'src/popup/hive/pages/app-container/home/buy-coins/buy-coin-type.enum';
import { BuyCoinsListItem } from 'src/popup/hive/pages/app-container/home/buy-coins/buy-coins-list-item.list';

const BuyCoins = ({
  setTitleContainerProperties,
  currencyLabels,
  activeAccountName,
}: PropsFromRedux) => {
  const [selectedCurrency, setSelectedCurrency] = useState(
    BuyCoinType.BUY_HIVE,
  );

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_buy',
      isBackButtonEnabled: true,
    });
  }, []);

  const changeSelectedCurrency = (selectedValue: BuyCoinType) => {
    setSelectedCurrency(selectedValue);
  };

  const goTo = (url: string) => {
    chrome.tabs.create({ url: url });
  };

  return (
    <div
      className="buy-coins-page"
      data-testid={`${Screen.BUY_COINS_PAGE}-page`}>
      <SlidingBarComponent
        dataTestId="buy-coins"
        id="buy-coins"
        onChange={changeSelectedCurrency}
        selectedValue={selectedCurrency}
        values={[
          {
            value: BuyCoinType.BUY_HIVE,
            label: currencyLabels.hive,
            skipLabelTranslation: true,
          },
          {
            value: BuyCoinType.BUY_HDB,
            label: currencyLabels.hbd,
            skipLabelTranslation: true,
          },
        ]}
      />

      <div className="list">
        {BuyCoinsListItem(selectedCurrency, activeAccountName).list.map(
          (item, index) => (
            <div className="card" key={`card-item-${index}`}>
              <SVGIcon
                icon={item.image as SVGIcons}
                onClick={() => goTo(item.link)}
              />
              <span className="title">{item.name}</span>
              <span className="description">
                {chrome.i18n.getMessage(item.description)}
              </span>
              <ButtonComponent
                additionalClass="buy-button"
                onClick={() => goTo(item.link)}
                label={'popup_html_buy'}
                type={ButtonType.IMPORTANT}
              />
            </div>
          ),
        )}
        <div className="card exchanges-card">
          <div className="title">
            {chrome.i18n.getMessage('html_popup_exchanges')}
          </div>
          <div className="exchange-list">
            {BuyCoinsListItem(
              selectedCurrency,
              activeAccountName,
            ).exchanges.map((item, index) => (
              <div
                className="exchange-item"
                key={`exchange-item-${index}`}
                onClick={() => goTo(item.link)}>
                <SVGIcon icon={`buy/${item.image}` as SVGIcons} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    currencyLabels: (state.chain as HiveChain).mainTokens,
    activeAccountName: state.hive.activeAccount.name!,
  };
};

const connector = connect(mapStateToProps, { setTitleContainerProperties });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const BuyCoinsComponent = connector(BuyCoins);
