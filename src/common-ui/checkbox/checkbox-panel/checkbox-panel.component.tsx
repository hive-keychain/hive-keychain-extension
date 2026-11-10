import React, { useState } from 'react';
import CheckboxComponent, {
  CheckboxProps,
} from 'src/common-ui/checkbox/checkbox/checkbox.component';

import { HtmlUtils } from 'src/utils/html.utils';
import { I18nUtils } from 'src/utils/i18n.utils';
export enum BackgroundType {
  TRANSPARENT = 'transparent',
  FILLED = 'filled',
}

interface CheckboxPanelProps extends CheckboxProps {
  backgroundType?: BackgroundType;
  hint?: string;
  skipHintTranslation?: boolean;
  text?: string;
  skipTextTranslation?: boolean;
  children?: JSX.Element;
}

let checkboxPanelIdCounter = 0;

export const CheckboxPanelComponent = (props: CheckboxPanelProps) => {
  const [contentId] = useState(
    () => `keychain-checkbox-panel-content-${++checkboxPanelIdCounter}`,
  );

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const element =
      event.target instanceof Element
        ? event.target
        : event.target instanceof Node
          ? event.target.parentElement
          : null;

    if (element?.closest('a')) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();
    if (!props.disabled) {
      props.onChange(!props.checked);
    }
  };

  const ariaLabelledBy = !props.title && props.text ? contentId : undefined;

  return (
    <div
      className={`checkbox-panel ${
        props.backgroundType ?? BackgroundType.FILLED
      } ${props.hint ? 'has-hint' : ''} ${props.text ? 'has-text' : ''}`}
      onClick={handleClick}>
      <CheckboxComponent {...props} ariaLabelledBy={ariaLabelledBy} />
      {props.children && props.children}
      {!props.children && (
        <>
          {props.hint && (
            <div
              className="hint"
              dangerouslySetInnerHTML={{
                __html: props.skipHintTranslation
                  ? HtmlUtils.escapeHtml(props.hint)
                  : HtmlUtils.getSafeI18nHtml(props.hint),
              }}></div>
          )}
          {props.text && (
            <div
              id={contentId}
              className="text"
              dangerouslySetInnerHTML={{
                __html: props.skipTextTranslation
                  ? HtmlUtils.escapeHtml(props.text)
                  : HtmlUtils.getSafeI18nHtml(props.text),
              }}></div>
          )}
        </>
      )}
    </div>
  );
};
