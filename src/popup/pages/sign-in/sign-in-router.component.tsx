import { navigateTo } from '@popup/actions/navigation.actions';
import { ResetPasswordPageComponent } from '@popup/pages/sign-in/reset-password/reset-password.component';
import { SignInComponent } from '@popup/pages/sign-in/sign-in/sign-in.component';
import { RootState } from '@popup/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Screen } from 'src/reference-data/screen.enum';

const SignInRouter = ({ currentPage, navigateTo }: PropsFromRedux) => {
  useEffect(() => {
    navigateTo(Screen.SIGN_IN_PAGE);
  }, []);

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
  return {
    currentPage: state.navigation.stack[0]
      ? state.navigation.stack[0].currentPage
      : Screen.UNDEFINED,
  };
};

const connector = connect(mapStateToProps, { navigateTo });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SignInRouterComponent = connector(SignInRouter);
