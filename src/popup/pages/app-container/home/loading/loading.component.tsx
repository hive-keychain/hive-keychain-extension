import React from 'react';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import './loading.component.scss';

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="overlay"></div>
      <RotatingLogoComponent></RotatingLogoComponent>
      <div className="loading-text">
        {chrome.i18n.getMessage('popup_html_loading')}
      </div>
    </div>
  );
};

export const LoadingComponent = Loading;
