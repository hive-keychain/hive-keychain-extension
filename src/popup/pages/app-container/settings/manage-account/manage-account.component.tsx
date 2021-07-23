import { SelectAccountSectionComponent } from '@popup/pages/app-container/home/select-account-section/select-account-section.component';
import { AccountKeysListComponent } from '@popup/pages/app-container/settings/manage-account/account-keys-list/account-keys-list.component';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import './manage-account.component.scss';

const ManageAccount = ({}: PropsFromRedux) => {
  return (
    <div className="settings-manage-account">
      <PageTitleComponent
        title="popup_html_manage_accounts"
        isBackButtonEnabled={true}
      />
      <SelectAccountSectionComponent />
      <AccountKeysListComponent />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ManageAccountComponent = connector(ManageAccount);
