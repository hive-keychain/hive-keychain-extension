import React, { useState } from 'react';
import { NewIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

type Props = {
  title: string;
  content: string;
  preContent?: string;
  pre?: boolean; // set pre to true if we are showing a pretty printed json
};

const CollaspsibleItem = ({ title, content, pre, preContent }: Props) => {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <>
      <div
        className="collapsible-title"
        onClick={() => {
          setCollapsed(!collapsed);
        }}>
        <div
          className="label"
          dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage(title),
          }}></div>
        <SVGIcon icon={NewIcons.SELECT_ARROW_DOWN} />
      </div>
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
