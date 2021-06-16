import React from "react";
import { InputType } from "./input-type.enum";
import "./input.component.css";

interface InputProps {
  onChange: (value: string) => void;
  value: string;
  logo: string;
  placeholder: string;
  type: InputType;
}

const InputComponent = (props: InputProps) => {
  
  return (
    <div className="input-container">
      <input type={props.type} placeholder={chrome.i18n.getMessage(props.placeholder)} value={props.value} onChange={(e) => props.onChange(e.target.value)}/>
      <img src={`/assets/images/${props.logo}.png`} className="input-img" />
    </div>
  );
};
  
export default InputComponent;