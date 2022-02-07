import { navigateTo } from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import AccountUtils from 'src/utils/account.utils';
import './estimated-account-value-section.component.scss';

const EstimatedAccountValueSection = ({
  activeAccount,
  currencyPrices,
  globalProperties,
  navigateTo,
}: PropsFromRedux) => {
  const [accountValue, setAccountValue] = useState<string | number>('...');
  useEffect(() => {
    setAccountValue(
      AccountUtils.getAccountValue(
        activeAccount.account,
        currencyPrices,
        globalProperties.globals!,
      ),
    );
  }, [activeAccount, currencyPrices, globalProperties]);

  return (
    <>
      <div className="estimated-account-value-section">
        <div className="label-panel">
          <div
            className="label"
            data-for={`estimated-account-value-tooltip`}
            data-tip={chrome.i18n.getMessage('popup_html_estimation_info_text')}
            data-iscapture="true">
            {chrome.i18n.getMessage('popup_html_estimation')}
          </div>
        </div>
        <div className="value">
          {accountValue ? `$ ${accountValue} USD` : '...'}
        </div>
      </div>
      <ReactTooltip
        id="estimated-account-value-tooltip"
        place="top"
        type="light"
        effect="solid"
        multiline={true}
        delayShow={500}
        className="estimated-account-value-tooltip"
      />
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyPrices: state.currencyPrices,
    globalProperties: state.globalProperties,
  };
};

const connector = connect(mapStateToProps, { navigateTo });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EstimatedAccountValueSectionComponent = connector(
  EstimatedAccountValueSection,
);
