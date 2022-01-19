import React from 'react';
import './button.component.scss';

export enum ButtonType {
  STROKED = 'stroked',
  RAISED = 'raised',
  IMPORTANT = 'important',
}

interface ButtonProps {
  onClick: () => void;
  label: string;
  labelParams?: string[];
  logo?: string;
  type?: ButtonType;
}

const ButtonComponent = (props: ButtonProps) => {
  return (
    <button
      className={`submit-button ${
        props.type ? props.type : ButtonType.STROKED
      }`}
      onClick={props.onClick}>
      <div className="button-label">
        {chrome.i18n.getMessage(props.label, props.labelParams)}{' '}
      </div>
      {props.logo && (
        <span className="material-icons-outlined logo">{props.logo}</span>
      )}
    </button>
  );
};

export default ButtonComponent;
