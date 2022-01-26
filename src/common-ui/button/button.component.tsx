import { Icons } from '@popup/icons.enum';
import React from 'react';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import './button.component.scss';

export enum ButtonType {
  STROKED = 'stroked',
  RAISED = 'raised',
  IMPORTANT = 'important',
  DEFAULT = 'default',
}

interface ButtonProps {
  onClick: () => void;
  label: string;
  labelParams?: string[];
  logo?: Icons | string;
  type?: ButtonType;
}

const ButtonComponent = (props: ButtonProps) => {
  return (
    <button
      className={`submit-button ${
        props.type ? props.type : ButtonType.DEFAULT
      }`}
      onClick={props.onClick}>
      <div className="button-label">
        {chrome.i18n.getMessage(props.label, props.labelParams)}{' '}
      </div>
      {props.logo && (
        <Icon
          name={props.logo}
          type={IconType.OUTLINED}
          additionalClassName="logo"></Icon>
      )}
    </button>
  );
};

export default ButtonComponent;
