import React from 'react';

export enum RequestItemType {
  STRING = 'STRING',
  LIST = 'LIST',
}

type Props = {
  title: string;
  content: string | string[];
  pre?: boolean; // set pre to true if we are showing a pretty printed json
  red?: boolean; // show balance red
  type?: RequestItemType;
};

const renderContent = (content: any, type: RequestItemType, red?: boolean) => {
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
  pre,
  red,
  type = RequestItemType.STRING,
}: Props) => {
  return (
    <>
      <h3>{chrome.i18n.getMessage(title)}</h3>

      {pre ? (
        <div className="operation_item_content">
          <pre>{content}</pre>
        </div>
      ) : (
        <div className={`operation_item_content ${red ? 'operation-red' : ''}`}>
          {renderContent(content, type, red)}
        </div>
      )}
    </>
  );
};

export default RequestItem;
