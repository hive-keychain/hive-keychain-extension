import React, { useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { useFieldTitle } from 'src/dialog/evm/components/use-field-title.hook';
import { I18nUtils } from 'src/utils/i18n.utils';

let longTextContentId = 0;

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
  const [contentId] = useState(
    () => `evm-request-long-text-${++longTextContentId}`,
  );

  const hasTitle = Boolean(title?.trim());
  const hasContent =
    value != null &&
    value !== false &&
    value !== '' &&
    (!Array.isArray(value) || value.length > 0);

  const showHeader =
    hasTitle ||
    (hasContent && (typeof value === 'string' || allowExpandWithoutTitle));

  const toggleContent = () => {
    if (hasContent) setIsOpened(!isOpened);
  };

  return (
    <div className="long-text-container">
      {showHeader && (
        <div
          className={`header ${isOpened ? 'open' : 'closed'}${!hasTitle ? ' header--value-only' : ''}`}
          role={hasContent ? 'button' : undefined}
          tabIndex={hasContent ? 0 : undefined}
          aria-expanded={hasContent ? isOpened : undefined}
          aria-controls={hasContent ? contentId : undefined}
          aria-label={
            hasContent && !hasTitle
              ? I18nUtils.getMessage(
                  isOpened
                    ? 'evm_security_warning_hide_details'
                    : 'evm_security_warning_show_details',
                )
              : undefined
          }
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('.warning-icon')) return;
            toggleContent();
          }}
          onKeyDown={(event) => {
            if (
              event.target !== event.currentTarget ||
              (event.key !== 'Enter' && event.key !== ' ')
            )
              return;
            event.preventDefault();
            toggleContent();
          }}>
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
        <div id={contentId} className="expandable-panel">
          <div className="expandable-panel-content">{value}</div>
        </div>
      )}
    </div>
  );
};
