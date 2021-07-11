import { ResetPasswordPageComponent } from '@popup/pages/sign-in/reset-password/reset-password.component';
import { SignInComponent } from '@popup/pages/sign-in/sign-in/sign-in.component';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Screen } from 'src/reference-data/screen.enum';

const SignInRouter = ({ currentPage }: PropsFromRedux) => {
  const renderSignInPage = (page: Screen) => {
    switch (page) {
      case Screen.SIGN_IN_PAGE:
        return <SignInComponent />;
      case Screen.RESET_PASSWORD_PAGE:
        return <ResetPasswordPageComponent />;
    }
  };

  return (
    <div className="sign-in-router-page">{renderSignInPage(currentPage!)}</div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { currentPage: state.navigation.currentPage };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SignInRouterComponent = connector(SignInRouter);
