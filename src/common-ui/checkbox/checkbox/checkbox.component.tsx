import React from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

import { I18nUtils } from 'src/utils/i18n.utils';
export interface CheckboxProps {
  onChange: (value: boolean) => void;
  title?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  checked: boolean;
  skipTranslation?: boolean;
  dataTestId?: string;
  extraDataTestIdOnInput?: string;
  disabled?: boolean;
  tooltipMessage?: string;
  skipTooltipTranslation?: boolean;
}

const handleClick = (event: React.MouseEvent<HTMLLabelElement>) => {
  event.stopPropagation();
};

const getCheckbox = (props: CheckboxProps) => {
  return (
    <label
      id={`${props.dataTestId}-inner-input`}
      className={`custom-checkbox-container ${
        props.disabled ? 'disabled' : ''
      }`}
      data-testid={props.dataTestId}
      onClick={handleClick}>
      <input
        className="native-checkbox"
        type="checkbox"
        checked={props.checked}
        disabled={props.disabled}
        aria-label={props.ariaLabel}
        aria-labelledby={props.ariaLabelledBy}
        data-testid={props.extraDataTestIdOnInput}
        onChange={(event) => props.onChange(event.target.checked)}
      />
      <span className="custom-checkbox" aria-hidden="true">
        {props.checked && <SVGIcon icon={SVGIcons.CHECKBOX_CHECKED} />}
      </span>
      <span className="label">
        {props.skipTranslation
          ? props.title
          : I18nUtils.getMessage(props.title ?? '')}
      </span>
    </label>
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
