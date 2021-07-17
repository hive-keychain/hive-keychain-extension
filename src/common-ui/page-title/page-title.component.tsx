import { goBack } from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './page-title.component.css';

interface PageTitleProps {
  title: string;
  isBackButtonEnabled: boolean;
}

const PageTitle = ({
  title,
  isBackButtonEnabled,
  goBack,
  canGoBack,
}: PropsType) => {
  const handleBackButtonClick = (): void => {
    if (isBackButtonEnabled) {
      goBack();
    }
  };

  return (
    <div className="title-section">
      {isBackButtonEnabled && canGoBack && (
        <div className="icon-button" onClick={handleBackButtonClick}></div>
      )}
      <div className="title">{chrome.i18n.getMessage(title)}</div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    canGoBack: state.navigation.stack.length > 1,
  };
};

const connector = connect(mapStateToProps, { goBack });
type PropsType = ConnectedProps<typeof connector> & PageTitleProps;

export const PageTitleComponent = connector(PageTitle);
