import { navigateTo } from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Screen } from 'src/reference-data/screen.enum';
import AccountUtils from 'src/utils/account.utils';
import './estimated-account-value-section.component.scss';

const EstimatedAccountValueSection = ({
  activeAccount,
  bittrex,
  globalProperties,
  navigateTo,
}: PropsFromRedux) => {
  const [accountValue, setAccountValue] = useState<string | number>('...');
  useEffect(() => {
    setAccountValue(
      AccountUtils.getAccountValue(
        activeAccount.account,
        bittrex,
        globalProperties.globals!,
      ),
    );
  }, [activeAccount, bittrex, globalProperties]);

  return (
    <div className="estimated-account-value-section">
      <div className="label-panel">
        <div className="label">
          {chrome.i18n.getMessage('popup_html_estimation')}
        </div>
        <img
          className="icon"
          src="/assets/images/info.png"
          onClick={() => navigateTo(Screen.ACCOUNT_VALUE_EXPLANATION)}
        />
      </div>
      <div className="value">
        {accountValue ? `$ ${accountValue} USD` : '...'}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    bittrex: state.bittrex,
    globalProperties: state.globalProperties,
  };
};

const connector = connect(mapStateToProps, { navigateTo });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EstimatedAccountValueSectionComponent = connector(
  EstimatedAccountValueSection,
);
