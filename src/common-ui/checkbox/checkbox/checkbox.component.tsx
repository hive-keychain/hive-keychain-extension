import React from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

export interface CheckboxProps {
  onChange: (value: boolean) => void;
  title?: string;
  checked: boolean;
  skipTranslation?: boolean;
  dataTestId?: string;
  extraDataTestIdOnInput?: string;
  disabled?: boolean;
  tooltipMessage?: string;
  skipTooltipTranslation?: boolean;
}

const handleClick = (props: CheckboxProps) => {
  if (props.disabled !== true) {
    props.onChange(!props.checked);
  }
};

const getCheckbox = (props: CheckboxProps) => {
  return (
    <div
      id={`${props.dataTestId}-inner-input`}
      className={`custom-checkbox-container ${
        props.disabled ? 'disabled' : ''
      }`}
      data-testid={props.extraDataTestIdOnInput}
      onClick={() => handleClick(props)}>
      <div className="custom-checkbox">
        {props.checked && <SVGIcon icon={SVGIcons.CHECKBOX_CHECKED} />}
      </div>
      <div className="label">
        {props.skipTranslation
          ? props.title
          : chrome.i18n.getMessage(props.title ?? '')}
      </div>
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
