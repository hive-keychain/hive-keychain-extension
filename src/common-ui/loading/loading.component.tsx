import React from 'react';
import Icon from 'src/common-ui/icon/icon.component';
import { Icons } from 'src/common-ui/icons.enum';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { LoadingOperation } from 'src/popup/hive/reducers/loading.reducer';

type Props = {
  operations?: LoadingOperation[];
  caption?: string;
  hide?: boolean;
};
const Loading = ({ hide, operations, caption }: Props) => {
  return (
    <div className={`loading-container ${hide ? 'hide' : ''}`}>
      <div className="overlay"></div>
      <RotatingLogoComponent></RotatingLogoComponent>
      {caption && (
        <>
          <div className="caption">{chrome.i18n.getMessage(caption)}</div>
        </>
      )}
      {!caption && (
        <div className="loading-text">
          {chrome.i18n.getMessage('popup_html_loading')}
        </div>
      )}
      <div className="operations">
        {operations &&
          operations.map((operation) => (
            <div className="loading-operation" key={operation.name}>
              <span
                dangerouslySetInnerHTML={{
                  __html: chrome.i18n.getMessage(
                    operation.name,
                    operation.operationParams,
                  ),
                }}></span>
              {!operation.hideDots && (
                <span>
                  {operation.done ? (
                    <Icon name={Icons.DONE} additionalClassName="done"></Icon>
                  ) : (
                    '...'
                  )}
                </span>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export const LoadingComponent = Loading;
