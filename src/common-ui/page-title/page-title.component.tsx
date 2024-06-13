import {
  goBack,
  navigateTo,
  resetNav,
} from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { Screen } from 'src/reference-data/screen.enum';

export interface PageTitleProps {
  title: string;
  titleParams?: string[];
  skipTitleTranslation?: boolean;
  isBackButtonEnabled?: boolean;
  isCloseButtonDisabled?: boolean;
  showDetachWindowOption?: boolean;
  rightAction?: {
    icon: SVGIcons;
    callback: () => void;
    className?: string;
  };
  onCloseAdditional?: () => void;
  onBackAdditional?: () => void;
}

const PageTitle = ({
  title,
  titleParams,
  skipTitleTranslation,
  isBackButtonEnabled,
  isCloseButtonDisabled,
  rightAction,
  onBackAdditional,
  onCloseAdditional,
  goBack,
  navigateTo,
  canGoBack,
  resetNav,
  showDetachWindowOption,
}: PropsType) => {
  const handleBackButtonClick = (): void => {
    if (onBackAdditional) onBackAdditional();
    if (isBackButtonEnabled) {
      goBack();
    }
  };
  const handleCloseButtonClick = (): void => {
    if (onCloseAdditional) {
      onCloseAdditional();
    }

    resetNav();
    navigateTo(Screen.HOME_PAGE, true);
  };

  const handleRightActionButtonClick = () => {
    if (rightAction) {
      rightAction.callback();
    }
  };

  const handleDetachWindow = () => {
    chrome.tabs.create({
      url: `detached_window.html`,
    });
  };

  return (
    <div className="title-section">
      {isBackButtonEnabled && canGoBack && (
        <SVGIcon
          dataTestId="arrow-back-icon"
          onClick={handleBackButtonClick}
          icon={SVGIcons.TOP_BAR_BACK_BTN}
          className="icon-button"
        />
      )}
      <div className="title">
        {skipTitleTranslation
          ? title
          : chrome.i18n.getMessage(title, titleParams)}
      </div>
      {showDetachWindowOption && (
        <SVGIcon
          onClick={handleDetachWindow}
          icon={SVGIcons.MENU_USER_PREFERENCES_DETACH_EXTENSION}
          className={`icon-button menu-toggle-theme`}
          hoverable
          tooltipMessage="popup_html_detach_window_tooltip_text"
          tooltipPosition="bottom"
        />
      )}
      {rightAction && (
        <SVGIcon
          onClick={handleRightActionButtonClick}
          icon={rightAction.icon}
          className={`icon-button ${rightAction.className}`}
        />
      )}
      {!rightAction && !isCloseButtonDisabled && (
        <SVGIcon
          dataTestId="icon-close-page"
          onClick={handleCloseButtonClick}
          icon={SVGIcons.TOP_BAR_CLOSE_BTN}
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
