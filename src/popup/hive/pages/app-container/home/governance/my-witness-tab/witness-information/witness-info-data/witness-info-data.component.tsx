import React from 'react';

import { I18nUtils } from 'src/utils/i18n.utils';
interface WitnessInfoDataProps {
  label: string;
  skipLabelTranslation?: boolean;
  value: string | number;
  valueOnClickAction?: (...params: any[]) => any;
  extraInfo?: string;
  extraInfoAdditionalClass?: string;
}

export const WitnessInfoDataComponent = ({
  label,
  skipLabelTranslation,
  value,
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
        {skipLabelTranslation ? label : I18nUtils.getMessage(label)}
      </div>
      <div
        className={`value ${valueOnClickAction ? 'clickable' : ''}`}
        onClick={handleOnValueClick}>
        <>
          <span>{value}</span>
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
