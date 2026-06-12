import React, { useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import {
  COPY_GENERIC_MESSAGE_KEY,
  copyTextWithToast,
} from 'src/common-ui/toast/copy-toast.utils';

import { HtmlUtils } from 'src/utils/html.utils';
import { I18nUtils } from 'src/utils/i18n.utils';
type Props = {
  title: string;
  content: string;
  pre?: boolean; // set pre to true if we are showing a pretty printed json
};

const CollaspsibleItem = ({ title, content, pre }: Props) => {
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
            __html: HtmlUtils.getSafeI18nHtml(title),
          }}></div>
        <SVGIcon icon={SVGIcons.SELECT_ARROW_DOWN} />
      </div>
      <div className={collapsed ? 'hide' : 'field collapsible'}>
        <SVGIcon
          icon={SVGIcons.SELECT_COPY}
          onClick={() => void copyTextWithToast(content, COPY_GENERIC_MESSAGE_KEY)}
        />
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
