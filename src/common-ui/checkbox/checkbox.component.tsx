import React from 'react';
import './checkbox.component.scss';

interface CheckboxProps {
  onChange: (value: boolean) => void;
  title: string;
  info?: string;
  checked: boolean;
  skipTranslation?: boolean;
}

const CheckboxComponent = (props: CheckboxProps) => {
  return (
    <div className="custom-checkbox">
      <label className="checkbox_container">
        <div className="title">
          {props.skipTranslation
            ? props.title
            : chrome.i18n.getMessage(props.title)}
        </div>
        {props.info && (
          <div className="info">{chrome.i18n.getMessage(props.info)}</div>
        )}
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
