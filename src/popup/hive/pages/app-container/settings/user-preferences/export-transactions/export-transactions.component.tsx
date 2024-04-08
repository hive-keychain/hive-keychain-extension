import { Screen } from '@reference-data/screen.enum';
import React, { useEffect } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SelectAccountSectionComponent } from 'src/common-ui/select-account-section/select-account-section.component';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { RootState } from 'src/popup/hive/store';

const ExportTransactions = ({
  activeAccount,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_export_transactions',
      isBackButtonEnabled: true,
    });
    init();
  }, []);

  const init = async () => {
    //TODo bellow if needed
  };

  return (
    <div
      data-testid={`${Screen.SETTINGS_EXPORT_TRANSACTIONS}-page`}
      className="export-transactions-page">
      <div className="introduction">
        {chrome.i18n.getMessage('popup_html_pref_info')}
      </div>

      <SelectAccountSectionComponent
        fullSize
        background="white"></SelectAccountSectionComponent>

      <div>//TODO</div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, { setTitleContainerProperties });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ExportTransactionsComponent = connector(ExportTransactions);
