import { Icons } from '@popup/icons.enum';
import { LoadingOperation } from '@popup/reducers/loading.reducer';
import React from 'react';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import './loading.component.scss';

type Props = {
  operations?: LoadingOperation[];
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
            <span key={operation.name}>
              {chrome.i18n.getMessage(operation.name)}
              {operation.done ? (
                <span className="material-icons done">{Icons.DONE}</span>
              ) : (
                '...'
              )}
            </span>
          ))}
      </div>
    </div>
  );
};

export const LoadingComponent = Loading;
