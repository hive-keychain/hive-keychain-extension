import React, { useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { useFieldTitle } from 'src/dialog/evm/components/use-field-title.hook';

export const EvmRequestItemLongText = ({
  title,
  value,
  titleSuffix,
}: {
  title?: string;
  value: string;
  titleSuffix?: React.ReactNode;
}) => {
  const fieldTitle = useFieldTitle(title);
  const [isOpened, setIsOpened] = useState(false);

  return (
    <div className="long-text-container">
      {title && (
        <div
          className={`header ${isOpened ? 'open' : 'closed'}`}
          onClick={() => setIsOpened(!isOpened)}>
          <div className="title">
            {fieldTitle}
            {titleSuffix}
          </div>
          {value && (
            <SVGIcon
              icon={SVGIcons.GLOBAL_EXPAND_COLLAPSE}
              className="expand-collapse-icon"
            />
          )}
        </div>
      )}
      {isOpened && value && (
        <div className="expandable-panel">
          <div className="expandable-panel-content">{value}</div>
        </div>
      )}
    </div>
  );
};
