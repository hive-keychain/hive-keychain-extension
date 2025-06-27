import React from 'react';

export enum RequestItemType {
  STRING = 'STRING',
  LIST = 'LIST',
}

type Props = {
  title: string;
  content: string | string[];
  red?: boolean; // show balance red
  type?: RequestItemType;
  xsFont?: boolean;
};

const renderContent = (content: any, type: RequestItemType) => {
  switch (type) {
    case RequestItemType.STRING:
      return content;
    case RequestItemType.LIST:
      return (
        <ul>
          {content.map((c: string, index: number) => {
            return (
              <li className="small" key={`item-${index}`}>
                {c}
              </li>
            );
          })}
        </ul>
      );
  }
};

const RequestItem = ({
  title,
  content,
  xsFont,
  red,
  type = RequestItemType.STRING,
}: Props) => {
  return (
    <>
      <React.Fragment key={title}>
        <div className="field">
          <div className="label">{chrome.i18n.getMessage(title)}</div>
          <div
            className={`value ${xsFont ? 'xs-font' : ''} ${red ? 'red' : ''}`}>
            {renderContent(content, type)}
          </div>
        </div>
      </React.Fragment>
    </>
  );
};

export default RequestItem;
