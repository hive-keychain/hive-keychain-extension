import React from 'react';
import './footer-button.scss';

interface ButtonProps {
  onClick: () => void;
  label: string;
  grey?: boolean;
}

const FooterButton = (props: ButtonProps) => {
  return (
    <button
      className={`footer-button ${props.grey ? 'grey' : ''}`}
      onClick={props.onClick}>
      <div className="button-label">{chrome.i18n.getMessage(props.label)}</div>
    </button>
  );
};

export default FooterButton;
