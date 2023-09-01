import React from 'react';
import Icon from 'src/common-ui/icon/icon.component';
import { Icons } from 'src/common-ui/icons.enum';

interface WitnessInfoDataProps {
  label: string;
  skipLabelTranslation?: boolean;
  value: string | number;
  valueIcon?: Icons;
  valueOnClickAction?: (...params: any[]) => any;
  extraInfo?: string;
  extraInfoAdditionalClass?: string;
}

export const WitnessInfoDataComponent = ({
  label,
  skipLabelTranslation,
  value,
  valueIcon,
  valueOnClickAction,
  extraInfo,
  extraInfoAdditionalClass,
}: WitnessInfoDataProps) => {
  const handleOnValueClick = () => {
    if (valueOnClickAction) {
      valueOnClickAction();
    }
  };

  return (
    <div className="witness-info-data">
      <div className="label">
        {skipLabelTranslation ? label : chrome.i18n.getMessage(label)}
      </div>
      <div
        className={`value ${valueOnClickAction ? 'clickable' : ''}`}
        onClick={handleOnValueClick}>
        <>
          <span>{value}</span>
          {valueIcon && <Icon name={valueIcon} />}
        </>
      </div>
      {extraInfo && (
        <div className={`extra-info ${extraInfoAdditionalClass ?? ''}`}>
          {extraInfo}
        </div>
      )}
    </div>
  );
};
