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
  const hasContent =
    value != null &&
    value !== false &&
    value !== '' &&
    (!Array.isArray(value) || value.length > 0);

  const showHeader =
    hasTitle ||
    (hasContent && (typeof value === 'string' || allowExpandWithoutTitle));

  return (
    <div className="long-text-container">
      {showHeader && (
        <div
          className={`header ${isOpened ? 'open' : 'closed'}${!hasTitle ? ' header--value-only' : ''}`}
          onClick={() => hasContent && setIsOpened(!isOpened)}>
          <div className="title">
            {hasTitle ? (fieldTitle ?? title) : null}
            {titleSuffix}
          </div>
          {hasContent && (
            <SVGIcon
              icon={SVGIcons.GLOBAL_EXPAND_COLLAPSE}
              className={`expand-collapse-icon ${
                isOpened ? 'open' : 'closed'
              }`}
            />
          )}
        </div>
      )}
      {isOpened && hasContent && (
        <div className="expandable-panel">
          <div className="expandable-panel-content">{value}</div>
        </div>
      )}
    </div>
  );
};
