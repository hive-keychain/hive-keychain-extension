import React from 'react';

type Props = {
  title: string;
  content: string;
  pre?: boolean; // set pre to true if we are showing a pretty printed json
  red?: boolean; // show balance red
};

const RequestItem = ({ title, content, pre, red }: Props) => {
  return (
    <>
      <h3>{chrome.i18n.getMessage(title)}</h3>

      {pre ? (
        <div className="operation_item_content">
          <pre role={'contentinfo'}>{content}</pre>
        </div>
      ) : (
        <div
          aria-label="operation_item_content"
          className={`operation_item_content ${red ? 'operation-red' : ''}`}>
          {content}
        </div>
      )}
    </>
  );
};

export default RequestItem;
