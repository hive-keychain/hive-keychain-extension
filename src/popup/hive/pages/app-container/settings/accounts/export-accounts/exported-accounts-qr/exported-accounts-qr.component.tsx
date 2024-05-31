import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect } from 'react';
import { ConnectedProps, connect } from 'react-redux';

const ExportedAccountsQR = ({
  setTitleContainerProperties,
  activeAccount,
  localAccounts,
}: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_exported_accounts_QR',
      isBackButtonEnabled: true,
    });
  }, []);

  return (
    <div
      data-testid={`${Screen.SETTINGS_EXPORTED_ACCOUNTS_QR}-page`}
      className="settings-manage-account">
      <div>//TODO</div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
    localAccounts: state.hive.accounts,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ExportedAccountsQRComponent = connector(ExportedAccountsQR);
