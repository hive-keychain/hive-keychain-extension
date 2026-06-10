import React from 'react';
import CheckboxComponent, {
  CheckboxProps,
} from 'src/common-ui/checkbox/checkbox/checkbox.component';
import { HtmlUtils } from 'src/utils/html.utils';

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
  return (
    <div
      className={`checkbox-panel ${
        props.backgroundType ?? BackgroundType.FILLED
      } ${props.hint ? 'has-hint' : ''} ${props.text ? 'has-text' : ''}`}>
      <CheckboxComponent {...props} />
      {props.children && props.children}
      {!props.children && (
        <>
          {props.hint && (
            <>
              {props.skipHintTranslation ? (
                <div className="hint">{props.hint}</div>
              ) : (
                <div
                  className="hint"
                  dangerouslySetInnerHTML={{
                    __html: HtmlUtils.getSafeI18nHtml(props.hint),
                  }}></div>
              )}
            </>
          )}
          {props.text && (
            <>
              {props.skipTextTranslation ? (
                <div className="text">{props.text}</div>
              ) : (
                <div
                  className="text"
                  dangerouslySetInnerHTML={{
                    __html: HtmlUtils.getSafeI18nHtml(props.text),
                  }}></div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
