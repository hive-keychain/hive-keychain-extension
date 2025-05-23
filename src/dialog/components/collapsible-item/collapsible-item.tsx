import React, { useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

type Props = {
  title: string;
  content: string;
  pre?: boolean; // set pre to true if we are showing a pretty printed json
};

const CollaspsibleItem = ({ title, content, pre }: Props) => {
  const [collapsed, setCollapsed] = useState(true);
  const [copied, setCopied] = useState(false);
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
        <SVGIcon icon={SVGIcons.SELECT_ARROW_DOWN} />
      </div>
      <div className={collapsed ? 'hide' : 'field collapsible'}>
        {copied ? (
          <SVGIcon icon={SVGIcons.CHECKBOX_CHECKED} className="checked" />
        ) : (
          <SVGIcon
            icon={SVGIcons.SELECT_COPY}
            onClick={async () => {
              await navigator.clipboard.writeText(content);
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 3000);
            }}
          />
        )}
        {pre ? (
          <div className="operation-item-content">
            <pre>{content}</pre>
          </div>
        ) : (
          <div className="operation-item-content">{content}</div>
        )}
      </div>
    </>
  );
};

export default CollaspsibleItem;
