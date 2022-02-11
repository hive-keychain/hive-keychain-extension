import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { SelectAccountSectionComponent } from '@popup/pages/app-container/home/select-account-section/select-account-section.component';
import { AccountKeysListComponent } from '@popup/pages/app-container/settings/accounts/manage-account/account-keys-list/account-keys-list.component';
import { RootState } from '@popup/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './manage-account.component.scss';

const ManageAccount = ({ setTitleContainerProperties }: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_manage_accounts',
      isBackButtonEnabled: true,
    });
  });

  return (
    <div className="settings-manage-account">
      <SelectAccountSectionComponent />
      <AccountKeysListComponent />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, { setTitleContainerProperties });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ManageAccountComponent = connector(ManageAccount);
