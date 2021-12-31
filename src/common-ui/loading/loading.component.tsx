import React from 'react';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import './loading.component.scss';

type Props = {
  operations?: string[];
  hide?: boolean;
};
const Loading = ({ hide, operations }: Props) => {
  return (
    <div className={`loading-container ${hide ? 'hide' : ''}`}>
      <div className="overlay"></div>
      <RotatingLogoComponent></RotatingLogoComponent>
      <div className="loading-text">
        {chrome.i18n.getMessage('popup_html_loading')}
      </div>
      <div className="operations">
        {operations &&
          operations.map((operation) => (
            <span key={operation}>{chrome.i18n.getMessage(operation)}...</span>
          ))}
      </div>
    </div>
  );
};

export const LoadingComponent = Loading;
