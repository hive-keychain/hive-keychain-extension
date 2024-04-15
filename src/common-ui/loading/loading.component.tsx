import { LoadingOperation } from '@popup/multichain/reducers/loading.reducer';
import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

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
          <div className="loading-caption">
            {chrome.i18n.getMessage(caption)}
          </div>
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
                <div>
                  {operation.done ? (
                    <SVGIcon
                      className="icon-done"
                      icon={SVGIcons.MESSAGE_SUCCESS}
                    />
                  ) : (
                    '...'
                  )}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export const LoadingComponent = Loading;
