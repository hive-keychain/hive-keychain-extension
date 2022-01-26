import { goBack, navigateTo } from '@popup/actions/navigation.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { Screen } from 'src/reference-data/screen.enum';
import './page-title.component.scss';

interface PageTitleProps {
  title: string;
  titleParams?: string[];
  isBackButtonEnabled: boolean;
  isCloseButtonDisabled?: boolean;
}

const PageTitle = ({
  title,
  titleParams,
  isBackButtonEnabled,
  isCloseButtonDisabled,
  goBack,
  navigateTo,
  canGoBack,
}: PropsType) => {
  const handleBackButtonClick = (): void => {
    if (isBackButtonEnabled) {
      goBack();
    }
  };
  const handleCloseButtonClick = (): void => {
    navigateTo(Screen.HOME_PAGE, true);
  };

  return (
    <div className="title-section">
      {isBackButtonEnabled && canGoBack && (
        <Icon
          onClick={handleBackButtonClick}
          name={Icons.BACK}
          type={IconType.OUTLINED}
          additionalClassName="icon-button"></Icon>
      )}
      <div className="title">{chrome.i18n.getMessage(title, titleParams)}</div>
      {!isCloseButtonDisabled && (
        <Icon
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

const connector = connect(mapStateToProps, { goBack, navigateTo });
type PropsType = ConnectedProps<typeof connector> & PageTitleProps;

export const PageTitleComponent = connector(PageTitle);
