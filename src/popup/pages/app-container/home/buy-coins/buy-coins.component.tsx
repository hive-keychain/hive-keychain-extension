import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { BuyCoinType } from '@popup/pages/app-container/home/buy-coins/buy-coin-type.enum';
import { BuyCoinsListItem } from '@popup/pages/app-container/home/buy-coins/buy-coins-list-item.list';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import SwitchComponent from 'src/common-ui/switch/switch.component';
import CurrencyUtils from 'src/utils/currency.utils';
import './buy-coins.component.scss';

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
      isCloseButtonDisabled: true,
    });
  }, []);

  const changeSelectedCurrency = (selectedValue: BuyCoinType) => {
    setSelectedCurrency(selectedValue);
  };

  const goTo = (url: string) => {
    chrome.tabs.create({ url: url });
  };

  return (
    <div className="buy-coins-page" aria-label="buy-coins-page">
      <SwitchComponent
        ariaLabel="buy-coins"
        onChange={changeSelectedCurrency}
        selectedValue={selectedCurrency}
        leftValue={BuyCoinType.BUY_HIVE}
        rightValue={BuyCoinType.BUY_HDB}
        leftValueLabel={currencyLabels.hive}
        rightValueLabel={currencyLabels.hbd}
        skipLeftTranslation
        skipRightTranslation
      />

      <div className="list">
        {BuyCoinsListItem(selectedCurrency, activeAccountName).list.map(
          (item, index) => (
            <React.Fragment key={`card=${index}`}>
              <div className="card" key={`card-item-${index}`}>
                <a
                  href={item.link}
                  key={item.image + `${index}`}
                  target="_blank">
                  <img src={`/assets/images/${item.image}`} />
                </a>
                <span className="description">
                  {chrome.i18n.getMessage(item.description)}
                </span>
                <ButtonComponent
                  onClick={() => goTo(item.link)}
                  label={'popup_html_buy'}
                  type={ButtonType.DEFAULT}
                />
              </div>
              {index <=
                BuyCoinsListItem(selectedCurrency, activeAccountName).list
                  .length -
                  1 && (
                <div className="separator" key={`separator-${index}`}></div>
              )}
            </React.Fragment>
          ),
        )}
        <div className="card">
          <div className="title">
            {chrome.i18n.getMessage('html_popup_exchanges')}
          </div>
          {BuyCoinsListItem(selectedCurrency, activeAccountName).exchanges.map(
            (item, index) => (
              <div className="exchange-item" key={`exchange-item-${index}`}>
                <img
                  src={`/assets/images/${item.image}`}
                  onClick={() => goTo(item.link)}
                />
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    activeAccountName: state.activeAccount.name!,
  };
};

const connector = connect(mapStateToProps, { setTitleContainerProperties });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const BuyCoinsComponent = connector(BuyCoins);
