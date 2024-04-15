import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

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
}

const ButtonComponent = (props: ButtonProps) => {
  return (
    <button
      disabled={props.disabled}
      data-testid={props.dataTestId}
      className={`submit-button ${
        props.type ? props.type : ButtonType.IMPORTANT
      }  ${props.additionalClass ?? ''} ${props.height ?? 'medium'}`}
      onClick={props.onClick}>
      <div className="button-label">
        {props.skipLabelTranslation
          ? props.label
          : chrome.i18n.getMessage(props.label, props.labelParams)}{' '}
      </div>
      {props.logo && <SVGIcon icon={props.logo} className="logo" />}
    </button>
  );
};

export default ButtonComponent;
