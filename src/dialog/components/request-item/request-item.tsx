import React from 'react';

type Props = {
  title: string;
  content: string;
  pre?: boolean; // set pre to true if we are showing a pretty printed json
};

const RequestItem = ({ title, content, pre }: Props) => {
  return (
    <>
      <h3>{chrome.i18n.getMessage(title)}</h3>

      {pre ? (
        <div className="operation_item_content">
          <pre>{content}</pre>
        </div>
      ) : (
        <div className="operation_item_content">{content}</div>
      )}
    </>
  );
};

export default RequestItem;
