import { Screen } from '@reference-data/screen.enum';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { SelectAccountSectionComponent } from 'src/popup/hive/pages/app-container/home/select-account-section/select-account-section.component';
import { AccountAuthoritiesListComponent } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account-authorities/account-authorities-list/account-authorities-list.component';
import { RootState } from 'src/popup/hive/store';
import './manage-account-authorities.component.scss';

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

      <SelectAccountSectionComponent />
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
