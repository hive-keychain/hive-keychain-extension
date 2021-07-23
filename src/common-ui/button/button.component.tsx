import React from 'react';
import './button.component.scss';

interface ButtonProps {
  onClick: () => void;
  label: string;
  logo?: string;
}

const ButtonComponent = (props: ButtonProps) => {
  return (
    <button className="submit-button" onClick={props.onClick}>
      <div className="button-label">{chrome.i18n.getMessage(props.label)} </div>
      {props.logo && <img src={`/assets/images/${props.logo}.png`} />}
    </button>
  );
};

export default ButtonComponent;
