import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { SelectAccountSectionComponent } from '@popup/pages/app-container/home/select-account-section/select-account-section.component';
import { AccountKeysListComponent } from '@popup/pages/app-container/settings/accounts/manage-account/account-keys-list/account-keys-list.component';
import { WrongKeysOnUser } from '@popup/pages/app-container/wrong-key-popup/wrong-key-popup.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import './manage-account.component.scss';

const ManageAccount = ({
  setTitleContainerProperties,
  params,
}: PropsFromRedux) => {
  const [no_key_check, setNo_key_check] = useState<
    WrongKeysOnUser | undefined
  >();

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_manage_accounts',
      isBackButtonEnabled: true,
    });
  }, []);

  return (
    <div
      aria-label="settings-manage-account"
      className="settings-manage-account">
      <SelectAccountSectionComponent />
      <AccountKeysListComponent wrongKeysFound={params} />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    params: state.navigation.stack[0]
      ? state.navigation.stack[0].params
      : undefined,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ManageAccountComponent = connector(ManageAccount);
