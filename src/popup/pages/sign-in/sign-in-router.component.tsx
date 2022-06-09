import { navigateTo } from '@popup/actions/navigation.actions';
import { ResetPasswordPageComponent } from '@popup/pages/sign-in/reset-password/reset-password.component';
import { SignInComponent } from '@popup/pages/sign-in/sign-in/sign-in.component';
import { RootState } from '@popup/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { Screen } from 'src/reference-data/screen.enum';

const SignInRouter = ({
  currentPage,
  navigateTo,
  titleProperties,
  hasTitle,
}: PropsFromRedux) => {
  useEffect(() => {
    navigateTo(Screen.SIGN_IN_PAGE);
  }, []);

  const renderSignInPage = (page: Screen) => {
    console.log('Sign-in-router, renderSignInPage: ', page);
    switch (page) {
      case Screen.SIGN_IN_PAGE:
        console.log('to SIGN_IN_PAGE');
        return <SignInComponent />;
      case Screen.RESET_PASSWORD_PAGE:
        console.log('to RESET_PASSWORD_PAGE');
        return <ResetPasswordPageComponent />;
    }
  };

  return (
    <div
      className="sign-in-router-page"
      style={{
        height: '100%',
        display: 'grid',
        gridTemplateRows: hasTitle ? '70px 1fr' : '1fr',
      }}>
      {hasTitle && (
        <PageTitleComponent
          title={titleProperties.title}
          titleParams={titleProperties.titleParams}
          skipTitleTranslation={titleProperties.skipTitleTranslation}
          isBackButtonEnabled={titleProperties.isBackButtonEnabled}
          isCloseButtonDisabled={
            titleProperties.isCloseButtonDisabled
          }></PageTitleComponent>
      )}
      <div
        className="page-content"
        style={{
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
        {renderSignInPage(currentPage!)}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    currentPage: state.navigation.stack[0]
      ? state.navigation.stack[0].currentPage
      : Screen.UNDEFINED,
    hasTitle: state.titleContainer?.title.length > 0,
    titleProperties: state.titleContainer,
  };
};

const connector = connect(mapStateToProps, { navigateTo });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SignInRouterComponent = connector(SignInRouter);
