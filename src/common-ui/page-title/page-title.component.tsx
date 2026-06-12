import { Screen } from '@interfaces/screen.interface';
import {
  goBack,
  navigateToWithParams,
  resetNav,
} from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

import { I18nUtils } from 'src/utils/i18n.utils';
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
    dataTestId?: string;
    tooltipMessage?: string;
  };
  closeNavigationParams?: any;
  onCloseAdditional?: () => void;
  onBackAdditional?: () => void | boolean | Promise<void | boolean>;
}

const PageTitle = ({
  title,
  titleParams,
  skipTitleTranslation,
  isBackButtonEnabled,
  isCloseButtonDisabled,
  rightAction,
  closeNavigationParams,
  onBackAdditional,
  onCloseAdditional,
  goBack,
  navigateToWithParams,
  canGoBack,
  resetNav,
  showDetachWindowOption,
}: PropsType) => {
  const handleBackButtonClick = async (): Promise<void> => {
    let skipGoBack = false;
    if (onBackAdditional) {
      const result = await onBackAdditional();
      skipGoBack = result === true;
    }
    if (!skipGoBack && canGoBack && isBackButtonEnabled) {
      goBack();
    }
  };
  const handleCloseButtonClick = (): void => {
    if (onCloseAdditional) {
      onCloseAdditional();
    }

    resetNav();
    navigateToWithParams(Screen.HOME_PAGE, closeNavigationParams, true);
  };

  const handleRightActionButtonClick = () => {
    if (rightAction) {
      rightAction.callback();
    }
  };

  const handleDetachWindow = () => {
    void DetachedExtensionTabUtils.openDetachedExtension();
  };

  return (
    <div
      className={`title-section ${
        showDetachWindowOption ? 'with-detach-option' : ''
      }`}>
      {isBackButtonEnabled && (canGoBack || onBackAdditional) ? (
        <SVGIcon
          dataTestId="arrow-back-icon"
          onClick={handleBackButtonClick}
          icon={SVGIcons.TOP_BAR_BACK_BTN}
          className="icon-button"
        />
      ) : (
        <div></div>
      )}
      <div className="fill-space"></div>
      <div className="title">
        {skipTitleTranslation
          ? title
          : I18nUtils.getMessage(title, titleParams)}
      </div>
      {/* <div className="right-section"> */}
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
          dataTestId={rightAction.dataTestId}
          onClick={handleRightActionButtonClick}
          icon={rightAction.icon}
          className={`icon-button ${rightAction.className ?? ''}`}
          hoverable={!!rightAction.tooltipMessage}
          tooltipMessage={rightAction.tooltipMessage}
          tooltipPosition="bottom"
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

const connector = connect(mapStateToProps, {
  goBack,
  navigateToWithParams,
  resetNav,
});
type PropsType = ConnectedProps<typeof connector> & PageTitleProps;

export const PageTitleComponent = connector(PageTitle);
