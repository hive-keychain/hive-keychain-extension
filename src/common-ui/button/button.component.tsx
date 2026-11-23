import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

import { I18nUtils } from 'src/utils/i18n.utils';
export enum ButtonType {
  IMPORTANT = 'important',
  ALTERNATIVE = 'alternative',
}

export interface ButtonProps {
  onClick: (event?: any) => void;
  label: string;
  skipLabelTranslation?: boolean;
  labelParams?: string[];
  logo?: SVGIcons;
  type?: ButtonType;
  dataTestId?: string;
  additionalClass?: string;
  height?: 'tall' | 'medium' | 'small';
  disabled?: boolean;
  loading?: boolean;
}

const ButtonComponent = (props: ButtonProps) => {
  const isDisabled = props.disabled || props.loading;

  return (
    <button
      disabled={isDisabled}
      data-testid={props.dataTestId}
      aria-busy={props.loading || undefined}
      aria-label={
        props.loading ? I18nUtils.getMessage('popup_html_loading') : undefined
      }
      className={`submit-button ${
        props.type ? props.type : ButtonType.IMPORTANT
      }  ${props.additionalClass ?? ''} ${props.height ?? 'medium'} ${
        props.disabled ? 'disabled' : ''
      } ${props.loading ? 'loading' : ''}`}
      onClick={props.onClick}>
      {props.loading ? (
        <span className="button-loading-spinner" aria-hidden />
      ) : (
        <>
          <div className="button-label">
            {props.skipLabelTranslation
              ? props.label
              : I18nUtils.getMessage(props.label, props.labelParams)}{' '}
          </div>
          {props.logo && <SVGIcon icon={props.logo} className="logo" />}
        </>
      )}
    </button>
  );
};

export default ButtonComponent;
