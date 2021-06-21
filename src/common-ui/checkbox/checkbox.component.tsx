import React from 'react';
import './checkbox.component.css';

interface CheckboxProps {
  onChange: (value: boolean) => void;
  title: string;
  info: string;
  checked: boolean;
}

const CheckboxComponent = (props: CheckboxProps) => {
  return (
    <div className="custom-checkbox">
      <label className="checkbox_container">
        <div className="title">{chrome.i18n.getMessage(props.title)}</div>
        <div className="info">{chrome.i18n.getMessage(props.info)}</div>
        <input
          type="checkbox"
          checked={props.checked}
          onChange={(e) => props.onChange(e.target.checked)}
        />
        <span className="checkmark" />
      </label>
    </div>
  );
};

export default CheckboxComponent;
