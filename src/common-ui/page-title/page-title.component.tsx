import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { NewIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import {
  goBack,
  navigateTo,
  resetNav,
} from 'src/popup/hive/actions/navigation.actions';
import { RootState } from 'src/popup/hive/store';
import { Screen } from 'src/reference-data/screen.enum';

export interface PageTitleProps {
  title: string;
  titleParams?: string[];
  skipTitleTranslation?: boolean;
  isBackButtonEnabled?: boolean;
  isCloseButtonDisabled?: boolean;
  rightAction?: {
    icon: NewIcons;
    callback: () => void;
  };
}

const PageTitle = ({
  title,
  titleParams,
  skipTitleTranslation,
  isBackButtonEnabled,
  isCloseButtonDisabled,
  rightAction,
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

  const handleRightActionButtonClick = () => {
    if (rightAction) {
      rightAction.callback();
    }
  };

  return (
    <div className="title-section">
      {isBackButtonEnabled && canGoBack && (
        <SVGIcon
          dataTestId="arrow-back-icon"
          onClick={handleBackButtonClick}
          icon={NewIcons.TOP_BAR_BACK_BTN}
          className="icon-button"
        />
      )}
      <div className="title">
        {skipTitleTranslation
          ? title
          : chrome.i18n.getMessage(title, titleParams)}
      </div>
      {rightAction && (
        <SVGIcon
          onClick={handleRightActionButtonClick}
          icon={rightAction.icon}
        />
      )}
      {!rightAction && !isCloseButtonDisabled && (
        <SVGIcon
          dataTestId="icon-close-page"
          onClick={handleCloseButtonClick}
          icon={NewIcons.TOP_BAR_CLOSE_BTN}
          className="icon-button"
        />
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
