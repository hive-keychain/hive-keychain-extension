import { Checkbox } from 'pretty-checkbox-react';
import React from 'react';
import './checkbox.component.scss';

export enum LabelAlignment {
  CENTER = 'align-center',
  TOP = 'align-top',
}

interface CheckboxProps {
  onChange: (value: boolean) => void;
  title?: string;
  checked: boolean;
  skipTranslation?: boolean;
  hint?: string;
  skipHintTranslation?: boolean;
  alignment?: LabelAlignment;
}

const CheckboxComponent = (props: CheckboxProps) => {
  return (
    <div
      className={`checkbox-container ${
        props.alignment ? props.alignment : LabelAlignment.TOP
      }`}>
      <div className="checkbox-and-label">
        <Checkbox
          checked={props.checked}
          onChange={() => props.onChange(!props.checked)}></Checkbox>
        <div className="label" onClick={() => props.onChange(!props.checked)}>
          {props.skipTranslation
            ? props.title
            : chrome.i18n.getMessage(props.title ?? '')}
        </div>
      </div>
      {props.hint && (
        <div className="hint">
          {props.skipHintTranslation
            ? props.hint
            : chrome.i18n.getMessage(props.hint)}
        </div>
      )}
    </div>
  );
};

export default CheckboxComponent;
