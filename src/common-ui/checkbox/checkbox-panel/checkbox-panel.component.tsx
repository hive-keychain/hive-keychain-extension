import React from 'react';
import CheckboxComponent, {
  CheckboxProps,
} from 'src/common-ui/checkbox/checkbox/checkbox.component';

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

export const CheckboxPanelComponent = (props: CheckboxPanelProps) => {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    props.onChange(!props.checked);
  };

  return (
    <div
      className={`checkbox-panel ${
        props.backgroundType ?? BackgroundType.FILLED
      } ${props.hint ? 'has-hint' : ''} ${props.text ? 'has-text' : ''}`}
      onClick={handleClick}>
      <CheckboxComponent {...props} />
      {props.children && props.children}
      {!props.children && (
        <>
          {props.hint && (
            <div
              className="hint"
              dangerouslySetInnerHTML={{
                __html: props.skipHintTranslation
                  ? props.hint
                  : I18nUtils.getMessage(props.hint),
              }}></div>
          )}
          {props.text && (
            <div
              className="text"
              dangerouslySetInnerHTML={{
                __html: props.skipTextTranslation
                  ? props.text
                  : I18nUtils.getMessage(props.text),
              }}></div>
          )}
        </>
      )}
    </div>
  );
};
