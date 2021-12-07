import React, { useState } from 'react';

type Props = {
  title: string;
  content: string;
  preContent: string;
  pre?: boolean; // set pre to true if we are showing a pretty printed json
};

const CollaspsibleItem = ({ title, content, pre, preContent }: Props) => {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <>
      <h3
        dangerouslySetInnerHTML={{ __html: chrome.i18n.getMessage(title) }}
        onClick={() => {
          setCollapsed(!collapsed);
        }}></h3>
      <div className={collapsed ? 'hide' : ''}>
        {pre ? (
          <div className="operation_item_content">
            <pre>{content}</pre>
          </div>
        ) : (
          <div className="operation_item_content">{content}</div>
        )}
      </div>
    </>
  );
};

export default CollaspsibleItem;
