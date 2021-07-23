import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import './change-password.component.scss';

const ChangePassword = ({}: PropsFromRedux) => {
  return (
    <div className="change-password-page">
      <PageTitleComponent
        title="popup_html_change_password"
        isBackButtonEnabled={true}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ChangePasswordComponent = connector(ChangePassword);
