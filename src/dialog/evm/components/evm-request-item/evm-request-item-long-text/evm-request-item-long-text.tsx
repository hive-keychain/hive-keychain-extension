import React, { useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { useFieldTitle } from 'src/dialog/evm/components/use-field-title.hook';

export const EvmRequestItemLongText = ({
  title,
  value,
}: {
  title?: string;
  value: string;
}) => {
  const fieldTitle = useFieldTitle(title);
  const [isOpened, setIsOpened] = useState(false);

  return (
    <div className="long-text-container">
      {title && (
        <div
          className={`header ${isOpened ? 'open' : 'closed'}`}
          onClick={() => setIsOpened(!isOpened)}>
          <div className="title">{fieldTitle}</div>
          <SVGIcon
            icon={SVGIcons.GLOBAL_EXPAND_COLLAPSE}
            className="expand-collapse-icon"
          />
        </div>
      )}
      {isOpened && (
        <div className="expandable-panel">
          <div className="expandable-panel-content">{value}</div>
        </div>
      )}
    </div>
  );
};
