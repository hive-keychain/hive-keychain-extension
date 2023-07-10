import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import Icon from 'src/common-ui/icon/icon.component';
import { Icons } from 'src/common-ui/icons.enum';
import {
  goBack,
  navigateTo,
  resetNav,
} from 'src/popup/hive/actions/navigation.actions';
import { RootState } from 'src/popup/hive/store';
import { Screen } from 'src/reference-data/screen.enum';
import './page-title.component.scss';

export interface PageTitleProps {
  title: string;
  titleParams?: string[];
  skipTitleTranslation?: boolean;
  isBackButtonEnabled?: boolean;
  isCloseButtonDisabled?: boolean;
}

const PageTitle = ({
  title,
  titleParams,
  skipTitleTranslation,
  isBackButtonEnabled,
  isCloseButtonDisabled,
  goBack,
  navigateTo,
  canGoBack,
  resetNav,
}: PropsType) => {
  const handleBackButtonClick = (): void => {
    if (isBackButtonEnabled) {
      goBack();
    }
  };
  const handleCloseButtonClick = (): void => {
    resetNav();
    navigateTo(Screen.HOME_PAGE, true);
  };

  return (
    <div className="title-section">
      {isBackButtonEnabled && canGoBack && (
        <Icon
          dataTestId="arrow-back-icon"
          onClick={handleBackButtonClick}
          name={Icons.BACK}
          additionalClassName="icon-button"></Icon>
      )}
      <div className="title">
        {skipTitleTranslation
          ? title
          : chrome.i18n.getMessage(title, titleParams)}
      </div>
      {!isCloseButtonDisabled && (
        <Icon
          dataTestId="icon-close-page"
          onClick={handleCloseButtonClick}
          name={Icons.CLOSE}
          additionalClassName="icon-button"></Icon>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    canGoBack: state.navigation.stack.length > 1,
  };
};

const connector = connect(mapStateToProps, { goBack, navigateTo, resetNav });
type PropsType = ConnectedProps<typeof connector> & PageTitleProps;

export const PageTitleComponent = connector(PageTitle);
