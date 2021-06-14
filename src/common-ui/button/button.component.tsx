import React from "react";
import "./button.component.css";

interface ButtonProps {
  onClick: () => void;
  label: string;
}

const ButtonComponent = (props: ButtonProps) => {
  return (
      <button className="submit-button" onClick={props.onClick}>{chrome.i18n.getMessage(props.label)}</button>
  );
};
  
export default ButtonComponent;