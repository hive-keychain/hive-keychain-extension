import { Checkbox } from 'pretty-checkbox-react';
import React from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
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
  dataTestId?: string;
  extraDataTestIdOnInput?: string;
  disabled?: boolean;
  tooltipMessage?: string;
  skipTooltipTranslation?: boolean;
}

const handleClick = (props: CheckboxProps) => {
  if (!props.disabled) {
    props.onChange(!props.checked);
  }
};

const getCheckbox = (props: CheckboxProps) => {
  return (
    <div
      className={`checkbox-container ${
        props.alignment ? props.alignment : LabelAlignment.TOP
      } ${props.disabled ? 'disabled' : ''}`}>
      <div className="checkbox-and-label">
        <Checkbox
          id={`${props.dataTestId}-inner-input`}
          data-testid={props.extraDataTestIdOnInput}
          checked={props.checked}
          onChange={() => handleClick(props)}></Checkbox>
        <div
          data-testid={props.dataTestId}
          className="label"
          onClick={() => handleClick(props)}>
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

const CheckboxComponent = (props: CheckboxProps) => {
  if (!props.tooltipMessage) {
    return getCheckbox(props);
  } else
    return (
      <CustomTooltip
        position={'top'}
        message={props.tooltipMessage}
        skipTranslation={props.skipTooltipTranslation}>
        {getCheckbox(props)}
      </CustomTooltip>
    );
};

export default CheckboxComponent;
