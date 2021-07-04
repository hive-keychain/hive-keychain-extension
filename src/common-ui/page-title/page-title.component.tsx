import {navigateTo} from '@popup/actions/navigation.actions';
import {RootState} from '@popup/store';
import React from 'react';
import {connect, ConnectedProps} from 'react-redux';
import {Screen} from 'src/reference-data/screen.enum';
import './page-title.component.css';

interface PageTitleProps {
  title: string;
  isBackButtonEnabled: boolean;
  backScreen?: Screen;
  backSecondaryScreen?: Screen;
}

const PageTitle = ({
  title,
  isBackButtonEnabled,
  backScreen,
  backSecondaryScreen,
  navigateTo,
}: PropsType) => {
  const handleBackButtonClick = (): void => {
    if (isBackButtonEnabled && backScreen) {
      navigateTo(backScreen, backSecondaryScreen);
    }
  };

  return (
    <div className="title-section">
      {isBackButtonEnabled && (
        <div className="icon-button" onClick={handleBackButtonClick}></div>
      )}
      <div className="title">{chrome.i18n.getMessage(title)}</div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {navigateTo});
type PropsType = ConnectedProps<typeof connector> & PageTitleProps;

export const PageTitleComponent = connector(PageTitle);
