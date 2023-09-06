import {
  goBack,
  navigateTo,
  resetNav,
} from '@popup/actions/navigation.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { Screen } from 'src/reference-data/screen.enum';
import './page-title.component.scss';

export interface PageTitleProps {
  title: string;
  titleParams?: string[];
  skipTitleTranslation?: boolean;
  isBackButtonEnabled?: boolean;
  isCloseButtonDisabled?: boolean;
  onCloseAdditional?: () => void;
  onBackAdditional?: () => void;
}

const PageTitle = ({
  title,
  titleParams,
  skipTitleTranslation,
  isBackButtonEnabled,
  isCloseButtonDisabled,
  onBackAdditional,
  onCloseAdditional,
  goBack,
  navigateTo,
  canGoBack,
  resetNav,
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

  return (
    <div className="title-section">
      {isBackButtonEnabled && canGoBack && (
        <Icon
          dataTestId="arrow-back-icon"
          onClick={handleBackButtonClick}
          name={Icons.BACK}
          type={IconType.OUTLINED}
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
          type={IconType.OUTLINED}
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
