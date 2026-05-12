import React, { useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { useFieldTitle } from 'src/dialog/evm/components/use-field-title.hook';

export const EvmRequestItemLongText = ({
  title,
  value,
  titleSuffix,
  allowExpandWithoutTitle = false,
}: {
  title?: string;
  value: React.ReactNode;
  titleSuffix?: React.ReactNode;
  /** When true, show expand/collapse header even if `title` is empty and `value` is not a string. */
  allowExpandWithoutTitle?: boolean;
}) => {
  const fieldTitle = useFieldTitle(title);
  const [isOpened, setIsOpened] = useState(false);

  const hasTitle = Boolean(title?.trim());

  const showHeader =
    value != null &&
    value !== '' &&
    (hasTitle || typeof value === 'string' || allowExpandWithoutTitle);

  return (
    <div className="long-text-container">
      {showHeader && (
        <div
          className={`header ${isOpened ? 'open' : 'closed'}${!hasTitle ? ' header--value-only' : ''}`}
          onClick={() => setIsOpened(!isOpened)}>
          <div className="title">
            {hasTitle ? (fieldTitle ?? title) : null}
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
