import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SelectAccountSectionComponent } from 'src/common-ui/select-account-section/select-account-section.component';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { AccountAuthoritiesListComponent } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account-authorities/account-authorities-list/account-authorities-list.component';

const ManageAccountAuthorities = ({
  setTitleContainerProperties,
}: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_manage_accounts_authorities',
      isBackButtonEnabled: true,
    });
  }, []);

  return (
    <div
      className="settings-manage-account-authorities"
      data-testid={`${Screen.SETTINGS_MANAGE_ACCOUNTS_AUTHORITIES}-page`}>
      <div className="text">
        {chrome.i18n.getMessage('popup_html_manage_accounts_authorities_text')}
      </div>

      <SelectAccountSectionComponent fullSize background="white" />
      <AccountAuthoritiesListComponent />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, { setTitleContainerProperties });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ManageAccountAuthoritiesComponent = connector(
  ManageAccountAuthorities,
);
