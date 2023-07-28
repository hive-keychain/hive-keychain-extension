import React from 'react';
import './balance-section.component.scss';
interface Props {
  value: number | string;
  unit: string;
  label?: string;
  skipLabelTranslation?: boolean;
}

export const BalanceSectionComponent = ({
  value,
  unit,
  label,
  skipLabelTranslation,
}: Props) => {
  return (
    <div className="balance-section">
      <div className="value">
        {value} {unit}
      </div>
      {label && (
        <div className="label">
          {skipLabelTranslation ? label : chrome.i18n.getMessage(label)}
        </div>
      )}
    </div>
  );
};
